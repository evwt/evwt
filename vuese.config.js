let { buildSidebar } = require('./scripts/renderDocs');

module.exports = {
  outDir: 'docs',
  title: 'Electron Vue Window Toolkit',
  exclude: ['**/EvLayoutChild.vue'],
  docuteOptions: {
    darkThemeToggler: true,
    sidebar: buildSidebar()
  }
};
