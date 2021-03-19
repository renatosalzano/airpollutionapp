const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.js',
  optimization: {
    minimize: false,
  },
  plugins: [
    new Dotenv()
  ],
  output: {
    filename: 'app.min.js',
    path: path.resolve(__dirname, 'JS'),
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
};