let { upperFirst, camelCase } = require('lodash');

//
// Build Vue Components from SVG files
//
// Should be called from an index.js in a folder with svgs:
// let context = require.context('.', true, /\.svg$/);
// buildIconLibrary(context);
//

function buildIconLibrary(Vue, requireComponent) {
  requireComponent.keys().forEach(fileName => {
    let componentConfig = requireComponent(fileName);

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

