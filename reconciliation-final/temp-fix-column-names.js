const fs = require('fs');
const path = require('path');

// Temporary fix: Change code to use camelCase column names to match current database
const fixes = [
  // Frontend pages that query category tables
  {
    file: '../app/blog/page.tsx',
    replacements: [
      { from: 'is_active=eq.true', to: 'isActive=eq.true' }
    ]
  },
  {
    file: '../app/projects/page.tsx', 
    replacements: [
      { from: 'is_active=eq.true', to: 'isActive=eq.true' }
    ]
  },
  {
    file: '../app/store/page.tsx',
    replacements: [
      { from: 'is_active=eq.true', to: 'isActive=eq.true' }
    ]
  },
  {
    file: '../app/food/page.tsx',
    replacements: [
      { from: 'is_active=eq.true', to: 'isActive=eq.true' }
    ]
  },
  {
    file: '../app/properties/page.tsx',
    replacements: [
      { from: 'is_active=eq.true', to: 'isActive=eq.true' }
    ]
  },
  // Admin components
  {
    file: '../components/admin/BlogTab.tsx',
    replacements: [
      { from: '.eq(\'is_active\', true)', to: '.eq(\'isActive\', true)' }
    ]
  },
  {
    file: '../components/admin/ProjectsTab.tsx',
    replacements: [
      { from: '.eq(\'is_active\', true)', to: '.eq(\'isActive\', true)' }
    ]
  },
  {
    file: '../components/admin/MarketplaceTab.tsx',
    replacements: [
      { from: '.eq(\'is_active\', true)', to: '.eq(\'isActive\', true)' }
    ]
  },
  {
    file: '../components/admin/FoodTab.tsx',
    replacements: [
      { from: '.eq(\'is_active\', true)', to: '.eq(\'isActive\', true)' }
    ]
  }
];

function applyFix(filePath, replacements) {
  const fullPath = path.resolve(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${fullPath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changes = 0;

    for (const { from, to } of replacements) {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, to);
        changes += matches.length;
      }
    }

    if (changes > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${changes} references in ${filePath}`);
      return true;
    } else {
      console.log(`🔍 No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Applying temporary fixes to match current database schema...\n');
  
  let totalFixed = 0;
  
  for (const fix of fixes) {
    if (applyFix(fix.file, fix.replacements)) {
      totalFixed++;
    }
  }
  
  console.log(`\n🎉 Applied fixes to ${totalFixed} files`);
  console.log('\n📋 Next steps:');
  console.log('1. Run the SQL commands in fix-database-schema.sql in Supabase dashboard');
  console.log('2. After database columns are renamed, run fix-all-snake-case.js again');
  console.log('3. Test the application to ensure everything works');
}

main();
