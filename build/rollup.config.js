import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import vue from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';
import scss from 'rollup-plugin-scss';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import builtins from 'builtin-modules';
import nodePolyfills from 'rollup-plugin-node-polyfills';

let customResolver = resolve({
  extensions: ['.js', '.scss', '.vue']
});

let projectRootDir = path.resolve(__dirname, '..');

export default {
  input: 'index.js',
  output: {
    name: 'evwt',
    exports: 'named',
    globals: {
      electron: 'electron',
      path: 'path',
      fs: 'fs'
    }
  },
  external: ['electron', ...builtins],
  plugins: [
    nodePolyfills(),
    alias({
      entries: [
        {
          find: '@',
          replacement: path.resolve(projectRootDir, 'src')
        }
      ],
      customResolver
    }),
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
