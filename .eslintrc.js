module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "prettier",
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        process: "readonly",
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
            modules: true,
        },
        sourceType: "module",
    },
    plugins: ["react", "@typescript-eslint", "prettier"],
    rules: {
        "prettier/prettier": "error",
        "react/jsx-indent-props": ["error", "first"],
        "react/react-in-jsx-scope": "off",
        "react/jsx-uses-react": "off",
        "react/forbid-elements": ["error", { forbid: ["b", "font"] }],
        "react/prop-types": ["error", { ignore: ["form", "match", "history"] }],
        "react-hooks/exhaustive-deps": "error",
        "no-restricted-imports": [
            "error",
            {
                "paths": [
                    {
                        "name": "react",
                        "importNames": ["default"],
                        "message": "default-importing React is not necessary",
                    }
                ]
            }
        ],
        "no-prototype-builtins": "off",
        "react/display-name": "off",
        "linebreak-style": ["error", "unix"],
        semi: ["error", "always"],
        "semi-spacing": ["error"],
        "no-var": ["error"],
        "prefer-const": ["error"],
        eqeqeq: ["error"],
        "max-len": ["error", { code: 124, tabWidth: 2, ignoreComments: true, ignoreTemplateLiterals: true }],
        "no-trailing-spaces": ["error"],
        "space-before-blocks": ["error", "always"],
        "eol-last": ["error", "always"],
        "no-restricted-globals": ["error", "event"],
        "brace-style": ["error", "1tbs"],
        camelcase: ["error", { properties: "never" }],
        "space-infix-ops": ["error"],
        "keyword-spacing": ["error", { before: true, after: true }],
        "comma-dangle": [
            "error",
            {
                arrays: "always-multiline",
                objects: "always-multiline",
                imports: "always-multiline",
                exports: "always-multiline",
                functions: "always-multiline",
            },
        ],
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};
