const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/js/entry.js'],
  output: {
    path: path.join(__dirname),
    filename: './src/js_build/bundle.js',
  },
  watch: true,
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader',
      //   options: {
      //     fix: true,
      //   },
      // },
      {
        test: /\.js$/, 
        exclude: [/node_modules/], 
        loader: 'babel-loader',
        query: {
          presets: ['env'],
        },
      },
    ],
  },
};
