# webpack-rollup-loader [![Build Status](https://travis-ci.org/erikdesjardins/webpack-rollup-loader.svg?branch=master)](https://travis-ci.org/erikdesjardins/webpack-rollup-loader)

Webpack loader that uses Rollup, which calls back into Webpack for module resolution.

Inspired by [egoist/rollup-loader](https://github.com/egoist/rollup-loader).

## Installation
  
`npm install --save-dev webpack-rollup-loader`

Rollup is a peer dependency, and must also be installed:

`npm install --save-dev rollup`

## Usage

**Note:** This loader must only be applied once to the entry module. Using it to load all `.js` files (or just recursively) _will_ produce incorrect code.

If you use Babel, make sure that it isn't [converting ES6 imports to CommonJS](https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs).

**webpack.config.js:**

```js
module.exports = {
  entry: 'entry.js',
  module: {
    rules: [
      {
        test: /entry\.js$/,
        use: [{
          loader: 'webpack-rollup-loader',
          options: {
            // OPTIONAL: any rollup options (except `entry`)
            // e.g.
            external: [/* modules that shouldn't be rollup'd */]
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
