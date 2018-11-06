var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  mode: 'development',
  context: __dirname,

  entry: [
        // "@babel/polyfill",
        "./src/index.js"
    ],

  output: {
      path: path.resolve("./mysite/displayer/static/bundles/"),
      filename: "main.bundle.js",
	  publicPath: "/static/bundles/"
  },
  devtool: "source-map",
  plugins: [
    new webpack.HotModuleReplacementPlugin({}),
    new BundleTracker({filename: "./mysite/webpack-stats.json"}),
  ],
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react'],
					cacheDirectory: true,
                }
            }
        ]
    },
    {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
    }]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['*', '.js', '.jsx']
  }

};