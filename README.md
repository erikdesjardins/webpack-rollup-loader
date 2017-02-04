# webpack-rollup-loader [![Build Status](https://travis-ci.org/erikdesjardins/webpack-rollup-loader.svg?branch=master)](https://travis-ci.org/erikdesjardins/webpack-rollup-loader)

A Webpack loader that uses Rollup, which calls back into Webpack for module resolution.

Supports Webpack 2 only.

Inspired by [egoist/rollup-loader](https://github.com/egoist/rollup-loader), but because this loader uses Webpack's module resolution, Rollup is able to hoist the output of non-js loaders, such as filenames from `file-loader`.

## Installation
  
`npm install --save-dev webpack-rollup-loader`

## Usage

**Note:** This loader must only be applied once to the entry module. If it is applied to all `.js` files, basically anything can happen. Modules may be duplicated, Webpack may fail to terminate, and cryptic errors will likely be generated.

Also, make sure that Babel is not transpiling ES6 imports to CommonJS with the `transform-es2015-modules-commonjs` plugin.

**webpack.config.js:**

```js
module.exports = {
  entry: {
    nameOfEntryChunk: 'webpack-rollup-loader!entry.js'
  },
  // ...rest of config as usual
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'] // babel-loader, etc. can be applied to .js files as usual
    }]
  }
};
```
