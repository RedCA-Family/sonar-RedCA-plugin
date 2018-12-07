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
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import PropTypes from 'prop-types';
import { findMeasureComponent, infoIcon } from '../../api';
import { numberWithCommas } from '../../numberFormat';

export default class MartinMetricsSummary extends React.PureComponent {
  static renderTooltipInfo() {
    return (
      <ul style={{ width: '600px' }} className="redca-tooltip-ul-1">
        <li className="redca-tooltip-li-1">
          <a href="http://70.121.244.190/cocook/display/SPC/Robert+Martin+Metrics">http://70.121.244.190/cocook/display/SPC/Robert+Martin+Metrics</a>
          {' '}
          참조
        </li>
      </ul>
    );
  }

  static renderList(obj) {
    return (
      <div className="widget-span widget-span-9-5">
        <table className="data zebra">
          <thead>
            <tr className="code-components-header">
              <th className="thin nowrap text-left code-components-cell">Package Name</th>
              <th className="thin nowrap text-center code-components-cell">Afferent Coupling</th>
              <th className="thin nowrap text-center code-components-cell">Efferent Coupling</th>
              <th className="thin nowrap text-center code-components-cell">Abstractness</th>
              <th className="thin nowrap text-center code-components-cell">Instability</th>
              <th className="thin nowrap text-center code-components-cell">Distance</th>
            </tr>
          </thead>
          <tbody>
            {obj.map(value => (
              <tr>
                <td className="thin nowrap">
                  {/* <a href={'/code?id=' +this.props.project.key
                  + '&selected=' + this.props.project.key
                  + ":" + this.state.source +
                  value.packageName.replace(/\./g,"/")}
                  className="widget-link"> */}
                  {value.packageName}
                  {/* </a> */}
                </td>
                <td className="thin nowrap text-center">
                  {numberWithCommas(value.afferentCoupling)}
                </td>
                <td className="thin nowrap text-center">
                  {numberWithCommas(value.efferentCoupling)}
                </td>
                <td className="thin nowrap text-center">
                  {numberWithCommas(value.abstractness)}
                </td>
                <td className="thin nowrap text-center">
                  {numberWithCommas(value.instability)}
                </td>
                <td className="thin nowrap text-center">
                  {numberWithCommas(value.distance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  static renderGraph(data) {
    return (
      <div className="widget-span widget-span-2-5">
        <ComposedChart
          width={250}
          height={200}
          data={data}
          margin={{
            top: 20, right: 20, bottom: 20, left: 20,
          }}
        >
          {/* 격자 */}
          <CartesianGrid stroke="#f5f5f5" />

          {/* 점 */}
          {/* Visible X */}
          <XAxis xAxisId="abstractness" domain={[0, 1]} type="number" dataKey="abstractness" label={{ value: 'Abstractness', position: 'bottom', offset: 0 }} />
          {/* Visible Y */}
          <YAxis
            domain={[0, 1]}
            type="number"
            label={{
              value: 'Instability', position: 'left', offset: 0, angle: 90,
            }}
          />
          <Line
            xAxisId="abstractness"
            dataKey="instability"
            stroke="transparent"
            isAnimationActive={false}
            dot={{ stroke: 'none', fill: 'red', r: 5 }}
            activeDot={{ stroke: 'none', fill: '#ff7300', r: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* 기준선 */}
          {/* hide X */}
          <XAxis xAxisId="x2" domain={[0, 1]} type="number" dataKey="x2" hide />
          {/* 기준선 */}
          <Line type="monotone" xAxisId="x2" dataKey="uv" stroke="#ff7300" connectNulls dot={false} />
        </ComposedChart>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      topMartinMetricsList: [],
      topMartinMetricsListForGraph: [],
      // source: '',
      name: 'Martin Metrics',
      tooltipOpen: false,
    };
  }

  componentDidMount() {
    const metricKeys = 'ca_martin_matrix';
    const { project } = this.props;
    findMeasureComponent(project, metricKeys).then(
      (valuesReturnedByAPI) => {
        const defaultMartinMatrics = {
          topMartinMetricsList: [],
          topMartinMetricsListForGraph: [],
          source: '',
        };
        const json = JSON.parse(valuesReturnedByAPI.ca_martin_matrix.value)
          ? JSON.parse(valuesReturnedByAPI.ca_martin_matrix.value)
          : defaultMartinMatrics;
        const graphBaseLine = [{ x2: 0, uv: 1 }, { x2: 1, uv: 0 }];
        this.setState({
          topMartinMetricsList: json.topMartinMetricsList,
          topMartinMetricsListForGraph: json.topMartinMetricsList.concat(graphBaseLine),
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
    };

    renderWidget() {
      const {
        tooltipOpen, topMartinMetricsListForGraph, topMartinMetricsList, name,
      } = this.state;
      return (
        <div>
          <h3 style={{ display: 'inline-block' }}>{name}</h3>
          <div className="redca-tooltip">
            <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
            {tooltipOpen
          && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext">
                {MartinMetricsSummary.renderTooltipInfo()}
              </span>
              <div className="redca-tooltip-arrow" />
            </div>
          )}
            {!tooltipOpen
          && <div />}
          </div>
          <div className="block">
            <div className="widget">

              <div className="widget-row">
                {MartinMetricsSummary.renderGraph(topMartinMetricsListForGraph)}
                {MartinMetricsSummary.renderList(topMartinMetricsList)}
              </div>
            </div>
          </div>
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

const CustomTooltip = React.createClass({
  render() {
    const { active, payload } = this.props;

    if (active) {
      return (
        <div className="custom-tooltip">
          <p>{payload[0].payload.packageName}</p>
        </div>
      );
    }
    return null;
  },
});

MartinMetricsSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
