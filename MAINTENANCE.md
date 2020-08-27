# Maintenance

Checklist for overall maintenance of the EVWT project.

Whenever API gets changed/added:
* Docs needs to be updated
* Example apps need to be updated
* Tutorials need to be updated
* Tests need to be changed or added
* Kitchen sink needs feature added (when kitchen sink exists)


## Subprojects

### EVWT
https://github.com/evwt/evwt-tutorials
* Main project + EvLayout for web in components/
* Always make sure markdown editor tests pass before releasing
* Do any changes require docs/tutorial updates?
* Use release-it to release
* Netlify auto deploys new docs on push.

### Tutorials
https://github.com/evwt/evwt-tutorials
* These need to be kept up to date and expanded upon to an entire tutorials site.
* Eventually supercede TUTORIAL.md
* To release, Build and push, netlify will deploy dist/

### vue-cli-plugin-electron-builder
https://github.com/evwt/vue-cli-plugin-electron-builder
This is a fork with EVWT specific electron boilerplate for the `vue add evwt` command.

Releasing
* Make sure evwt target for package.json is latest
* Bump loader (for evicon) versions if safe
* Make sure everything is pushed and no outstanding changes.
* Do any changes require docs/tutorial updates?
* Bump version in package.json and `npm publish`

### EvLayout playground
https://github.com/evwt/evwt-layout-playground
https://evwt-layout-playground.netlify.app/

This uses a standalone EvLayout made for the web, see components folder.
Should eventually move away from Evwt-components and instead just make EvLayout its own package
* Netlify auto deploys this on pushes.

## Example Apps

### Markdown editor
https://github.com/evwt/evwt-example-markdown-editor
* Needs to stay updated with API, since this is the test app (right now) it usually stays pretty up to date.
* Use release-it to release

### Todo app - from tutorial
This should be the result of following the tutorial


