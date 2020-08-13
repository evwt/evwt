# Electron Vue Window Toolkit
_Bridging the gap between Electron and Vue to create a great desktop app development framework._

| Unit Tests  | E2E Tests - Linux  | E2E Tests - Mac |
|:-:|:-:|:-:|
| <a href="https://app.circleci.com/pipelines/github/evwt/evwt"><img src="https://circleci.com/gh/evwt/evwt.svg?style=shield" valign="middle"></a> | <a href="https://app.circleci.com/pipelines/github/evwt/evwt-example-markdown-editor"><img src="https://circleci.com/gh/evwt/evwt-example-markdown-editor.svg?style=shield" valign="middle"></a> | <a href="http://drone.evwt.net/evwt/evwt-example-markdown-editor"><img src="https://drone.evwt.net/api/badges/evwt/evwt-example-markdown-editor/status.svg" valign="middle" /></a> |


## Quick Start

```
npm install -g @vue/cli
vue create my-evwt-app
cd my-evwt-app
vue add electron-builder
npm install evwt
```

Existing Electron/Vue app:

`npm install evwt` (or `yarn add evwt`)

## Docs

- [Documentation](https://evwt.net/)
- [Cookbook](https://github.com/evwt/evwt/blob/master/CookBook.md)

### Example Apps

<ul>
  <li>
  <a href="https://github.com/evwt/evwt-example-markdown-editor">Markdown Editor</a>
  <br>
  This app also serves as the official EVWT <a href="https://github.com/evwt/evwt-example-markdown-editor/tree/master/test">testbed</a>.
  </li>
</ul>

## Screenshots

![evmenu-demo](https://user-images.githubusercontent.com/611996/89112631-2654df00-d42b-11ea-8f7a-eec2c9ab4e83.gif)
<br>
<i>Working with native menus using reactive data</i>

![markdown-demo](https://user-images.githubusercontent.com/611996/89716173-77eff300-d970-11ea-8119-e736a6b5671a.png)
<br>
<i>Markdown Editor example app editing the project README</i>

![linux-screenshot](https://user-images.githubusercontent.com/611996/89851710-c6f57e00-db52-11ea-8c68-afb1b1e16187.png)
<br>
<i>On Linux Mint</i>
