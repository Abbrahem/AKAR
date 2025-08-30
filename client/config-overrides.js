const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    "http": false,
    "https": false,
    "util": false,
    "zlib": false,
    "stream": false,
    "url": false,
    "assert": false,
    "buffer": false,
    "process": false
  };

  config.plugins = [
    ...config.plugins,
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
  ];

  return config;
};
