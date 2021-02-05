module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "process": "readonly",
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2019,
        "sourceType": "module"
    },
    "plugins": [
        "react"
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
        "space-before-blocks": ["error", "always"]
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
};
