# WOD Timer

A cross-platform timer app for workouts and training sessions.

## Features

- **Count Up & Count Down** timer modes
- **Landscape Mode** on mobile for full-screen timer display
- **Tap to Pause** in landscape mode
- **Cross-platform** support (iOS, Android, Web)
- **Responsive Design** that adapts to device orientation

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Building for Production

### iOS
```bash
# Build for iOS App Store
npm run build:ios

# Or use the build script
./scripts/build-ios.sh

# Submit to App Store
npm run submit:ios
```

### Android
```bash
# Build for Android
npm run build:android
```

### Web
```bash
# Build for web
npm run build:web
```

## Platform-Specific Features

### Mobile (iOS/Android)
- Full rotation support
- Landscape mode with immersive timer
- Native performance and animations

### Web
- Always portrait mode (no rotation issues)
- Full interface with all controls
- Responsive design for different screen sizes

## Deployment Notes

- **iOS**: Uses EAS Build with proper bundle identifier
- **Android**: Configured with adaptive icons
- **Web**: Optimized for browser deployment
- **Console logs**: Only shown in development builds
