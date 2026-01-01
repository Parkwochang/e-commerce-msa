// @ts-check
import nestjsConfig from '@repo/eslint-config/nestjs';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  ...nestjsConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
];
