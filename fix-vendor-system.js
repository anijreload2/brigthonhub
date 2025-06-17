const { execSql, execRawSql, createExecSqlFunction, supabaseAdmin } = require('./exec-sql');

async function fixVendorApplicationsTable() {
  console.log('🔧 FIXING VENDOR APPLICATIONS SYSTEM\n');
  
  // Step 1: Create exec_sql function if needed
  console.log('Step 1: Setting up SQL execution function...');
  await createExecSqlFunction();
  // Step 2: Check current table structure
  console.log('\nStep 2: Checking current vendor_applications table...');
  let tableExists = false;
  let tableInfo = null;
  
  try {
    const { data: testQuery, error: testError } = await supabaseAdmin
      .from('vendor_applications')
      .select('*')
      .limit(1);
      
    if (testError) {
      if (testError.message?.includes('does not exist') || testError.code === '42P01') {
        console.log('❌ vendor_applications table does not exist!');
        tableExists = false;
      } else {
        console.error('❌ Error checking table:', testError);
        return false;
      }
    } else {
      console.log('✅ vendor_applications table exists');
      tableExists = true;
    }
  } catch (err) {
    console.log('❌ vendor_applications table does not exist!');
    tableExists = false;
  }  
  if (!tableExists) {
    console.log('❌ vendor_applications table does not exist!');
    
    // Create the table from scratch
    const createTableSQL = `
CREATE TABLE vendor_applications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL,
  categories text[] NOT NULL,
  business_name text NOT NULL,
  business_description text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  business_address text,
  website_url text,
  social_media jsonb,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at timestamp without time zone,
  reviewed_by text,
  admin_notes text,
  documents text[],
  verification_data jsonb,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
    `;
    
    const success = await execSql(createTableSQL, 'Creating vendor_applications table');
    if (!success) return false;  } else {
    console.log('✅ vendor_applications table exists');
  }
  
  // Step 3: Fix ID column to have default UUID generation (skip if table was just created)
  console.log('\nStep 3: Ensuring ID column has UUID default...');
  if (tableExists) {
    const fixIdSQL = `ALTER TABLE vendor_applications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;`;
    await execSql(fixIdSQL, 'Adding UUID default to ID column');
  } else {
    console.log('✅ New table already has UUID default for ID');
  }
  
  // Step 4: Enable RLS
  console.log('\nStep 4: Enabling Row Level Security...');
  await execSql(
    'ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;',
    'Enabling RLS on vendor_applications'
  );
  
  // Step 5: Drop existing policies
  console.log('\nStep 5: Cleaning up old policies...');
  const policies = [
    'Users can view own applications',
    'Users can create applications', 
    'Users can update own pending applications',
    'Admins can view all applications',
    'Admins can update applications'
  ];
  
  for (const policy of policies) {
    await execSql(
      `DROP POLICY IF EXISTS "${policy}" ON vendor_applications;`,
      `Dropping policy: ${policy}`
    );
  }
  
  // Step 6: Create comprehensive RLS policies
  console.log('\nStep 6: Creating RLS policies...');
  
  const rlsPolicies = [
    {
      name: 'Users can view own applications',
      sql: `CREATE POLICY "Users can view own applications" ON vendor_applications
        FOR SELECT USING (auth.uid()::text = user_id);`
    },
    {
      name: 'Users can create applications',
      sql: `CREATE POLICY "Users can create applications" ON vendor_applications
        FOR INSERT WITH CHECK (auth.uid()::text = user_id);`
    },
    {
      name: 'Users can update own pending applications',
      sql: `CREATE POLICY "Users can update own pending applications" ON vendor_applications
        FOR UPDATE USING (auth.uid()::text = user_id AND status = 'pending');`
    },
    {
      name: 'Admins can view all applications',
      sql: `CREATE POLICY "Admins can view all applications" ON vendor_applications
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'ADMIN'
          )
        );`
    },
    {
      name: 'Admins can update applications',
      sql: `CREATE POLICY "Admins can update applications" ON vendor_applications
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'ADMIN'
          )
        );`
    }
  ];
  
  for (const policy of rlsPolicies) {
    await execSql(policy.sql, `Creating policy: ${policy.name}`);
  }
  
  // Step 7: Create indexes
  console.log('\nStep 7: Creating performance indexes...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS vendor_applications_user_id_idx ON vendor_applications(user_id);',
    'CREATE INDEX IF NOT EXISTS vendor_applications_status_idx ON vendor_applications(status);',
    'CREATE INDEX IF NOT EXISTS vendor_applications_submitted_at_idx ON vendor_applications(submitted_at);'
  ];
  
  for (const indexSQL of indexes) {
    await execSql(indexSQL, 'Creating index');
  }
  
  // Step 8: Create vendor approval function and trigger
  console.log('\nStep 8: Creating vendor approval automation...');
  
  const approvalFunctionSQL = `
CREATE OR REPLACE FUNCTION handle_vendor_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When application is approved, update user role to VENDOR
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE users 
    SET role = 'VENDOR', updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Log the role change (only if admin_activities table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_activities') THEN
      INSERT INTO admin_activities (
        id, 
        user_id, 
        action, 
        details, 
        created_at
      ) VALUES (
        gen_random_uuid()::text,
        NEW.reviewed_by,
        'vendor_approval',
        jsonb_build_object(
          'vendor_user_id', NEW.user_id,
          'business_name', NEW.business_name,
          'categories', NEW.categories
        ),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  await execSql(approvalFunctionSQL, 'Creating vendor approval function');
  
  const triggerSQL = `
DROP TRIGGER IF EXISTS vendor_approval_trigger ON vendor_applications;
CREATE TRIGGER vendor_approval_trigger
  AFTER UPDATE ON vendor_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_vendor_approval();
  `;
  
  await execSql(triggerSQL, 'Creating vendor approval trigger');
  
  // Step 9: Grant permissions
  console.log('\nStep 9: Setting up permissions...');
  const permissions = [
    'GRANT SELECT, INSERT, UPDATE ON vendor_applications TO authenticated;',
    'GRANT SELECT, UPDATE ON users TO authenticated;'
  ];
  
  for (const permSQL of permissions) {
    await execSql(permSQL, 'Granting permissions');
  }
  
  // Step 10: Test the setup
  console.log('\nStep 10: Testing the vendor applications system...');
  
  // Check if we can query the table
  const { data: testData, error: testError } = await supabaseAdmin
    .from('vendor_applications')
    .select('count(*)')
    .limit(1);
    
  if (testError) {
    console.error('❌ Test query failed:', testError);
    return false;
  }
  
  console.log('✅ Vendor applications system is working!');
  console.log(`   Current applications count: ${testData?.[0]?.count || 0}`);
  
  console.log('\n🎉 VENDOR APPLICATIONS SYSTEM FIXED SUCCESSFULLY!');
  console.log('\nKey improvements made:');
  console.log('✅ Auto-generating UUIDs for ID field');
  console.log('✅ Comprehensive RLS policies for users and admins');
  console.log('✅ Automatic role promotion when approved');
  console.log('✅ Activity logging for approvals');
  console.log('✅ Performance indexes added');
  console.log('✅ Proper permissions configured');
  
  return true;
}

// Run the fix if called directly
if (require.main === module) {
  (async () => {
    const success = await fixVendorApplicationsTable();
    process.exit(success ? 0 : 1);
  })();
}

module.exports = { fixVendorApplicationsTable };
