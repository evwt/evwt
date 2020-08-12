let EvIcon = require('./background/EvIcon');

module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    EvIcon.use(config);
  }
};
