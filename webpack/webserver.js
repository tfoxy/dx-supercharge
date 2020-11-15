const path = require("path");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const WriteFilePlugin = require("write-file-webpack-plugin");
const config = require("../webpack.config");

const port = 3001;

for (let entryName in config.entry) {
  config.entry[entryName] = [
    `webpack-dev-server/client?http://localhost:${port}`,
    "webpack/hot/dev-server",
  ].concat(config.entry[entryName]);
}

config.mode = "development";
config.plugins = [
  new webpack.HotModuleReplacementPlugin(),
  ...config.plugins,
  new WriteFilePlugin(),
];

const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: path.resolve(__dirname, "..", "dist"),
  sockPort: port,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
  disableHostCheck: true,
});

server.listen(port);
