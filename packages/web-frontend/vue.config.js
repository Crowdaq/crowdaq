const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
  configureWebpack: {
    plugins: [
      // new BundleAnalyzerPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 15
      }),
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['javascript', 'css', 'html', 'typescript', 'json']
      })
    ]
  },
  "transpileDependencies": [
    "vuetify"
  ]
}