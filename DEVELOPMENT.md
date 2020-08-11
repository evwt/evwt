# Development

(To work on EVWT, not to build your own apps with it.)

## Setup

### Mac

#### Prerequisites
- Install node 12
- Clone app repo
- npm install or yarn
- npm run electron:serve

### Linux

#### Prerequisites
- Install node 12
- Clone app repo
- npm install or yarn
- npm run electron:build
- ./node_modules/.bin/electron dist_electron/bundled/background.js

Currently `npm run electron:serve` doesn't seem to work on Linux (Mint nor Ubuntu), this must be a bug in [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder), which is what provides the `electron:build` command.