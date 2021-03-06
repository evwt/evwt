let path = require('path');

module.exports = {
  root: true,

  env: {
    node: true
  },

  globals: {
    electron: true
  },

  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb'
  ],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-underscore-dangle': 'off',
    'no-extend-native': 'off',
    'no-empty': 'off',
    radix: 'off',
    'no-cond-assign': 'off',
    'no-plusplus': 'off',
    'default-case': 'off',
    'no-use-before-define': 'off',
    'no-labels': 'off',
    'no-restricted-syntax': 'off',
    'consistent-return': 'off',
    'func-names': 'off',
    'no-await-in-loop': 'off',
    'arrow-parens': 'off',
    camelcase: 'off',
    'prefer-const': 'off',
    'no-console': 'off',
    'no-continue': 'off',
    'global-require': 'off',
    'prefer-const': 'off',
    'comma-dangle': [
      'error', {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'ignore'
      }
    ],
    'prefer-destructuring': 'off',
    'space-before-function-paren': 'off',
    'no-new': 'off',
    'max-len': 'off',
    'vue/require-v-for-key': 'off',
    'vue/require-prop-types': 'off',
    'vue/require-default-prop': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'never'
    }],
    'vue/singleline-html-element-content-newline': ['error', {
      ignoreWhenNoAttributes: true,
      ignoreWhenEmpty: true,
      ignores: ['vue-code-highlight', 'pre', 'textarea']
    }],
    'vue/html-closing-bracket-spacing': ['error', {
      startTag: 'never',
      endTag: 'never',
      selfClosingTag: 'always'
    }],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'off',
      'always',
      {
        js: 'never',
        vue: 'never'
      }
    ],
    'vue/no-v-html': 'off',
    'no-param-reassign': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },

  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', path.resolve(__dirname, './src')]
        ],
        extensions: ['.js', '.vue', '.json', '.scss']
      }
    }
  },

  settings: {
    'import/core-modules': ['electron']
  }
};
