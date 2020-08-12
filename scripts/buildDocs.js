/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */

// This assumes vuese was run first and docs exist in docs/components
// For each item in the document index [], search background/plugins for the js (glob)
// then also search markdown/ for the intro text
// then also search for a .vue file with the same name
// (EvIcon good test, all three)
// then just store all this shit and dump it out later .. just get file contents rendered first
// sidebar built from document index[]
let documents = [
  'EvIcon',
  'EvMenu',
  'EvStore',
  'EvWindow',
  'EvDropZone',
  'EvLayout',
  'EvToolbar',
  'EvToolbarItem',
  'EvVirtualScroll'
];

let jsdoc2md = require('jsdoc-to-markdown');
let fs = require('fs');
let path = require('path');

(async () => {
  for (const name of documents) {
    let document = {
      vuese: '',
      manual: '',
      jsdocBg: '',
      jsdocPlugin: ''
    };

    // Read md - goes on top
    let vuesePath = path.join(__dirname, '..', `vuese/components/${name}.md`);
    if (fs.existsSync(vuesePath)) {
      let doc = fs.readFileSync(vuesePath).toString();
      let lines = doc.split('\n');
      lines.splice(0, 1);
      doc = lines.join('\n');
      document.vuese += doc;
    }

    // Read md - on top but under vuese stuff
    let manualMdPath = path.join(__dirname, '..', `markdown/${name}.md`);
    if (fs.existsSync(manualMdPath)) {
      let doc = fs.readFileSync(manualMdPath).toString();
      document.manual += doc;
    }

    // Generate jsdoc md - background
    let jsdocMdBgPath = path.join(__dirname, '..', `background/${name}.js`);
    if (fs.existsSync(jsdocMdBgPath)) {
      let jsDocMarkdown = await jsdoc2md.render({
        files: jsdocMdBgPath,
        'heading-depth': 4
      });

      document.jsdocBg += `### Background\n\n${jsDocMarkdown}`;
    }

    // Generate jsdoc md - plugins
    let jsdocMdPluginsPath = path.join(__dirname, '..', `plugins/${name}.js`);
    if (fs.existsSync(jsdocMdPluginsPath)) {
      let jsDocMarkdown = await jsdoc2md.render({
        files: jsdocMdPluginsPath,
        'heading-depth': 4
      });

      if (jsDocMarkdown) {
        document.jsdocPlugin += `### Plugin\n\n${jsDocMarkdown}`;
      }
    }

    if (document.jsdocBg || document.jsdocPlugin) {
      document.bottomHeader = '## Reference';
    }

    let output = `${document.manual}\n\n${document.vuese}\n${document.bottomHeader}\n${document.jsdocBg}\n\n${document.jsdocPlugin}`;

    fs.writeFileSync(path.join(__dirname, '..', `docs/${name}.md`), output);

    console.log(`Wrote ${name}.md`);

    fs.copyFileSync('README.md', 'docs/README.md');
  }
})();
