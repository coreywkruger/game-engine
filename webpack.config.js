const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js|\.tag\.html$/,
        exclude: [/node_modules|dist/, /.+\.json/],
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
      }
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './src/index.html',
        to: 'index.html',
      },
      {
        from: './src/css/index.css',
        to: 'bundle.css',
      },
    ]),
    new webpack.EnvironmentPlugin(['PEER_SERVICE']),
  ],
  devServer: {
    host: '0.0.0.0',
    contentBase: path.join(__dirname, 'dist'),
    hot: true,
    historyApiFallback: true,
    compress: false,
    port: 8000,
  },
};
