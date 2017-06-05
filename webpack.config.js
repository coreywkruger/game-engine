const path = require("path");
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
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "./src/index.html",
        to: "index.html"
      },
      {
        from: "./src/css/index.css",
        to: "css/bundle.css"
      }
    ]),
    new webpack.EnvironmentPlugin(["HOST", "PORT"])
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    hot: true,
    historyApiFallback: true,
    compress: false,
    port: 3002
  }
};
