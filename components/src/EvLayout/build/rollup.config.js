import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import vue from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';
import scss from 'rollup-plugin-scss';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
  input: 'index.js',
  output: {
    name: 'evwt.evlayout'
  },
  plugins: [
    nodePolyfills(),
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    json(),
    css(),
    scss(),
    vue()
  ]
};
