#!/bin/bash

set -e  # Exit on any error

echo "🔢 Incrementing version..."
npm version patch --no-git-tag-version

echo "📋 Syncing manifest version..."
PACKAGE_VERSION=$(node -p "require('./package.json').version")
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$PACKAGE_VERSION\"/" src/manifest.json

echo "🧹 Cleaning previous build..."
rm -rf dist
mkdir -p dist

echo "🔨 Compiling TypeScript..."
if ! npx tsc; then
    echo "❌ TypeScript compilation failed!"
    exit 1
fi

echo "📋 Copying manifest..."
cp src/manifest.json dist/

echo "🎨 Copying icons..."
cp -r src/icons dist/

echo "✅ Extension built successfully!"
echo ""
echo "📁 Load the ./dist/ directory as an unpacked extension in Chrome:"
echo "   1. Open chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the ./dist/ directory"
echo ""
echo "🔄 To rebuild automatically on changes, run: npm run watch"