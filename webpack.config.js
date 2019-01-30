const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  context: path.join(__dirname, '/lib'),
  entry: [
    '@babel/polyfill',
    './index.js',
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'react-smart-data-table.js',
    library: 'SmartDataTable',
    libraryTarget: 'umd',
  },
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
    },
  ],
  devServer: {
    contentBase: [
      path.join(__dirname, 'dist'),
      path.join(__dirname, 'test'),
    ],
    compress: true,
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
    ],
  },
})
