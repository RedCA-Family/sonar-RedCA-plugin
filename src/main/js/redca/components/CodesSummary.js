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
import {
  PieChart, Pie, Legend, Tooltip, Cell,
} from 'recharts';
import PropTypes from 'prop-types';
import { findMeasureComponent, infoIcon } from '../../api';
import { numberWithCommas } from '../../numberFormat';

export default class CodesSummary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ncloc: { name: '', value: 0 },
      files: { name: '', value: 0 },
      directories: { name: '', value: 0 },
      lines: { name: '', value: 0 },
      functions: { name: '', value: 0 },
      classes: { name: '', value: 0 },
      statements: { name: '', value: 0 },
      tooltipOpen: false,
    };
  }

  componentDidMount() {
    const metricKeys = 'ncloc,files,functions,directories,lines,classes,statements';
    const { project } = this.props;
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

    if (domNodeIcon == null && domNodeTooltip == null) {
      return;
    }

    if (domNodeIcon && domNodeIcon.contains(event.target)) { // 툴팁 아이콘
      this.setState(prevState => ({ tooltipOpen: !prevState.tooltipOpen }));
    } else if (!domNodeTooltip || !domNodeTooltip.contains(event.target)) { // 툴팁 이외영역
      this.setState({
        tooltipOpen: false,
      });
    }
  };

  renderMeasure(mainObj, subObj1, subObj2) {
    const { project } = this.props;
    return (
      <div className="widget-span widget-span-3">
        <div className="widget-measure-container">
          <p className="widget-measure widget-measure-main">
            <span className="widget-label">
              {mainObj.name}
            </span>
            <span className="nowrap">
              <a href={`/component_measures?id=${project.key}&metric=${mainObj.metric}`} className="widget-link">{numberWithCommas(mainObj.value)}</a>
            </span>
          </p>

          { subObj1 !== undefined
            && (
            <p className="widget-measure">
              <span className="widget-label">{subObj1.name}</span>
              <span className="nowrap">
                <a href={`/component_measures?id=${project.key}&metric=${subObj1.metric}`} className="widget-link">{numberWithCommas(subObj1.value)}</a>
              </span>
            </p>
            )
        }

          { subObj2 !== undefined
          && (
          <p className="widget-measure">
            <span className="widget-label">{subObj2.name}</span>
            <span className="nowrap">
              <a href={`/component_measures?id=${project.key}&metric=${subObj2.metric}`} className="widget-link">{numberWithCommas(subObj2.value)}</a>
            </span>
          </p>
          )
      }
        </div>
      </div>
    );
  }

  renderWidget() {
    const {
      tooltipOpen, ncloc, lines, files, directories, functions, classes, statements,
    } = this.state;
    return (
      <div>
        <h3 style={{ display: 'inline-block' }}>Size</h3>
        <div className="redca-tooltip">
          <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
          {tooltipOpen
            && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext">
                {CodesSummary.renderTooltipInfo()}
              </span>
              <div className="redca-tooltip-arrow" />
            </div>
            )
        }
          {!tooltipOpen && <div />}
        </div>
        <div className="block">
          <div className="widget">
            <div className="widget-row">
              {this.renderMeasure(ncloc, lines)}
              {this.renderMeasure(files, directories)}
              {this.renderMeasure(functions, classes, statements)}
              {this.renderCodeChart()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  static renderTooltipInfo() {
    return (
      <ol style={{ width: '600px' }} className="redca-tooltip-ol">
        <li className="redca-tooltip-li-1">
          Lines Of Code
          <ul className="redca-tooltip-ul-1">
            <li>NCLOC( Non-Comment Lines of Code)</li>
            <li>공백, 주석을 제외한 코드 라인 수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Lines
          <ul className="redca-tooltip-ul-1">
            <li>공백, 주석을 포함한 전체 라인 수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Files
          <ul className="redca-tooltip-ul-1">
            <li>파일 수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Directories
          <ul className="redca-tooltip-ul-1">
            <li>디렉토리 수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Functions
          <ul className="redca-tooltip-ul-1">
            <li>function 수</li>
            <li>
              단, 사용 언어에 따라서 다른 기준 적용 (
              <a href="https://docs.sonarqube.org/display/SONAR/Metrics+-+Functions">https://docs.sonarqube.org/display/SONAR/Metrics+-+Functions</a>
              참조)
            </li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Classes
          <ul className="redca-tooltip-ul-1">
            <li>클래스 수 (nested class, interface, enums, annotations 포함)</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Statements
          <ul className="redca-tooltip-ul-1">
            <li>
              Statement 수 (
              <a href="https://docs.sonarqube.org/display/SONAR/Metrics+-+Statements">https://docs.sonarqube.org/display/SONAR/Metrics+-+Statements</a>
              참조)
            </li>
          </ul>
        </li>
      </ol>
    );
  }

  renderCodeChart() {
    const { lines, ncloc } = this.state;
    const data01 = [
      { name: 'comment, space', value: lines.value - ncloc.value },
      { name: 'ncloc', value: Number(ncloc.value) },
    ];
    const COLORS = ['#0088FE', '#00C49F'];

    return (
      <div className="widget-span widget-span-3">
        <PieChart width={140} height={110}>
          <Pie
            isAnimationActive
            data={data01}
            cx={60}
            cy={55}
            outerRadius={46}
            label={this.renderCustomizedLabel}
            labelLine={false}
            startAngle={180}
            endAngle={0}
          >
            {data01.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </div>
    );
  }

    renderCustomizedLabel = ({
      cx, cy, midAngle, innerRadius, outerRadius, percent,
    }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    render() {
      return (
        <div>
          {this.renderWidget()}
        </div>
      );
    }
}

CodesSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
