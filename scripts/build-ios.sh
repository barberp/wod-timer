#!/bin/bash

# iOS Build Script for WOD Timer App
set -e

echo "🚀 Starting iOS build process..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Please install it with: npm install -g @expo/eas-cli"
    exit 1
fi

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run: eas login"
    exit 1
fi

echo "✅ EAS CLI ready"

# Build for iOS
echo "📱 Building iOS app..."
eas build --platform ios --profile production

echo "✅ iOS build completed successfully!"
echo "📋 Next steps:"
echo "   1. Run 'npm run submit:ios' to submit to App Store"
echo "   2. Or download the build from the EAS dashboard"
