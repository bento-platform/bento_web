module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "process": "readonly",
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
            "modules": true,
        },
        "sourceType": "module",
    },
    "plugins": [
        "react",
        "@typescript-eslint",
    ],
    "rules": {
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1,
                "ignoredNodes": [
                    "JSXElement",
                    "JSXElement > *",
                    "JSXAttribute",
                    "JSXIdentifier",
                    "JSXNamespacedName",
                    "JSXMemberExpression",
                    "JSXSpreadAttribute",
                    "JSXExpressionContainer",
                    "JSXOpeningElement",
                    "JSXClosingElement",
                    "JSXText",
                    "JSXEmptyExpression",
                    "JSXSpreadChild",
                ],
                "ignoreComments": true,
            }
        ],
        "react/jsx-indent-props": ["error", "first"],

        // Prevent some legacy HTML tags
        "react/forbid-elements": ["error", {"forbid": ["b", "font"]}],

        "no-prototype-builtins": "off",
        "react/display-name": "off",

        "no-unused-vars": ["error", {"argsIgnorePattern": "^_"}],
        "linebreak-style": ["error", "unix"],
        "react/prop-types": ["error", {"ignore": ["form", "match", "history"]}],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "semi-spacing": ["error"],
        "no-var": ["error"],
        "prefer-const": ["error"],
        "eqeqeq": ["error"],
        "max-len": ["error", {"code": 120}],
        "no-trailing-spaces": ["error"],
        "space-before-blocks": ["error", "always"],
        "eol-last": ["error", "always"],
        "no-restricted-globals": ["error", "event"],
        "brace-style": ["error", "1tbs"],
        "camelcase": ["error", {"properties": "never"}],
        "space-infix-ops": ["error"],
        "keyword-spacing": ["error", {"before": true, "after": true}],
        "comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "always-multiline",
        }],

        // @@typescript-eslint tweaks
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
};
