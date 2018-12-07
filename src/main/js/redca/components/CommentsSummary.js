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
import { PieChart, Pie } from 'recharts';
import PropTypes from 'prop-types';
import { findMeasureComponent, infoIcon } from '../../api';
import { numberWithCommas } from '../../numberFormat';

export default class CommentsSummary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      comment_lines: { name: '', value: 0 },
      comment_lines_density: { name: '', value: 0 },
      tooltipOpen: false,
    };
  }

  componentDidMount() {
    const metricKeys = 'comment_lines,comment_lines_density';
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

  renderWidget() {
    const {
      // eslint-disable-next-line camelcase
      comment_lines_density, comment_lines, tooltipOpen,
    } = this.state;
    return (
      <div>
        <h3 style={{ display: 'inline-block' }}>{comment_lines_density.name}</h3>
        <div className="redca-tooltip">
          <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
          {tooltipOpen
            && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext">
                {CommentsSummary.renderTooltipInfo()}
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
              {this.renderMeasure(comment_lines_density)}
              {this.renderMeasureSub(comment_lines)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  static renderTooltipInfo() {
    return (
      <ol style={{ width: '400px' }} className="redca-tooltip-ol">
        <li className="redca-tooltip-li-1">
          Comments(%)
          <ul className="redca-tooltip-ul-1">
            <li>전체 소스의 주석 비율</li>
            <li>Comment lines / (Lines of code + Comment lines) * 100</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Comment Lines
          <ul className="redca-tooltip-ul-1">
            <li>주석 라인 수</li>
          </ul>
        </li>
      </ol>
    );
  }

  renderPieChart(obj) {
    const num = obj.value;
    const chartData = [
      { name: 'Color Area', value: num - 0, fill: '#ff6347' },
      { name: 'Gray Area', value: 100 - num, fill: '#eee' }];
    const { project } = this.props;
    return (
      <div>
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
      </div>
    );
  }

  renderMeasure(mainObj) {
    return (
      <div className="widget-span widget-span-6">
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
      <div className="widget-span widget-span-4" style={{ verticalAlign: 'bottom' }}>
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

CommentsSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
