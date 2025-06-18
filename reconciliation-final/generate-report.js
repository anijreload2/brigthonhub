const fs = require('fs');
const path = require('path');

function generateReconciliationReport() {
  // Read the results
  const resultsPath = path.join(__dirname, 'table-check-results.json');
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  const markdown = `# 🗃️ DATABASE RECONCILIATION REPORT - FINAL

**Generated:** ${results.timestamp}  
**Total Tables Checked:** ${results.table_summary.total_checked}  
**Total Columns Found:** ${results.table_summary.total_columns}

---

## 📊 SUMMARY

| Metric | Count | Status |
|--------|--------|--------|
| **Existing Tables** | ${results.table_summary.existing_count} | ✅ |
| **Missing Tables** | ${results.table_summary.missing_count} | ❌ |
| **Total Columns** | ${results.table_summary.total_columns} | 📋 |

---

## ✅ EXISTING TABLES

${Object.entries(results.existing_tables).map(([tableName, tableInfo]) => {
  const snakeCase = tableInfo.columns.filter(col => col.includes('_'));
  const camelCase = tableInfo.columns.filter(col => /[A-Z]/.test(col) && !col.includes('_'));
  const duplicates = findDuplicates(tableInfo.columns);
  
  return `### \`${tableName}\` (${tableInfo.column_count} columns)

**Status:** ${tableInfo.has_data ? '🟢 Has Data' : '🟡 Empty'}  
**Naming:** ${camelCase.length === 0 ? '✅ All snake_case' : 
             snakeCase.length === 0 ? '⚠️ All camelCase' : '🔴 Mixed naming'}  
**Duplicates:** ${duplicates.length > 0 ? '🔴 Found duplicates' : '✅ No duplicates'}

**Columns:**
\`\`\`
${tableInfo.columns.join(', ')}
\`\`\`

${duplicates.length > 0 ? `**🔴 DUPLICATE COLUMNS FOUND:**
${duplicates.map(dup => `- \`${dup.snake}\` vs \`${dup.camel}\``).join('\n')}
` : ''}

**Column Analysis:**
- Snake case (${snakeCase.length}): ${snakeCase.length > 0 ? snakeCase.map(c => `\`${c}\``).join(', ') : 'None'}
- Camel case (${camelCase.length}): ${camelCase.length > 0 ? camelCase.map(c => `\`${c}\``).join(', ') : 'None'}
`;
}).join('\n---\n')}

---

## ❌ MISSING TABLES

${results.missing_tables.map(table => `- **\`${table.name}\`**: ${table.error}`).join('\n')}

---

## 🔥 CRITICAL ISSUES

### Duplicate Columns Found
${Object.entries(results.existing_tables)
  .map(([tableName, tableInfo]) => {
    const duplicates = findDuplicates(tableInfo.columns);
    if (duplicates.length > 0) {
      return `**\`${tableName}\`:**
${duplicates.map(dup => `- \`${dup.snake}\` vs \`${dup.camel}\``).join('\n')}`;
    }
    return null;
  })
  .filter(Boolean)
  .join('\n\n')}

### Mixed Naming Conventions
${Object.entries(results.existing_tables)
  .map(([tableName, tableInfo]) => {
    const snakeCase = tableInfo.columns.filter(col => col.includes('_'));
    const camelCase = tableInfo.columns.filter(col => /[A-Z]/.test(col) && !col.includes('_'));
    
    if (snakeCase.length > 0 && camelCase.length > 0) {
      return `**\`${tableName}\`:** ${snakeCase.length} snake_case + ${camelCase.length} camelCase`;
    }
    return null;
  })
  .filter(Boolean)
  .join('\n')}

---

## 🎯 NEXT STEPS

### 1. **Fix Duplicate Columns (HIGH PRIORITY)**
\`\`\`sql
${Object.entries(results.existing_tables)
  .map(([tableName, tableInfo]) => {
    const duplicates = findDuplicates(tableInfo.columns);
    if (duplicates.length > 0) {
      return `-- ${tableName} table
${duplicates.map(dup => `ALTER TABLE ${tableName} DROP COLUMN ${dup.camel};`).join('\n')}`;
    }
    return null;
  })
  .filter(Boolean)
  .join('\n\n')}
\`\`\`

### 2. **Standardize to snake_case**
\`\`\`sql
${Object.entries(results.existing_tables)
  .map(([tableName, tableInfo]) => {
    const camelCase = tableInfo.columns.filter(col => /[A-Z]/.test(col) && !col.includes('_'));
    if (camelCase.length > 0) {
      return `-- ${tableName} table
${camelCase.map(col => `ALTER TABLE ${tableName} RENAME COLUMN ${col} TO ${camelToSnake(col)};`).join('\n')}`;
    }
    return null;
  })
  .filter(Boolean)
  .join('\n\n')}
\`\`\`

### 3. **Create Missing Tables**
\`\`\`sql
-- Create blogs table
CREATE TABLE blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

## ✅ TABLES WITH GOOD STRUCTURE

${Object.entries(results.existing_tables)
  .filter(([_, tableInfo]) => {
    const snakeCase = tableInfo.columns.filter(col => col.includes('_'));
    const camelCase = tableInfo.columns.filter(col => /[A-Z]/.test(col) && !col.includes('_'));
    const duplicates = findDuplicates(tableInfo.columns);
    return camelCase.length === 0 && duplicates.length === 0;
  })
  .map(([tableName, tableInfo]) => `- **\`${tableName}\`**: ${tableInfo.column_count} columns, all snake_case ✅`)
  .join('\n')}

---

**🚀 Ready to execute database fixes!**
`;

  const reportPath = path.join(__dirname, 'RECONCILIATION_REPORT.md');
  fs.writeFileSync(reportPath, markdown);
  console.log(`📄 Report generated: ${reportPath}`);
}

function findDuplicates(columns) {
  const duplicates = [];
  const processed = new Set();
  
  columns.forEach(col => {
    if (processed.has(col)) return;
    
    // Check for camelCase version
    if (col.includes('_')) {
      const camelVersion = col.split('_').map((word, i) => 
        i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
      
      if (columns.includes(camelVersion)) {
        duplicates.push({ snake: col, camel: camelVersion });
        processed.add(col);
        processed.add(camelVersion);
      }
    }
  });
  
  return duplicates;
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

generateReconciliationReport();
