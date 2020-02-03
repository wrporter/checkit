const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: {
        main: './src/index.js',
    },
    output: {
        filename: '[name].js',
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'react-dom': path.resolve('./node_modules/react-dom'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
            },
            {
                test: /\.s?css$/i,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { importLoaders: 2 } },
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                },
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico',
            apiKeys: {
                google: process.env.GOOGLE_OAUTH_CLIENT_ID,
            },
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        contentBase: 'public',
        historyApiFallback: true,
        hot: true,
        open: true,
        openPage: 'http://localhost:8080',
        host: '0.0.0.0',
        proxy: {
            '/api': 'http://localhost:9000',
        },
    },
};
