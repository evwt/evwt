# EvIcon

A library for all your vector icons, out of the box.

?> 🎨 Icon SVG is inlined into the HTML so it can be styled with CSS.

## Usage

1) Put your svg icons into `/src/assets/icons`.
2) Assuming you have a file named `folder-open.svg` in that folder:

```vue
<template>
  <ev-icon name="folder-open" />
</template>

<style>
.ev-icon-folder-open svg {
  fill: gray;
  height: 32px;
  width: auto;
}
</style>
```

> For icons in toolbars, simply pass the name of an icon to the `icon` prop of EvToolbarItem