const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['babel-polyfill', './src/js/entry.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  watch: false,
  mode: 'production',
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
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?url=false',
        }),
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?url=false!sass-loader',
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
  ],
};
