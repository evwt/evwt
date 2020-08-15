let { upperFirst, camelCase } = require('lodash');

/**
 * Build icon library
 *
 * @param {*} Vue
 * @param {Function} requireContext - https://webpack.js.org/api/module-methods/#requirecontext
 */
function build(Vue, requireContext) {
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

module.exports = {
  build
};
