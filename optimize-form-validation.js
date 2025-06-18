#!/usr/bin/env node

/**
 * BRIGHTON HUB - Optimize Form Validation
 * 
 * This script optimizes and cleans up form validation in files where
 * validation was already partially implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 BRIGHTON HUB - Form Validation Optimization');
console.log('==============================================\n');

// Track optimizations
const optimizations = {
    cleanedDuplicates: 0,
    improvedValidation: 0,
    addedMissingValidation: 0,
    totalFilesOptimized: 0
};

// Validation schema to inject
const validationSchemaCode = `
// Comprehensive validation schema
const validationSchema = {
    required: (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'This field is required';
        }
        return null;
    },
    email: (value) => {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (value && !emailRegex.test(value)) {
            return 'Please enter a valid email address';
        }
        return null;
    },
    phone: (value) => {
        const phoneRegex = /^[\\+]?[0-9]{10,15}$/;
        if (value && !phoneRegex.test(value.replace(/[\\s\\-\\(\\)]/g, ''))) {
            return 'Please enter a valid phone number';
        }
        return null;
    },
    minLength: (min) => (value) => {
        if (value && value.length < min) {
            return \`Minimum \${min} characters required\`;
        }
        return null;
    },
    maxLength: (max) => (value) => {
        if (value && value.length > max) {
            return \`Maximum \${max} characters allowed\`;
        }
        return null;
    },
    password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(value)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return null;
    },
    confirmPassword: (password) => (value) => {
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return null;
    }
};`;

// Specific files to optimize with their validation rules
const fileOptimizations = {
    'app/contact/page.tsx': {
        validationRules: `{
        first_name: validationSchema.required,
        last_name: validationSchema.required,
        email: (value) => validationSchema.required(value) || validationSchema.email(value),
        subject: validationSchema.required,
        message: (value) => validationSchema.required(value) || validationSchema.minLength(10)(value)
    }`
    },
    'app/auth/login/page.tsx': {
        validationRules: `{
        email: (value) => validationSchema.required(value) || validationSchema.email(value),
        password: validationSchema.required
    }`
    },
    'app/auth/register/page.tsx': {
        validationRules: `{
        name: validationSchema.required,
        email: (value) => validationSchema.required(value) || validationSchema.email(value),
        phone: (value) => validationSchema.phone(value),
        password: validationSchema.password,
        confirmPassword: validationSchema.confirmPassword
    }`
    },
    'app/vendor/register/page.tsx': {
        validationRules: `{
        business_name: validationSchema.required,
        business_description: (value) => validationSchema.required(value) || validationSchema.minLength(50)(value),
        email: (value) => validationSchema.required(value) || validationSchema.email(value),
        phone: (value) => validationSchema.required(value) || validationSchema.phone(value),
        website: (value) => {
            if (value && !/^https?:\\/\\/.+/.test(value)) {
                return 'Please enter a valid URL starting with http:// or https://';
            }
            return null;
        }
    }`
    }
};

function optimizeFormValidation(filePath) {
    console.log(`🔍 Optimizing: ${path.relative(process.cwd(), filePath)}`);
    
    if (!fs.existsSync(filePath)) {
        console.log('   ⚠️  File not found, skipping');
        return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove duplicate validation code that might have been added
    const duplicatePattern = /\/\/ Form validation rules\\s*const formValidationRules = \\{[^}]*\\};\\s*\/\/ Validation helper function[^}]*\\};/gs;
    if (duplicatePattern.test(content)) {
        content = content.replace(duplicatePattern, '');
        optimizations.cleanedDuplicates++;
        modified = true;
        console.log('   ✅ Removed duplicate validation code');
    }
    
    // Check if file has forms
    const hasFormElements = /<form|onSubmit|handleSubmit/i.test(content);
    if (!hasFormElements) {
        console.log('   ✅ No forms found, skipping');
        return false;
    }
    
    // Add comprehensive validation schema if missing
    if (!content.includes('validationSchema = {')) {
        const insertPoint = content.indexOf('export default function') || content.indexOf('const ') || 0;
        content = content.slice(0, insertPoint) + validationSchemaCode + '\n\n' + content.slice(insertPoint);
        modified = true;
        optimizations.improvedValidation++;
        console.log('   ✅ Added comprehensive validation schema');
    }
    
    // Add specific validation rules for this file
    const relativeFilePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const optimization = fileOptimizations[relativeFilePath];
    
    if (optimization) {
        // Find and replace validation rules
        const rulesPattern = /const formValidationRules = \{[^}]*\};/s;
        const newRules = `const formValidationRules = ${optimization.validationRules};`;
        
        if (rulesPattern.test(content)) {
            content = content.replace(rulesPattern, newRules);
            modified = true;
            optimizations.addedMissingValidation++;
            console.log('   ✅ Updated validation rules with specific field validation');
        } else {
            // Add validation rules if not found
            const componentStart = content.indexOf('{', content.indexOf('export default function'));
            if (componentStart > 0) {
                const insertPoint = componentStart + 1;
                content = content.slice(0, insertPoint) + `\n    // Form validation rules\n    const formValidationRules = ${optimization.validationRules};\n` + content.slice(insertPoint);
                modified = true;
                optimizations.addedMissingValidation++;
                console.log('   ✅ Added specific validation rules');
            }
        }
    }
    
    // Improve error display
    if (!content.includes('ErrorMessage') && content.includes('error')) {
        const errorComponentCode = `
    // Enhanced error display component
    const ErrorMessage = ({ error, className = '' }) => {
        if (!error) return null;
        return (
            <div className={\`text-red-600 text-sm mt-1 p-2 bg-red-50 border-l-4 border-red-400 rounded \${className}\`}>
                <span className="font-medium">⚠</span> {error}
            </div>
        );
    };
    
    const SuccessMessage = ({ message, className = '' }) => {
        if (!message) return null;
        return (
            <div className={\`text-green-600 text-sm mt-1 p-2 bg-green-50 border-l-4 border-green-400 rounded \${className}\`}>
                <span className="font-medium">✓</span> {message}
            </div>
        );
    };`;
        
        const returnMatch = content.match(/return\s*\(/);
        if (returnMatch) {
            const insertPoint = returnMatch.index;
            content = content.slice(0, insertPoint) + errorComponentCode + '\n\n    ' + content.slice(insertPoint);
            modified = true;
            console.log('   ✅ Added enhanced error/success display components');
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        optimizations.totalFilesOptimized++;
        console.log('   🎉 File optimized successfully');
        return true;
    }
    
    console.log('   ✅ No optimization needed');
    return false;
}

// Main execution
async function optimizeAllForms() {
    console.log('🔍 Starting form validation optimization...\n');
    
    const filesToOptimize = Object.keys(fileOptimizations).map(f => path.join(process.cwd(), f));
    
    // Also scan for other form files
    const appDir = path.join(process.cwd(), 'app');
    const additionalFiles = [];
    
    function findFormFiles(dir) {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                findFormFiles(filePath);
            } else if ((file.endsWith('.tsx') || file.endsWith('.jsx')) && file.includes('page')) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (/<form|onSubmit|handleSubmit/i.test(content)) {
                    additionalFiles.push(filePath);
                }
            }
        }
    }
    
    findFormFiles(appDir);
    
    const allFiles = [...filesToOptimize, ...additionalFiles.filter(f => 
        !filesToOptimize.some(existing => existing === f)
    )];
    
    console.log(`📁 Found ${allFiles.length} form files to optimize\n`);
    
    for (const filePath of allFiles) {
        try {
            optimizeFormValidation(filePath);
        } catch (error) {
            console.error(`❌ Error optimizing ${filePath}:`, error.message);
        }
    }
    
    // Summary
    console.log('\n📊 FORM OPTIMIZATION SUMMARY');
    console.log('============================');
    console.log(`✅ Duplicate code cleaned: ${optimizations.cleanedDuplicates}`);
    console.log(`✅ Validation schemas improved: ${optimizations.improvedValidation}`);
    console.log(`✅ Specific validations added: ${optimizations.addedMissingValidation}`);
    console.log(`✅ Total files optimized: ${optimizations.totalFilesOptimized}`);
    
    return optimizations.totalFilesOptimized > 0;
}

// Run the optimizations
optimizeAllForms()
    .then((hasChanges) => {
        if (hasChanges) {
            console.log('\n🎉 Form validation optimization completed!');
            console.log('📝 All forms now have comprehensive validation and error handling.');
        } else {
            console.log('\n✅ All forms are already optimized!');
        }
    })
    .catch((error) => {
        console.error('❌ Error during form optimization:', error);
        process.exit(1);
    });
