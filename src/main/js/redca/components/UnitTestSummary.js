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
/* eslint-disable camelcase */
import React from 'react';
import { PieChart, Pie } from 'recharts';
import PropTypes from 'prop-types';
import { findMeasureComponent, infoIcon } from '../../api';
import { numberWithCommas } from '../../numberFormat';


export default class UnitTestSummary extends React.PureComponent {
  static renderTooltipInfo() {
    return (
      <div>
        <ol style={{ width: '400px' }} className="redca-tooltip-ol">
          <li className="redca-tooltip-li-1">
            Coverage
            <ul className="redca-tooltip-ul-1">
              <li>(CT + CF + LC)/(2*B + EL)</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            Line Coverage
            <ul className="redca-tooltip-ul-1">
              <li>LC / EL</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            Condition Coverage
            <ul className="redca-tooltip-ul-1">
              <li>(CT + CF) / (2*B)</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            Unit Test Success
            <ul className="redca-tooltip-ul-1">
              <li>(Unit tests - (Unit test errors + Unit test failures)) / Unit tests * 100</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            Unit Test Failures
            <ul className="redca-tooltip-ul-1">
              <li>exception 발생하여 실패한 단위 테스트 수</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            Unit Test Errors
            <ul className="redca-tooltip-ul-1">
              <li>실패한 단위 테스트 수</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            Unit Tests
            <ul className="redca-tooltip-ul-1">
              <li>전체 단위 테스트 </li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            Unit Test Duration
            <ul className="redca-tooltip-ul-1">
              <li>모든 단위테스트를 실행하는데 걸리는 시간</li>
            </ul>
          </li>
        </ol>

        <ul>
          <li>LC = 테스트된 라인 수(covered lines)</li>
          <li>EL = 전체 라인수(executable lines)</li>
          <li>CT = condition이 &apos;true&apos;로 테스트 된 경우의 수</li>
          <li>CF = condition이 &apos;false&apos;로 테스트 된 경우의 수</li>
          <li>B = condition의 전체 갯수</li>
        </ul>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      coverage: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      line_coverage: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      branch_coverage: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      test_success_density: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      test_failures: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      test_errors: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      tests: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      test_execution_time: {
        name: '',
        value: 0,
        key: '',
        metric: '',
      },
      tooltipOpen: false,
    };
  }

  componentDidMount() {
    const { project } = this.props;
    const metricKeys = 'coverage,line_coverage,branch_coverage,test_success_density,test_failures,test_errors,tests,test_execution_time';
    findMeasureComponent(project, metricKeys).then(
      (valuesReturnedByAPI) => {
        this.setState({
          ...valuesReturnedByAPI,
        });
      },
    );
    document.addEventListener('click', this.handleClick, true);
  }


    handleClick = (event) => {
      const domNodeIcon = this.tooltipIcon;
      const domNodeTooltip = this.tooltip;

      if (domNodeTooltip == null && domNodeIcon == null) {
        return;
      }

      if (domNodeIcon && domNodeIcon.contains(event.target)) { // 툴팁 아이콘
        this.setState(prevState => ({ tooltipOpen: !prevState.tooltipOpen }));
      } else if (!domNodeTooltip || !domNodeTooltip.contains(event.target)) { // 툴팁 이외영역
        this.setState({
          tooltipOpen: false,
        });
      }
    }

    renderWidget() {
      const {
        tooltipOpen, coverage, line_coverage, branch_coverage,
        test_success_density, test_failures, test_errors, tests, test_execution_time,
      } = this.state;
      return (
        <div>
          <h3 style={{ display: 'inline-block' }}>Test</h3>
          <div className="redca-tooltip">
            <div ref={(c) => { this.tooltipIcon = c; }}><img className="redca-info-icon" src={infoIcon} /></div>
            {tooltipOpen
          && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext-bottom">
                {UnitTestSummary.renderTooltipInfo()}
              </span>
              <div className="redca-tooltip-arrow-bottom" />
            </div>
          )
          }
            {!tooltipOpen
          && <div />
          }
          </div>
          <div className="block">
            <div className="widget">
              <div className="widget-row">
                {this.renderMeasure(coverage)}
                {this.renderMeasureSub(line_coverage)}
                {this.renderMeasureSub(branch_coverage)}
                {this.renderMeasure(test_success_density)}
                {this.renderMeasureSub(test_failures)}
                {this.renderMeasureSub(test_errors)}
                {this.renderMeasureSub(tests)}
                {this.renderMeasureSub(test_execution_time)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    renderPieChart(obj) {
      const { project } = this.props;
      const num = obj.value;
      const chartData = [
        { name: 'duplicated_lines_density', value: num - 0, fill: '#ff6347' },
        { name: 'no_duplicated_lines_density', value: 100 - num, fill: '#eee' }];

      return (
        <PieChart width={200} height={130}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={450}
            innerRadius="70%"
            outerRadius="90%"
            stroke="none"
            isAnimationActive
          />

          <a href={`/component_measures?id=${project.key}&metric=${obj.metric}`} className="widget-link">
            <text style={{ textDecorationLine: 'underline' }} x="50%" y="50%" width={10} scaleToFit={false} textAnchor="middle" dominantBaseline="middle" verticalAnchor="end" fill="#236a97">
              {numberWithCommas(obj.value)}
%
            </text>
          </a>

        </PieChart>
      );
    }

    renderMeasure(mainObj) {
      return (
        <div className="widget-span widget-span-2-5">
          <div className="widget-measure-container">
            <p className="widget-measure widget-measure-main">
              <span className="widget-label">{mainObj.name}</span>
              <span className="nowrap">
                {this.renderPieChart(mainObj)}
              </span>
            </p>
          </div>
        </div>
      );
    }

    renderMeasureSub(subObj1) {
      const { project } = this.props;
      return (
        <div className="widget-span widget-span-1-5" style={{ verticalAlign: 'bottom' }}>
          <p className="widget-measure widget-measure" style={{ display: 'inline-block' }}>
            <span className="widget-label">{subObj1.name}</span>
            <span className="nowrap">
              <a href={`/component_measures?id=${project.key}&metric=${subObj1.metric}`} className="widget-link">
                {numberWithCommas(subObj1.value)}
              </a>
            </span>
          </p>
        </div>
      );
    }

    render() {
      return (
        <div>
          {this.renderWidget()}
        </div>
      );
    }
}

UnitTestSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
