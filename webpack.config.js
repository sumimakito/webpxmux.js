const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { WebpackCompilerPlugin } = require("webpack-compiler-plugin");

module.exports = {
  mode: "production",
  entry: { webpxmux: "./src/webpxmux.ts", "webpxmux.min": "./src/webpxmux.ts" },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.webpack.json"),
            },
          },
        ],
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "web",
  externals: { fs: "commonjs fs", ws: "commonjs ws" },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [{ from: "build/webpxmux.wasm", to: "." }],
    }),
    new WebpackCompilerPlugin({
      name: "CleanupCompilerPlugin",
      listeners: {
        buildEnd: () => {
          fs.copyFileSync(
            path.resolve(__dirname, "distLib/src/webpxmux.d.ts"),
            path.resolve(__dirname, "dist/webpxmux.d.ts")
          );
          rimraf.sync(path.resolve(__dirname, "distLib"));
        },
      },
      stageMessages: null,
    }),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "umd",
    globalObject: "this",
    library: "WebPXMux",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/,
        sourceMap: true,
      }),
    ],
  },
  stats: {
    warningsFilter: ["entrypoint size limit", "asset size limit", "limit the size"],
  },
};
