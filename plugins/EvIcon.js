let { upperFirst, camelCase } = require('lodash');

//
// Build Vue Components from SVG files
//
// Should be called from an index.js in a folder with svgs:
// let context = require.context('.', true, /\.svg$/);
// buildIconLibrary(context);
//

/**
 *
 *
 * @param {*} Vue
 * @param {Function} requireContext - https://webpack.js.org/api/module-methods/#requirecontext
 */
function buildIconLibrary(Vue, requireContext) {
  requireContext.keys().forEach(fileName => {
    let componentConfig = requireContext(fileName);

    let componentName = `EvIcon${upperFirst(
      camelCase(
        fileName
          .split('/')
          .pop()
          .replace(/\.\w+$/, '')
      )
    )}`;

    Vue.component(
      componentName,
      componentConfig.default || componentConfig
    );
  });
}

//
// Webpack portion of EvIcon
//

/**
 *
 *
 * @param {Object} config - https://github.com/neutrinojs/webpack-chain#config
 */
function useEvIcon(config) {
  const svgRule = config.module.rule('svg');

  svgRule.uses.clear();

  svgRule
    .use('babel-loader')
    .loader('babel-loader')
    .end()
    .use('vue-svg-loader')
    .loader('vue-svg-loader');
}

module.exports = {
  buildIconLibrary,
  useEvIcon
};
