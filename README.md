# webpack-rollup-loader [![Build Status](https://travis-ci.org/erikdesjardins/webpack-rollup-loader.svg?branch=master)](https://travis-ci.org/erikdesjardins/webpack-rollup-loader)

Webpack loader that uses Rollup, which calls back into Webpack for module resolution.

Inspired by [egoist/rollup-loader](https://github.com/egoist/rollup-loader), but because this loader uses Webpack's module resolution, Rollup is able to hoist the output of non-js loaders, such as filenames from `file-loader`.

## Installation
  
`npm install --save-dev webpack-rollup-loader`

Rollup is a peer dependency, and must also be installed:

`npm install --save-dev rollup`

## Usage

**Note:** This loader must only be applied once to the entry module. If it is applied to all `.js` files, basically anything can happen. Modules may be duplicated, Webpack may fail to terminate, cryptic errors may be generated.

Also, make sure that Babel is not transpiling ES6 imports to CommonJS with the `transform-es2015-modules-commonjs` plugin.

**webpack.config.js:**

```js
var rollupCommonjsPlugin = require('rollup-plugin-commonjs');

module.exports = {
  entry: 'entry.js',
  module: {
    rules: [
      {
        test: /entry.js$/,
        use: [{
          loader: 'webpack-rollup-loader',
          options: {
            // OPTIONAL: any rollup options (except `entry`)
            // e.g.
            plugins: [rollupCommonjsPlugin()],
            external: ['moment']
          },
        }]
      },

      // ...other rules as usual
      {
        test: /\.js$/,
        use: ['babel-loader'] // can be applied to .js files as usual
      }
    ]
  }
};
```
