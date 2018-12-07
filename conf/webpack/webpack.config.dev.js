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
const webpack = require('webpack');
const config = require('./webpack.config');

config.devtool = 'eval';

config.output.publicPath = '/static/example/';

config.output.pathinfo = true;

Object.keys(config.entry).forEach(key => {
  config.entry[key].unshift(require.resolve('react-dev-utils/webpackHotDevClient'));
});

config.plugins = [new webpack.HotModuleReplacementPlugin()];

module.exports = config;
