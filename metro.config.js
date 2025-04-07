const { getSentryExpoConfig } = require('@sentry/react-native/metro');

// Get the base config with Sentry integration
const config = getSentryExpoConfig(__dirname);

// Add resolver for the missing module
if (!config.resolver) {
  config.resolver = {};
}

if (!config.resolver.extraNodeModules) {
  config.resolver.extraNodeModules = {};
}

// Add the alias for react-native-web-webview
config.resolver.extraNodeModules['react-native-web-webview'] = `${__dirname}/components/WebViewFallback.js`;

// You might also need to add an alias specifically for the YouTube iframe component
config.resolver.extraNodeModules['react-native-youtube-iframe/dist/WebView.web'] =
  `${__dirname}/src/components/WebViewFallback.js`;

module.exports = config;
