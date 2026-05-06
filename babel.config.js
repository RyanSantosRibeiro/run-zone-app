module.exports = function (api) {
  console.log('babel.config.js carregado!');
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      "react-native-reanimated/plugin"
    ],
  };
};