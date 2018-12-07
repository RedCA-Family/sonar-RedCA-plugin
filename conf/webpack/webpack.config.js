/*
Copyright 2018 Samsung SDS
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
const path = require('path');
const autoprefixer = require('autoprefixer');

const autoprefixerOptions = {
  browsers: [
    'last 3 Chrome versions',
    'last 3 Firefox versions',
    'Safari >= 8',
    'Edge >= 12',
    'IE 11'
  ]
};

const output = path.join(__dirname, '../../target/classes/static');

module.exports = {
  entry: {
    '_redca_dashboard': ['./src/main/js/app-redca_dashboard.js'],
    'unused_code_detail': ['./src/main/js/app-unused_code_detail.js'],
    'complexity_detail': ['./src/main/js/app-complexity_detail.js'],
    'package_stability_detail': ['./src/main/js/app-package_stability_detail.js'],
    'excel_download':['./src/main/js/app-excel-download.js']
  },
  output: {
    path: output,
    filename: '[name].js'
  },
  resolve: {
    root: path.join(__dirname, 'src/main/js')
  },
  externals: {
    lodash: '_',
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-redux': 'ReactRedux',
    'react-router': 'ReactRouter',
    'sonar-request': 'SonarRequest',
    'sonar-measures': 'SonarMeasures',
    'sonar-components': 'SonarComponents'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules)/
      },
      {
        test: /\.css/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      { test: /\.json$/, loader: 'json' },
    ]
  },
  postcss() {
    return [autoprefixer(autoprefixerOptions)];
  }
};
