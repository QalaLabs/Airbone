import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.next/**', 'src/.next/**', 'admin/.next/**', 'node_modules/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    plugins: {
      react,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // JSX component references count as used (avoids false positives on layout chrome).
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'off',
      // Next.js App Router pages export metadata/revalidate/dynamic alongside the page component.
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: ['metadata', 'generateMetadata', 'viewport', 'dynamic', 'revalidate'],
        },
      ],
    },
  },
  {
    // React Three Fiber: useFrame must mutate Three.js uniforms/meshes imperatively.
    files: ['src/scenes/**/*.{js,jsx}'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
])
