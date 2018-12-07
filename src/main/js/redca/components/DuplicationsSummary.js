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
import { findMeasureComponent, findRedCADuplictionFilesList, infoIcon } from '../../api';
import { numberWithCommas } from '../../numberFormat';


export default class DuplicationsSummary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      duplicated_lines_density: {
        name: '',
        value: 0,
      },
      duplicated_lines: {
        name: '',
        value: 0,
      },
      duplicated_blocks: {
        name: '',
        value: 0,
      },
      duplicated_files: {
        name: '',
        value: 0,
      },
      duplication_files_list: [],
      tooltipOpen: false,
      isListOpen: false,
    };
  }

  componentDidMount() {
    const metricKeys = 'duplicated_lines_density,duplicated_lines,duplicated_blocks,duplicated_files';
    const { project } = this.props;

    findMeasureComponent(project, metricKeys).then(
      (valuesReturnedByAPI) => {
        this.setState({
          ...valuesReturnedByAPI,
        });
      },
    );

    findRedCADuplictionFilesList(project).then(
      (valuesReturnedByAPI) => {
        this.setState({
          duplication_files_list: valuesReturnedByAPI,
        });
      },
    );

    document.addEventListener('click', this.handleClickTooltipIcon, true);
    this.handleClick = this.handleClick.bind(this);
  }


  handleClickTooltipIcon = (event) => {
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

  handleClick() {
    this.setState(prevState => ({ isListOpen: !prevState.isListOpen }));
  }

  renderWidget() {
    const {
      tooltipOpen,
      duplicated_lines_density,
      duplicated_lines,
      duplicated_blocks,
      duplicated_files,
      isListOpen,
      duplication_files_list,
    } = this.state;
    return (
      <div>
        <h3 style={{ display: 'inline-block' }}>{duplicated_lines_density.name}</h3>
        <div className="redca-tooltip">
          <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
          {tooltipOpen
          && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext">
                {DuplicationsSummary.renderTooltipInfo()}
              </span>
              <div className="redca-tooltip-arrow" />
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
              {this.renderMeasure(duplicated_lines_density)}
              {this.renderMeasureSub(duplicated_lines)}
              {this.renderMeasureSub(duplicated_blocks)}
              {this.renderMeasureSub(duplicated_files)}
            </div>
          </div>
          <div role="presentation" className="widget widget-span-12 dashboard-line" onClick={this.handleClick}>
            <div style={{ float: 'left' }}>Duplication Files Top 5 </div>
            {isListOpen && (
              <div style={{ float: 'left' }}>
                {' '}
                {'\u00A0'}
                ▲
              </div>
            )}
            {!isListOpen && (
              <div style={{ float: 'left' }}>
                {' '}
                {'\u00A0'}
                ▼
              </div>
            )}
          </div>
          {isListOpen && this.renderDuplicationFilesList(duplication_files_list)}
        </div>
      </div>
    );
  }

  renderDuplicationFilesList(duplication_files_list) {
    const { project } = this.props;
    return (
      <div className="widget-span widget-span-12">
        <table className="data zebra">
          <thead>
            <tr className="code-components-header">
              <th className="thin nowrap text-left code-components-cell">Path</th>
              <th className="thin nowrap text-center code-components-cell">Line No.</th>
              <th className="thin nowrap text-center code-components-cell">Total Duplicated Lines</th>
              <th className="thin nowrap text-center code-components-cell">Count</th>
            </tr>
          </thead>
          <tbody>
            {
              duplication_files_list.map((value, i) => {
                if (i < 5) {
                  return (
                    <tr>
                      <td className="thin nowrap">
                        <a href={`/code?id=${project.key}&selected=${project.key}:${value.path}`} className="widget-link">
                          {value.path}
                        </a>
                      </td>
                      <td className="thin nowrap text-center">
                        {numberWithCommas(value.startLine)}
                        {' '}
                      ~
                        {numberWithCommas(value.endLine)}
                      </td>
                      <td className="thin nowrap text-center">
                        {numberWithCommas(value.totalDuplicatedLines)}
                      </td>
                      <td className="thin nowrap text-center">
                        {numberWithCommas(value.count)}
                      </td>
                    </tr>
                  );
                }
                return (<div />);
              })
          }
          </tbody>
        </table>
      </div>
    );
  }

  renderPieChart(obj) {
    const num = obj.value;
    const { project } = this.props;
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
            {obj.value}
            %
          </text>
        </a>

      </PieChart>
    );
  }

  renderMeasure(mainObj) {
    return (
      <div className="widget-span widget-span-3">
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
      <div className="widget-span widget-span-3" style={{ verticalAlign: 'bottom' }}>
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


  static renderTooltipInfo() {
    return (
      <ol style={{ width: '400px' }} className="redca-tooltip-ol">
        <li className="redca-tooltip-li-1">
          {' '}
Duplicated Lines (%)
          <ul className="redca-tooltip-ul-1">
            <li>중복 라인 비율</li>
            <li>(Duplicated Lines / Lines) * 100</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          {' '}
Duplicated Line
          <ul className="redca-tooltip-ul-1">
            <li>중복 라인 수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          {' '}
Duplicated Blocks
          <ul className="redca-tooltip-ul-1">
            <li>중복된 라인 블록 수</li>
            <li>
duplicated block 판단 기준
              <ul className="redca-tooltip-ul-2">
                <li>JAVA : 10개 이상의 연속적으로 중복된 statement</li>
                <li>COBOL : 30라인 내에 100개 이상의 연속적으로 중복된 token</li>
                <li>ABAP : 20라인 내에 100개 이상의 연속적으로 중복된 token</li>
                <li>기타 : 10라인 내에 100개 이상의 연속적으로 중복된 token</li>
              </ul>
            </li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          {' '}
Duplicated Files
          <ul className="redca-tooltip-ul-1">
            <li>중복된 파일 수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          {' '}
Duplication Files Top 5
          <ul className="redca-tooltip-ul-1">
            <li>중복라인 수가 큰 파일 Top 5</li>
          </ul>
        </li>
      </ol>
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

DuplicationsSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
