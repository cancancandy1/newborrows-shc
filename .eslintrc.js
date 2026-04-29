// @ts-check
const { defineConfig } = require('eslint/config') ?? {}

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // อนุญาต any ใน admin actions
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
