import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import mochaPlugin from 'eslint-plugin-mocha';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
    js.configs.recommended,
    importPlugin.flatConfigs.recommended,
    mochaPlugin.configs.flat.recommended,
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: {
            unicorn: unicornPlugin,
        },
        languageOptions: {
            globals: globals.node,
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'array-bracket-spacing': [2, 'never'],
            'array-callback-return': 2,
            'array-element-newline': [2, 'consistent'],
            'arrow-parens': [2, 'as-needed'],
            'arrow-spacing': 2,
            'brace-style': [2, 'stroustrup'],

            camelcase: [2, {
                ignoreDestructuring: true,
                properties: 'never',
            }],

            'capitalized-comments': [2, 'always', {
                ignoreConsecutiveComments: true,
                ignorePattern: 'fallthrough|console',
            }],

            'comma-dangle': [2, 'always-multiline'],

            'comma-spacing': [2, {
                after: true,
                before: false,
            }],

            curly: 2,
            'dot-location': [2, 'property'],
            'dot-notation': 2,
            'eol-last': [2, 'always'],
            eqeqeq: 2,
            'import/first': 2,
            'import/newline-after-import': 2,

            'import/order': [2, {
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: false,
                },

                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'never',
            }],

            indent: [2, 4, {
                SwitchCase: 1,

                ignoredNodes: [
                    'AwaitExpression > CallExpression',
                    'CallExpression :matches(ObjectExpression, CallExpression, BlockStatement)',
                    ':matches(AssignmentExpression, VariableDeclarator) CallExpression ArrayExpression',
                    'SpreadElement MemberExpression',
                    'PropertyDefinition[decorators]',
                ],
            }],

            'key-spacing': [2, {
                afterColon: true,
                beforeColon: false,
            }],

            'keyword-spacing': 2,
            'linebreak-style': [2, 'unix'],

            'logical-assignment-operators': [2, 'always', {
                enforceForIfStatements: true,
            }],

            'max-statements-per-line': 2,
            'multiline-comment-style': [2, 'starred-block'],
            'newline-per-chained-call': 2,
            'no-console': 2,
            'no-constant-binary-expression': 2,
            'no-constructor-return': 2,
            'no-dupe-else-if': 2,
            'no-dupe-keys': 2,
            'no-duplicate-imports': 2,
            'no-else-return': 2,

            'no-empty': [2, {
                allowEmptyCatch: true,
            }],

            'no-implicit-coercion': 2,
            'no-lonely-if': 2,
            'no-loss-of-precision': 2,
            'no-misleading-character-class': 2,
            'no-mixed-operators': 2,
            'no-multi-spaces': 2,

            'no-multiple-empty-lines': [2, {
                max: 1,
                maxBOF: 1,
                maxEOF: 1,
            }],

            'no-new-object': 2,
            'no-new-wrappers': 2,
            'no-return-await': 2,
            'no-setter-return': 2,
            'no-tabs': 2,
            'no-template-curly-in-string': 2,
            'no-throw-literal': 2,
            'no-trailing-spaces': 2,
            'no-unneeded-ternary': 2,
            'no-unreachable-loop': 2,

            'no-unused-expressions': [2, {
                allowShortCircuit: true,
            }],

            'no-unused-private-class-members': 2,

            'no-unused-vars': [2, {
                args: 'all',
                argsIgnorePattern: '^(req|res|next)$|^_',
                caughtErrors: 'all',
                varsIgnorePattern: '^_$',
            }],

            'no-useless-call': 2,
            'no-useless-concat': 2,
            'no-useless-rename': 2,
            'no-useless-return': 2,
            'no-var': 2,

            'object-curly-newline': [2, {
                consistent: true,
            }],

            'object-curly-spacing': [2, 'never'],
            'object-shorthand': [2, 'properties'],
            'one-var': [2, 'never'],
            'operator-linebreak': [2, 'before'],
            'prefer-arrow-callback': 2,

            'prefer-const': [2, {
                destructuring: 'all',
            }],

            'prefer-destructuring': [2, {
                array: false,
                object: true,
            }],

            'prefer-object-spread': 2,
            'prefer-regex-literals': 2,
            'prefer-rest-params': 2,
            'quote-props': [2, 'as-needed'],

            quotes: [2, 'single', {
                avoidEscape: true,
            }],

            radix: 2,
            'require-atomic-updates': 0,
            semi: [2, 'always'],

            'sort-imports': [2, {
                ignoreCase: true,
                ignoreDeclarationSort: true,
                memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
            }],

            'space-before-blocks': 2,

            'space-before-function-paren': [2, {
                anonymous: 'always',
                asyncArrow: 'always',
                named: 'never',
            }],

            'space-unary-ops': [2, {
                nonwords: false,

                overrides: {
                    '!': true,
                },

                words: true,
            }],

            'spaced-comment': [2, 'always', {
                markers: ['!'],
            }],

            'unicorn/catch-error-name': 2,
            'unicorn/no-array-for-each': 2,
            'unicorn/no-for-loop': 2,
            'unicorn/no-lonely-if': 2,
            'unicorn/no-negated-condition': 2,
            'unicorn/no-nested-ternary': 2,
            'unicorn/no-typeof-undefined': 2,
            'unicorn/no-useless-fallback-in-spread': 2,
            'unicorn/no-useless-promise-resolve-reject': 2,
            'unicorn/no-zero-fractions': 2,
            'unicorn/numeric-separators-style': 2,
            'unicorn/prefer-array-find': 2,
            'unicorn/prefer-array-flat-map': 2,
            'unicorn/prefer-array-index-of': 2,
            'unicorn/prefer-at': 2,
            'unicorn/prefer-date-now': 2,

            'unicorn/prefer-export-from': [2, {
                ignoreUsedVariables: true,
            }],

            'unicorn/prefer-includes': 2,
            'unicorn/prefer-logical-operator-over-ternary': 2,
            'unicorn/prefer-node-protocol': 2,
            'unicorn/prefer-starts-ends-with': 2,
            'unicorn/prefer-string-replace-all': 2,
            'unicorn/prefer-ternary': 2,
            'unicorn/require-array-join-separator': 2,
            'unicorn/throw-new-error': 2,
            yoda: 2,
        },
    },
    {
        files: ['test/test.js'],
        languageOptions: {
            globals: {
                expect: 'readonly',
            },
        },

        rules: {
            'mocha/max-top-level-suites': 0,
            'mocha/no-mocha-arrows': 0,
            'mocha/no-return-from-async': 2,
            'mocha/no-setup-in-describe': 0,
            'mocha/no-skipped-tests': 0,
            'mocha/no-top-level-hooks': 0,
            'mocha/prefer-arrow-callback': 2,
            'mocha/valid-test-description': 2,
            'no-unused-expressions': 0,
            'prefer-arrow-callback': 0,
        },
    },
];
