module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '**/__mocks__/**',
    '**/*.test.*',
    'test/**/*',
    'jest.*',
  ],
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  rules: {
    'max-len': [
      'warn',
      {
        code: 180,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-plusplus': 'off',
  },
  overrides: [
    {
      env: {
        jest: true,
      },
      plugins: ['jest-extended'],
      files: ['*.test.*', '**/*.test.*'],
      rules: {
        'no-unused-expressions': 'off',
        'jest/no-setup-in-describe': 'warn',
        'no-console': 'off',
      },
    },
  ],
};
