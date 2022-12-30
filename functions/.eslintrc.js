module.exports = {
    root: true,
    env: {
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'google',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        sourceType: 'module'
    },
    ignorePatterns: [
        '/lib/**/*' // Ignore built files.
    ],
    plugins: [
        '@typescript-eslint',
        'import'
    ],
    rules: {
        'quotes': ['warn', 'single'],
        'import/no-unresolved': 0,
        'indent': ['warn', 4],
        'padded-blocks': 'off',
        'comma-dangle': ['warn', 'never'],
        'object-curly-spacing': ['warn', 'always'],
        'curly': ['warn', 'multi-or-nest'],
        'max-len': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'require-jsdoc': 'off',
        'no-trailing-spaces': 'off',
        'arrow-parens': 'off',
        'no-extend-native': 'off',
        'no-prototype-builtins': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'new-cap': 'off',
        'camelcase': 'off',
        'no-constant-condition': 'off'
    }
};
