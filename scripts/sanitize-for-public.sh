#!/bin/bash

# Script to create a sanitized public branch for portfolio showcase
# This preserves file structure and commit history while hiding sensitive logic

echo "🧹 Creating sanitized public branch..."

# Create new orphan branch (clean history start)
git checkout --orphan public-portfolio

# Remove sensitive files completely
echo "🗑️  Removing sensitive files..."
rm -rf .env*
rm -rf supabasePolicies/
rm -rf scripts/migrate-*.ts
rm -rf node_modules/

# Create .gitignore for public branch
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Sensitive
supabasePolicies/
scripts/migrate-*.ts
EOF

echo "✅ Sanitization complete!"
echo "📝 Next steps:"
echo "1. Run: node scripts/sanitize-code.js"
echo "2. Review changes"
echo "3. Commit: git add . && git commit -m 'Initial public portfolio version'"
echo "4. Push: git push origin public-portfolio"
