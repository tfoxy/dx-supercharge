const path = require("path");
const fs = require("fs");
const CleanPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const CopyPlugin = require("copy-webpack-plugin");
const getLocalIdent = require("./webpack/getCSSModuleLocalIdent");

const srcPath = path.join(__dirname, "src");

module.exports = getConfig();

function getConfig() {
  const manifest = path.join(srcPath, "manifest.json");
  const { entry, htmlFiles } = getEntryAndHtmlPlugins();

  /**
   * @type {import("webpack").Configuration}
   */
  const config = {
    entry,
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: "ts-loader",
            options: { onlyCompileBundledFiles: true },
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
              options: {
                modules: {
                  getLocalIdent,
                },
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: {
            loader: "file-loader",
            options: {
              name: (absolutePath) => path.relative(srcPath, absolutePath),
            },
          },
        },
      ],
    },
    plugins: [
      new CleanPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: manifest,
          },
          ...htmlFiles.map((file) => ({ from: file })),
        ],
      }),
    ],
    resolve: {
      extensions: [".ts", ".tsx", ".mjs", ".js"],
    },
  };

  return config;
}

function getEntryAndHtmlPlugins() {
  const entryFiles = fs.readdirSync(srcPath);

  const entry = Object.fromEntries(
    entryFiles
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
      .filter((file) => !file.endsWith(".d.ts"))
      .map((file) => [file.replace(/\.tsx?$/, ""), path.join(srcPath, file)])
  );

  const htmlFiles = entryFiles
    .filter((file) => file.endsWith(".html"))
    .map((file) => path.join(srcPath, file));

  return { entry, htmlFiles };
}
