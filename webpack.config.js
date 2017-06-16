const path = require('path');

module.exports = {
  entry: {
    background: ['./src/background.ts'],
    content: ['./src/content.ts'],
    backend: ['./src/backend.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'addon'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
};
