const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/js/entry.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
  },
  watch: true,
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
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
        loaders: ['style-loader', 'css-loader?url=false'],
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader?url=false', 'sass-loader'],
      },
    ],
  },
};
