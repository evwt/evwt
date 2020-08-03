import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';
import scss from 'rollup-plugin-scss';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';

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
      'electron': 'electron'
    }
  },
  external: ['electron'],
  plugins: [
    alias({
      entries: [
        {
          find: '@',
          replacement: path.resolve(projectRootDir, 'src')
        }
      ],
      customResolver
    }),
    resolve(),
    commonjs(),
    css(),
    scss(),
    vue()
  ]
};
