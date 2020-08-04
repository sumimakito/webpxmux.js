const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
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
        exclude: [/node_modules/, path.resolve(__dirname, 'lib')],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "web",
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new webpack.NormalModuleReplacementPlugin(
      /build\/webpxmux\.js/,
      path.resolve(__dirname, "build/webpxmux-web.js")
    ),
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
      new TerserPlugin({
        include: /\.min\.js$/,
        sourceMap: true,
        terserOptions: {
          compress: {
            dead_code: true,
            conditionals: true,
          },
        },
      }),
    ],
  },
  stats: {
    warningsFilter: [
      "entrypoint size limit",
      "asset size limit",
      "limit the size",
    ],
  },
};
