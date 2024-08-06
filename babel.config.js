module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-env', // Ensures compatibility with various environments
    '@babel/preset-react', // Handles JSX transformations
    '@babel/preset-typescript', // Supports TypeScript
  ],
  plugins: [
    ['@babel/plugin-transform-class-properties', {loose: true}],
    ['@babel/plugin-transform-private-methods', {loose: true}],
    ['@babel/plugin-transform-private-property-in-object', {loose: true}],
    'react-native-reanimated/plugin', // Must be last
  ],
};
