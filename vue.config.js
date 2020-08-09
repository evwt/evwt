let { useEvIcon } = require('./plugins/EvIcon');

module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    useEvIcon(config);
  }
};
