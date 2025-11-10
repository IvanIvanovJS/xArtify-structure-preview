#!/usr/bin/env node

/**
 * Sanitize code for public portfolio branch
 * Replaces sensitive logic with placeholder comments
 */

const fs = require('fs');
const path = require('path');

const PLACEHOLDER_TEXT = `
// ============================================
// 🔒 PROPRIETARY CODE - HIDDEN FOR SECURITY
// ============================================
// This section contains proprietary business logic
// and has been removed for public portfolio display.
// 
// Available for review during interviews.
// ============================================
`;

const API_PLACEHOLDER = `
// ============================================
// 🔒 API IMPLEMENTATION HIDDEN
// ============================================
// Full implementation available upon request
// ============================================

export async function GET(request) {
  // Implementation hidden for security
  return NextResponse.json({ message: "Implementation hidden" });
}

export async function POST(request) {
  // Implementation hidden for security
  return NextResponse.json({ message: "Implementation hidden" });
}
`;

const COMPONENT_PLACEHOLDER = `
// ============================================
// 🔒 COMPONENT IMPLEMENTATION HIDDEN
// ============================================

export default function Component() {
  return (
    <div>
      {/* Implementation hidden for portfolio */}
      <p>Component structure preserved for portfolio showcase</p>
    </div>
  );
}
`;

// Directories to sanitize
const SANITIZE_PATTERNS = {
  'app/api/**/*.ts': API_PLACEHOLDER,
  'lib/authOptions.ts': PLACEHOLDER_TEXT,
  'middleware.ts': PLACEHOLDER_TEXT,
  'components/**/[A-Z]*.tsx': COMPONENT_PLACEHOLDER,
};

// Files to keep structure but remove content
const SENSITIVE_FILES = [
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/create-payment-intent/route.ts',
  'app/api/create-subscription/route.ts',
  'lib/authOptions.ts',
  'lib/stripe.ts',
  'lib/prisma.ts',
  'middleware.ts',
];

// Files to remove completely
const REMOVE_FILES = [
  '.env',
  '.env.local',
  '.env.production',
  'supabasePolicies/',
];

function sanitizeFile(filePath, placeholder) {
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract imports
    const importLines = content.split('\n').filter(line => 
      line.trim().startsWith('import') || 
      line.trim().startsWith('export type') ||
      line.trim().startsWith('export interface')
    );

    // Create sanitized content
    const sanitized = `${importLines.join('\n')}\n\n${placeholder}`;
    
    fs.writeFileSync(filePath, sanitized, 'utf8');
    console.log(`✅ Sanitized: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error sanitizing ${filePath}:`, error.message);
  }
}

function sanitizeApiRoute(filePath) {
  sanitizeFile(filePath, API_PLACEHOLDER);
}

function sanitizeComponent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract imports and interfaces
    const lines = content.split('\n');
    const imports = [];
    const interfaces = [];
    
    let inInterface = false;
    for (const line of lines) {
      if (line.trim().startsWith('import')) {
        imports.push(line);
      } else if (line.trim().startsWith('interface') || line.trim().startsWith('export interface')) {
        inInterface = true;
        interfaces.push(line);
      } else if (inInterface) {
        interfaces.push(line);
        if (line.includes('}')) {
          inInterface = false;
        }
      }
    }

    const sanitized = `${imports.join('\n')}\n\n${interfaces.join('\n')}\n\n${COMPONENT_PLACEHOLDER}`;
    
    fs.writeFileSync(filePath, sanitized, 'utf8');
    console.log(`✅ Sanitized component: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error sanitizing component ${filePath}:`, error.message);
  }
}

function walkDirectory(dir, callback) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        walkDirectory(filePath, callback);
      }
    } else {
      callback(filePath);
    }
  });
}

console.log('🧹 Starting code sanitization for public portfolio...\n');

// Sanitize API routes
console.log('📁 Sanitizing API routes...');
walkDirectory('app/api', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    sanitizeApiRoute(filePath);
  }
});

// Sanitize sensitive lib files
console.log('\n📁 Sanitizing lib files...');
SENSITIVE_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    sanitizeFile(file, PLACEHOLDER_TEXT);
  }
});

// Sanitize components (optional - keep structure visible)
console.log('\n📁 Sanitizing components...');
walkDirectory('components', (filePath) => {
  if (filePath.endsWith('.tsx') && !filePath.includes('styles')) {
    // Only sanitize complex components, keep simple UI components
    if (filePath.includes('admin') || 
        filePath.includes('artist') || 
        filePath.includes('payment')) {
      sanitizeComponent(filePath);
    }
  }
});

// Create README for public branch
const publicReadme = `# 🎨 xArtify - Portfolio Showcase

> ⚠️ **Note**: This is a sanitized version for portfolio purposes. 
> Sensitive business logic and implementation details have been removed.

## 📋 About This Repository

This repository showcases the **structure and architecture** of xArtify, 
a production art marketplace platform, while protecting proprietary code.

**Live Platform**: [https://xartify.com](https://xartify.com)

## 🔒 What's Hidden

For security and intellectual property protection:
- API implementation details
- Authentication logic
- Payment processing code
- Database queries and business logic
- Security middleware implementation
- Stripe webhook handlers

## ✅ What's Visible

- Project structure and organization
- Technology stack and dependencies
- Component architecture
- Database schema (Prisma models)
- TypeScript interfaces and types
- Commit history and development process

## 💼 Full Code Review

Full implementation details available during interviews.

## 📊 Project Stats

- **Commits**: ${getCommitCount()}+
- **Files**: ${getFileCount()}+
- **Lines of Code**: ~15,000+ (TypeScript)
- **Components**: 50+
- **API Routes**: 30+

## 🛠️ Tech Stack

See main README.md for complete technology stack.

---

**For inquiries**: Contact via portfolio website
`;

fs.writeFileSync('README.md', publicReadme, 'utf8');
console.log('\n✅ Created public README.md');

console.log('\n✨ Sanitization complete!');
console.log('\n📝 Next steps:');
console.log('1. Review the changes');
console.log('2. git add .');
console.log('3. git commit -m "Sanitized version for public portfolio"');
console.log('4. git push origin public-portfolio');

function getCommitCount() {
  try {
    const { execSync } = require('child_process');
    const count = execSync('git rev-list --count HEAD').toString().trim();
    return count;
  } catch {
    return '100';
  }
}

function getFileCount() {
  let count = 0;
  walkDirectory('.', () => count++);
  return count;
}
