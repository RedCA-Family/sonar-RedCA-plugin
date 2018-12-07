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
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import UnusedSourceList from './redca/components/UnusedSourceList';
import './redca-style.css';

window.registerExtension('RedCA/unused_code_detail', (options) => {
  const { el } = options;

  render(
    <div className="page page-limited">
      <UnusedSourceList project={options.component} query={options.location.query} />
    </div>,
    el,
  );
  return () => unmountComponentAtNode(el);
});
