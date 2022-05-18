const customizeCra = require("customize-cra");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = customizeCra.override(
  // add webpack bundle visualizer if BUNDLE_VISUALIZE flag is enabled
  process.env.BUNDLE_VISUALIZE === 1 && customizeCra.addBundleVisualizer(),

  customizeCra.addWebpackPlugin(new NodePolyfillPlugin())
);
