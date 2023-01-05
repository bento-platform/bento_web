const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const BENTO_URL = process.env.BENTO_URL || process.env.CHORD_URL || null;
const BASE_PATH = BENTO_URL ? (new URL(BENTO_URL)).pathname : "/";

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
            patterns: [{from: "static", to: "static"}],
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
            CUSTOM_HEADER: null,
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "static"),
        },
        compress: true,
        port: process.env.BENTO_WEB_PORT ?? 9000,
        historyApiFallback: true,
    },
};
