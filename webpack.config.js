const path = require("path");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: "./src/js/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            query: {
              presets: ["es2015"]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: "css-loader"
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("css/bundle.css"),
    new CopyWebpackPlugin([
      {
        from: "./src/index.html",
        to: "index.html"
      }
    ])
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    hot: true,
    historyApiFallback: true,
    compress: false,
    port: 3002
  }
};
