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
import CodesSummary from './redca/components/CodesSummary';
import IssuesSummary from './redca/components/IssuesSummary';
import DuplicationsSummary from './redca/components/DuplicationsSummary';
import CommentsSummary from './redca/components/CommentsSummary';
import PackageStabilitySummary from './redca/components/PackageStabilitySummary';
import ComplexityRateSummary from './redca/components/ComplexityRateSummary';
import UnusedSourceSummary from './redca/components/UnusedSourceSummary';
import UnitTestSummary from './redca/components/UnitTestSummary';
import TechnicalDebtSummary from './redca/components/TechnicalDebtSummary';
import MartinMetricsSummary from './redca/components/MartinMetricsSummary';

import './redca-style.css';

window.registerExtension('RedCA/_redca_dashboard', (options) => {
  const { el } = options;

  render(
    <div className="dashboard-page">
      <div className="page page-limited" id="dashboard">
        <div className="page-main">
          <h1><strong>RedCA Dashboard</strong></h1>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <CodesSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <TechnicalDebtSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <IssuesSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <UnusedSourceSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <DuplicationsSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper" style={{ width: '50%', margin: '0 -1px 0 0' }}>
            <div className="dashboard-column" style={{ margin: '0 5px 0 0px' }}>
              <ComplexityRateSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper" style={{ width: '50%', margin: '0 -1px 0 0' }}>
            <div className="dashboard-column" style={{ margin: '0 0px 0 5px' }}>
              <CommentsSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <PackageStabilitySummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <MartinMetricsSummary
                project={options.component}
              />
            </div>
          </div>
          <div className="dashboard-column-wrapper">
            <div className="dashboard-column">
              <UnitTestSummary
                project={options.component}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    el,
  );
  return () => unmountComponentAtNode(el);
});
