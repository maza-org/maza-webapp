# Maza

A comprehensive React Native mobile application built with Expo that combines educational courses, job opportunities, and skill development in a single platform. Maza helps users discover learning opportunities, track their progress, and connect with relevant job openings.

## Features

### Educational Platform

- **Course Catalog**: Browse and discover courses across various subjects
- **Personalized Learning**: Track progress and manage enrolled courses
- **Interactive Content**: Video lessons, quizzes, and text-based learning materials
- **Certification System**: Earn certificates upon course completion
- **Progress Tracking**: Monitor learning streaks and achievements

### Job Opportunities

- **Job Discovery**: Browse and search for relevant job opportunities
- **Advanced Filtering**: Filter jobs by location, category, and requirements
- **Company Profiles**: View company information and job details
- **Application Tracking**: Manage job applications and preferences

### User Experience

- **Profile Management**: Customize user profile and preferences
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for both iOS and Android devices
- **Offline Support**: Core functionality available without internet connection

### Gamification Features

- **Mission System**: Complete daily missions and challenges
- **Streak Tracking**: Maintain learning streaks for motivation
- **Achievement System**: Earn badges and rewards for progress
- **Progress Visualization**: Visual indicators of learning progress

## Technical Stack

### Core Technologies

- **React Native** (0.76.9) - Cross-platform mobile development
- **Expo** (52.0.47) - Development platform and build tools
- **TypeScript** (5.3.3) - Type-safe JavaScript development
- **Expo Router** (4.0.21) - File-based navigation system

### State Management & Data

- **React Query** (@tanstack/react-query) - Server state management
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client for API communication

### UI & Styling

- **React Native Reanimated** - Smooth animations and gestures
- **Expo Vector Icons** - Icon library
- **React Native Safe Area Context** - Safe area handling
- **Expo Linear Gradient** - Gradient effects
- **FlashList** - High-performance list rendering

### Development Tools

- **Jest** - Testing framework
- **Prettier** - Code formatting
- **Sentry** - Error tracking and monitoring
- **ESLint** - Code linting

### Additional Libraries

- **React Native WebView** - Web content integration
- **Expo Image Picker** - Image selection and camera access
- **React Native Markdown Display** - Markdown content rendering
- **React Native Render HTML** - HTML content rendering

## Platform Support

- **iOS**: 13.0+ (supports tablets)
- **Android**: API level 21+ (Android 5.0+)
- **Web**: Progressive Web App support

## Getting Started

### Prerequisites

- **Node.js** (18.0 or later)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development) or **Android Studio** (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/org.maza.app.git
   cd org.maza.app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on your preferred platform**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

### Environment Setup

The application uses different API endpoints for different environments:

- **Development**: `https://maza-strapi-backend.onrender.com/api`
- **Staging**: `https://maza-backend-api.onrender.com/api`
- **Production**: `https://maza-strapi-backend.onrender.com/api`

Environment variables are managed through Expo's configuration system.

## Project Structure

```
org.maza.app/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── login/             # Authentication screens
│   ├── courses/           # Course-related screens
│   ├── jobs/              # Job-related screens
│   ├── missions/          # Gamification features
│   ├── room/              # Learning room features
│   └── user/              # User profile and settings
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── services/              # API and external services
├── types/                 # TypeScript type definitions
├── constants/             # App constants and configuration
├── assets/                # Images, fonts, and static assets
└── util/                  # Utility functions
```

## Testing

Run the test suite:

```bash
npm test
```

The project uses Jest with React Native Testing Library for unit and integration tests.

## Building for Production

### Using EAS Build

1. **Install EAS CLI**

   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**

   ```bash
   eas login
   ```

3. **Build for production**

   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

### Build Profiles

- **development**: Development builds with debugging enabled
- **staging**: Internal distribution builds for testing
- **preview**: Preview builds for internal testing
- **production**: Production-ready builds

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow functional component patterns
- Use descriptive variable names
- Implement proper error handling
- Write comprehensive tests for new features

### Component Structure

```typescript
// Example component structure
interface ComponentProps {
  // Define props interface
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### State Management

- Use React Query for server state
- Use React Context for global client state
- Prefer local state for component-specific data
- Implement proper loading and error states

### Navigation

- Use Expo Router for navigation
- Implement proper deep linking
- Handle navigation state appropriately
- Use typed routes for better type safety

## Deployment

### App Store Deployment

1. **Build production version**

   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### Google Play Store Deployment

1. **Build production version**

   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Play Store**
   ```bash
   eas submit --platform android
   ```

## Monitoring and Analytics

- **Sentry**: Error tracking and performance monitoring
- **Expo Analytics**: Usage analytics and crash reporting
- **Custom Metrics**: Learning progress and engagement tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- **Documentation**: Check the [Expo documentation](https://docs.expo.dev/)
- **Issues**: Create an issue in the GitHub repository
- **Discussions**: Use GitHub Discussions for community support

## Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/

---

Built with React Native and Expo
