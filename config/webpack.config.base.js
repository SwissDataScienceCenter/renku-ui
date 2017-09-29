/*
 * Copyright 2017 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path'),
  helpers = require('./helpers'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  ManifestPlugin = require('webpack-manifest-plugin');

let config = {
  entry: {
    'main': helpers.root('/src/main.ts'),
  },
  output: {
    path: helpers.root('/dist'),
    filename: 'js/[name].[hash].js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.html'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  module: {
    rules: [
      { test: /\.ts$/, exclude: /node_modules/, enforce: 'pre', loader: 'tslint-loader' },
      { test: /\.ts$/, exclude: /node_modules/, loader: 'awesome-typescript-loader' },
      { test: /\.html$/, loader: 'raw-loader' },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/assets', to: './assets' },
    ]),
    new ManifestPlugin({
      fileName: 'manifest.json',
      seed: { assets: {}, publicPath: '/ui/static/' },
      reduce: (manifest, {name, path}) => Object.assign(manifest, { assets: Object.assign(manifest.assets, {[name]: path}) })
    }),
  ]
};

module.exports = config;
