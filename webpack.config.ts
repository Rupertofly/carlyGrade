/* eslint-disable @typescript-eslint/no-var-requires */
import * as wp from 'webpack';
const path = require('path');

const sveltePreprocess = require('svelte-preprocess');
const webpackConfiguration: wp.Configuration = {
  resolve: {
    extensions: ['.ts', '.svelte', '.mjs', '.js'],
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  devtool: 'source-map',
  entry: {
    index: path.resolve(__dirname, 'src', 'index.ts'),
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
  },
  module: {
    rules: [
      {
        test: /.svelte$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            preprocess: sveltePreprocess({
              typescript: { tsconfigFile: __dirname + '/tsconfig.json' },
            }),
          },
        },
      },
      {
        test: /.ts$/,
        use: 'ts-loader',
      },
    ],
  },
};

exports.default = webpackConfiguration;
