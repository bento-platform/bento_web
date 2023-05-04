const webpack = require("webpack");
const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const BENTO_URL = process.env.BENTO_URL || process.env.CHORD_URL || null;
const BASE_PATH = BENTO_URL ? (new URL(BENTO_URL)).pathname : "/";

const createServiceInfo = require("./create_service_info");

const PDF_CMAPS_DIR = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "cmaps");
const PDF_STANDARD_FONTS_DIR = path.join(
    path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts");

// noinspection JSUnusedGlobalSymbols
module.exports = {
    entry: ["babel-polyfill", path.resolve(__dirname, "./src/index.js")],
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                exclude: /node_modules/,
                use: ["worker-loader"],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: ["file-loader"],
            },            
        ],
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: BASE_PATH,
        filename: "[name].js",
        chunkFilename: "[name].[contenthash].bundle.js",
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "static", to: "static"},
                {from: PDF_CMAPS_DIR, to: "cmaps/"},
                {from: PDF_STANDARD_FONTS_DIR, to: "standard_fonts/"},
            ],
        }),
        new HtmlWebpackPlugin({
            title: "Bento",
            template: path.resolve(__dirname, "./src/template.html"),
            hash: true,
        }),
        new webpack.EnvironmentPlugin({
            // Default environment variables to null if not set
            BENTO_URL: null,
            CHORD_URL: null,
            BENTO_CBIOPORTAL_ENABLED: false,
            BENTO_CBIOPORTAL_PUBLIC_URL: null,
            CUSTOM_HEADER: null,

            CLIENT_ID: null,
            OPENID_CONFIG_URL: null,

            NODE_ENV: "production",
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "static"),
        },
        compress: true,
        historyApiFallback: true,

        host: "0.0.0.0",
        port: process.env.BENTO_WEB_PORT ?? 9000,

        watchFiles: {
            paths: [
                "src/**/*.js",
                "src/**/*.html",
                "static/**/*",
            ],
            options: {
                usePolling: true,
            },
        },

        setupMiddlewares(middlewares, devServer) {
            if (!devServer) {
                throw new Error("webpack-dev-server is not defined");
            }

            devServer.app.get("/service-info", (req, res) => {
                res.header("Content-Type", "application/json");
                res.json(createServiceInfo.serviceInfo);
            });

            return middlewares;
        },

        allowedHosts: "all",
    },
};
