import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        // Anchored: tsc emits into the repo root, and a bare 'modules/' would also match src/modules
        ignores: ['node_modules/', '/*.js', '/*.d.ts', '/modules/'],
    },
    {
        files: ['**/*.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'import-x': importPlugin,
        },
        rules: {
            '@typescript-eslint/explicit-member-accessibility': 'off',
            '@typescript-eslint/member-ordering': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
                { selector: 'function', format: ['camelCase', 'PascalCase'] },
                { selector: 'typeAlias', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
                { selector: 'interface', format: ['PascalCase'] },
                { selector: 'class', format: ['PascalCase'] },
                { selector: 'classProperty', format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'], leadingUnderscore: 'allow' },
                { selector: 'classMethod', format: ['camelCase'], leadingUnderscore: 'allow' },
                { selector: 'enumMember', format: ['PascalCase', 'snake_case', 'UPPER_CASE'] },
                { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
            ],
            '@typescript-eslint/no-deprecated': 'warn',
            '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false }],
            '@typescript-eslint/no-require-imports': 'off',
            'arrow-body-style': ['warn', 'as-needed'],
            curly: ['error', 'multi-line', 'consistent'],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'import-x/no-cycle': 'error',
            'import-x/order': 'error',
            'max-len': ['warn', { code: 180 }],
            'no-fallthrough': 'error',
            'no-restricted-properties': [
                'error',
                ...['debug', 'info', 'time', 'timeEnd', 'timeLog', 'trace'].map((property) => ({ object: 'console', property })),
            ],
            'no-underscore-dangle': 'off',
            'no-unused-expressions': 'off',
            'no-use-before-define': 'off',
            radix: 'off',
        },
    },
    prettier
);
