const webpack = require('webpack')

/**
 * The Umbra widget bundles the SDK/crypto graph, which was written for Node and
 * references `Buffer` and `process`. The browser has neither, so polyfill them.
 * (Turbopack ignores this `webpack` hook — run `next dev` on webpack, i.e. the
 * default `next dev` without `--turbo`.)
 *
 * @type {import('next').NextConfig}
 */
module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    )
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser'),
      // Node builtins the bundle may reference but never executes in-browser.
      crypto: false,
      stream: false,
      vm: false,
      fs: false
    }
    return config
  }
}
