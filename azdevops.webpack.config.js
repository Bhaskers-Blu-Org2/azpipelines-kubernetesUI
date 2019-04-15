const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: {
    "azdevops-kube-summary": "./src/index.ts",
    "azdevops-kube-summary.min": "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "_bin/azDevOpsPackage/_bundles"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "azdevops-kube-summary",
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devtool: "source-map",
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        include: /\.min\.js$/,
        parallel: 4
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "./buildScripts/css-variables-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.woff$/,
        use: [{
          loader: "base64-inline-loader"
        }]
      },
      {
        test: /\.html$/,
        loader: "file-loader"
      },
      { test: /\.(png|jpg|svg)$/, loader: "file-loader" },
    ]
  },
  node: {
    fs: "empty",
    tls: "mock",
    child_process: "empty",
    net: "empty"
  },
  externals: [
    function(context, request, callback) {
      const azDevOpsUIPrefix = "azure-devops-ui";
      const azDevOpsUICorePrefix = "azure-devops-ui/Core";
      const propsPostfix = ".Props";
      
      if (request === "react" || request === "react-dom") {
        return callback(null, request);
      }
      else if (request.startsWith(azDevOpsUICorePrefix)) {
        // replace "azure-devops-ui/Core" with VSS/Core
        return callback(null, "VSS" + request.substr(azDevOpsUIPrefix.length));
      }
      else if (request.startsWith(azDevOpsUIPrefix) && request.endsWith(propsPostfix)) {
        // replace "azure-devops-ui" with VSSUI and drop ".Props"
        return callback(null, "VSSUI" + request.substr(azDevOpsUIPrefix.length, request.length - azDevOpsUIPrefix.length - propsPostfix.length));
      }
      else if (request.startsWith(azDevOpsUIPrefix)) {
        // replace "azure-devops-ui" with VSSUI
        return callback(null, "VSSUI" + request.substr(azDevOpsUIPrefix.length));
      }
      else {
        // return unchanged
        return callback();
      }
    }
  ]
}