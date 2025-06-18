const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function comprehensiveSystemCheck() {
  console.log('🔍 COMPREHENSIVE BRIGHTON HUB SYSTEM CHECK');
  console.log('='.repeat(60));
  console.log('Checking ALL features and their database dependencies...\n');

  // Define all expected tables for each feature
  const featureRequirements = {
    'FOOD MARKETPLACE': {
      tables: ['food_items', 'food_categories', 'vendors'],
      relationships: [
        { table: 'food_items', foreign_key: 'category_id', references: 'food_categories' },
        { table: 'food_items', foreign_key: 'vendor_id', references: 'vendors' }
      ],
      critical_columns: {
        'food_items': ['id', 'name', 'description', 'category_id', 'price', 'is_active', 'vendor_id', 'images'],
        'food_categories': ['id', 'name', 'is_active'],
        'vendors': ['id', 'name', 'email', 'phone', 'is_active']
      }
    },
    'PROPERTIES': {
      tables: ['properties', 'property_categories', 'agents'],
      relationships: [
        { table: 'properties', foreign_key: 'category_id', references: 'property_categories' },
        { table: 'properties', foreign_key: 'agent_id', references: 'agents' }
      ],
      critical_columns: {
        'properties': ['id', 'title', 'description', 'category_id', 'price', 'is_active', 'agent_id', 'images'],
        'property_categories': ['id', 'name', 'is_active'],
        'agents': ['id', 'name', 'email', 'phone']
      }
    },
    'PROJECTS': {
      tables: ['projects', 'project_categories', 'contractors'],
      relationships: [
        { table: 'projects', foreign_key: 'category_id', references: 'project_categories' },
        { table: 'projects', foreign_key: 'contractor_id', references: 'contractors' }
      ],
      critical_columns: {
        'projects': ['id', 'title', 'description', 'category_id', 'is_active', 'before_images', 'after_images'],
        'project_categories': ['id', 'name', 'is_active'],
        'contractors': ['id', 'name', 'email', 'phone']
      }
    },
    'MARKETPLACE/STORE': {
      tables: ['store_products', 'store_categories', 'vendors'],
      relationships: [
        { table: 'store_products', foreign_key: 'category_id', references: 'store_categories' },
        { table: 'store_products', foreign_key: 'vendor_id', references: 'vendors' }
      ],
      critical_columns: {
        'store_products': ['id', 'name', 'description', 'category_id', 'price', 'is_active', 'vendor_id', 'images'],
        'store_categories': ['id', 'name', 'is_active'],
        'vendors': ['id', 'name', 'email', 'phone', 'is_active']
      }
    },
    'AI TRAINING': {
      tables: ['ai_training_data'],
      relationships: [],
      critical_columns: {
        'ai_training_data': ['id', 'title', 'content', 'category', 'is_active', 'created_at', 'updated_at']
      }
    },
    'BLOG': {
      tables: ['blogs', 'blog_categories', 'blog_posts'],
      relationships: [
        { table: 'blogs', foreign_key: 'category_id', references: 'blog_categories' },
        { table: 'blog_posts', foreign_key: 'category_id', references: 'blog_categories' }
      ],
      critical_columns: {
        'blogs': ['id', 'title', 'content', 'category_id', 'is_active', 'created_at'],
        'blog_posts': ['id', 'title', 'content', 'category_id', 'is_active', 'created_at'],
        'blog_categories': ['id', 'name', 'is_active']
      }
    },
    'USERS & PROFILES': {
      tables: ['user_profiles', 'users'],
      relationships: [
        { table: 'user_profiles', foreign_key: 'user_id', references: 'users' }
      ],
      critical_columns: {
        'user_profiles': ['id', 'user_id', 'first_name', 'last_name', 'business_name'],
        'users': ['id', 'email', 'role']
      }
    },
    'VENDOR SYSTEM': {
      tables: ['vendors', 'vendor_applications', 'vendor_products'],
      relationships: [
        { table: 'vendor_products', foreign_key: 'vendor_id', references: 'vendors' }
      ],
      critical_columns: {
        'vendors': ['id', 'name', 'email', 'phone', 'is_active', 'status'],
        'vendor_applications': ['id', 'business_name', 'email', 'status'],
        'vendor_products': ['id', 'vendor_id', 'name', 'price', 'is_active']
      }
    },
    'ADMIN SYSTEM': {
      tables: ['admin_users', 'admin_activities', 'admin_settings'],
      relationships: [],
      critical_columns: {
        'admin_users': ['id', 'email', 'role', 'is_active'],
        'admin_activities': ['id', 'admin_id', 'action', 'created_at'],
        'admin_settings': ['id', 'key', 'value']
      }
    },
    'TESTIMONIALS': {
      tables: ['testimonials'],
      relationships: [],
      critical_columns: {
        'testimonials': ['id', 'name', 'content', 'rating', 'is_active', 'created_at']
      }
    },
    'MESSAGES & CONTACT': {
      tables: ['messages', 'contact_messages'],
      relationships: [],
      critical_columns: {
        'messages': ['id', 'name', 'email', 'message', 'created_at'],
        'contact_messages': ['id', 'name', 'email', 'message', 'created_at']
      }
    }
  };

  let totalIssues = 0;
  let criticalIssues = [];

  for (const [featureName, requirements] of Object.entries(featureRequirements)) {
    console.log(`\n🎯 FEATURE: ${featureName}`);
    console.log('='.repeat(40));

    let featureIssues = 0;
    
    // Check each required table
    for (const tableName of requirements.tables) {
      console.log(`\n📊 Checking table: ${tableName}`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
            console.log(`   ❌ CRITICAL: Table ${tableName} DOES NOT EXIST`);
            criticalIssues.push(`${featureName}: Missing table ${tableName}`);
            featureIssues++;
            continue;
          } else {
            console.log(`   ⚠️  Error accessing ${tableName}: ${error.message}`);
            featureIssues++;
            continue;
          }
        }

        console.log(`   ✅ Table ${tableName} exists`);
        
        // Check critical columns if table exists
        if (requirements.critical_columns[tableName]) {
          const requiredColumns = requirements.critical_columns[tableName];
          
          if (data && data.length > 0) {
            const actualColumns = Object.keys(data[0]);
            const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col));
            
            if (missingColumns.length > 0) {
              console.log(`   ❌ Missing columns in ${tableName}: ${missingColumns.join(', ')}`);
              criticalIssues.push(`${featureName}: Missing columns in ${tableName}: ${missingColumns.join(', ')}`);
              featureIssues++;
            } else {
              console.log(`   ✅ All required columns present`);
            }
            
            // Check for camelCase columns that need fixing
            const camelCaseColumns = actualColumns.filter(col => {
              return /^[a-z]+([A-Z][a-z]*)+$/.test(col) && col !== col.toLowerCase();
            });
            
            if (camelCaseColumns.length > 0) {
              console.log(`   🔸 CamelCase columns need fixing: ${camelCaseColumns.join(', ')}`);
              featureIssues++;
            }
          } else {
            console.log(`   📋 Table ${tableName} is empty - cannot verify columns`);
          }
        }
        
      } catch (err) {
        console.log(`   ❌ Exception checking ${tableName}: ${err.message}`);
        featureIssues++;
      }
    }
    
    // Check relationships
    for (const relationship of requirements.relationships) {
      console.log(`\n🔗 Checking relationship: ${relationship.table}.${relationship.foreign_key} → ${relationship.references}`);
      
      try {
        // Try to do a simple join to test the relationship
        const { data, error } = await supabase
          .from(relationship.table)
          .select(`*, ${relationship.references}(*)`)
          .limit(1);
          
        if (error) {
          console.log(`   ❌ Relationship broken: ${error.message}`);
          criticalIssues.push(`${featureName}: Broken relationship ${relationship.table} → ${relationship.references}`);
          featureIssues++;
        } else {
          console.log(`   ✅ Relationship working`);
        }
      } catch (err) {
        console.log(`   ❌ Relationship error: ${err.message}`);
        featureIssues++;
      }
    }

    // Feature summary
    if (featureIssues === 0) {
      console.log(`\n✅ ${featureName} - ALL CHECKS PASSED`);
    } else {
      console.log(`\n❌ ${featureName} - ${featureIssues} ISSUES FOUND`);
      totalIssues += featureIssues;
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 COMPREHENSIVE CHECK SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  if (totalIssues === 0) {
    console.log('✅ ALL FEATURES WORKING PERFECTLY!');
  } else {
    console.log(`❌ TOTAL ISSUES FOUND: ${totalIssues}`);
    console.log(`\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:`);
    criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log(`\n${'='.repeat(60)}`);
}

async function main() {
  try {
    await comprehensiveSystemCheck();
  } catch (error) {
    console.error('❌ System check failed:', error);
  }
}

main();
