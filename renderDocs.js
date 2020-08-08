/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
let jsdoc2md = require('jsdoc-to-markdown');
let glob = require('glob');
let fs = require('fs');
let path = require('path');

let srcPattern = 'plugins/**/**.js';
let destination = 'docs/plugins/';
let linkPrefix = 'plugins';

let jsDocHeading = '## Reference';
let headingDepth = 3;

let sidebar = [];

function render() {
  return glob(srcPattern, async (err, files) => {
    if (err) throw err;

    for (const file of files) {
      let jsDocMarkdown = await jsdoc2md.render({
        files: file,
        'heading-depth': headingDepth
      });

      let filePath = path.parse(file);

      // Assumes there is a .md file with same name as the .js file
      let baseDocPath = path.join(__dirname, `${filePath.dir}/${filePath.name}.md`);

      let docContents = '';

      if (fs.existsSync(baseDocPath)) {
        let baseDoc = fs.readFileSync(baseDocPath).toString();
        docContents += baseDoc;
      }

      if (jsDocMarkdown) {
        docContents += `${jsDocHeading}\n\n`;
        docContents += jsDocMarkdown;
      }

      if (docContents) {
        let outputFile = `${destination + filePath.name}.md`;
        fs.writeFileSync(outputFile, docContents);
        console.log(`Wrote ${outputFile}`);
      }
    }
  });
}

render();

function buildSidebar() {
  let files = glob.sync(srcPattern);

  for (const file of files) {
    let filePath = path.parse(file);
    sidebar.push({
      title: filePath.name,
      link: `/${linkPrefix}/${filePath.name}`
    });
  }

  return [
    {
      title: 'Plugins',
      links: sidebar
    }
  ];
}

module.exports = {
  render,
  buildSidebar
};
