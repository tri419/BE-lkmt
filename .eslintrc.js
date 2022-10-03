module.exports = {
  parser: 'babel-eslint',
  extends: ['prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'no-unused-vars': 1,
    'prefer-const': 2,
    'no-var': 2,
  },
  env: {
    es6: true,
    node: true,
  },
};
