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
  PieChart, Pie, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
} from 'recharts';
import PropTypes from 'prop-types';
import { getRedcaTechnicalDebt, infoIcon } from '../../api';

export default class TechnicalDebtSummary extends React.PureComponent {
  static renderTooltipInfo() {
    return (
      <ol style={{ width: '300px' }} className="redca-tooltip-ol">
        <li className="redca-tooltip-li-1">
          Total(Technical Debt Ratio)
          <ul className="redca-tooltip-ul-1">
            <li>Total : 전체 Technical Debt 합</li>
            <li>
              Technical Debt Ratio
              <ul className="redca-tooltip-ul-2">
                <li>소프트웨어 개발 비용과 수정 비용 간의 비율</li>
                <li>수정 비용 / 개발 비용</li>
              </ul>
            </li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Issues(Inspections)
          <ul className="redca-tooltip-ul-1">
            <li>Issue effort</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Duplication
          <ul className="redca-tooltip-ul-1">
            <li>Duplicated Blocks Count * 2.0MH</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Complexity
          <ul className="redca-tooltip-ul-1">
            <li>Complexity 20초과 건수 * 1.0MH</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Package Stability
          <ul className="redca-tooltip-ul-1">
            <li>Cyclic Dependency 건수 * 4.0MH</li>
          </ul>
        </li>
      </ol>
    );
  }

  static renderPieChart(obj2, obj1) {
    const ratio = obj2.value ? obj2.value : 0;
    const mh = obj1.value ? obj1.value : '0d 0h';

    const chartData = [
      { name: 'TechnicalDebtRatio', value: Number(ratio), fill: '#ff6347' },
      { name: 'NoTechnicalDebtRatio', value: 100 - Number(ratio), fill: '#eee' }];

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
        <text x="50%" y="45%" width={10} scaleToFit={false} textAnchor="middle" dominantBaseline="middle" verticalAnchor="end" fill="#236a97">
          {mh}
        </text>
        <text x="50%" y="55%" width={10} scaleToFit={false} textAnchor="middle" dominantBaseline="middle" verticalAnchor="end" fill="#236a97">
          (
          {ratio}
          %)
        </text>
      </PieChart>
    );
  }

  static renderMeasureMain(obj1, obj2) {
    return (
      <div className="widget-span widget-span-2-5">
        <div className="widget-measure-container">
          <p className="widget-measure widget-measure-main" style={{ display: 'inline-block' }}>
            <span className="widget-label">{obj1.name}</span>
            <span className="nowrap">
              {TechnicalDebtSummary.renderPieChart(obj2, obj1)}
            </span>
          </p>
        </div>
      </div>
    );
  }

  static renderMeasureSub(objArray, objArray2) { // stateObj1, stateObj2, stateObj3, stateObj4) {
    return objArray.map((obj, i) => (
      <div className="widget-span widget-span-3">
        <div className="widget-measure-container">
          <p className="widget-measure widget-measure">
            <span className="widget-label">{obj.name}</span>
            <span className="nowrap">
              <a href={obj.link} className="widget-link">
                {obj.value ? obj.value : '0d 0h'}
                (
                {objArray2[i].value ? objArray2[i].value : 0}
                %)
              </a>
            </span>
          </p>
        </div>
      </div>
    ));
  }

  constructor(props) {
    super(props);
    this.state = {
      acyclicDependencyDebt: {
        name: '',
        value: 0,
        link: '',
      }, // Package Stability
      totalDebt: {
        name: '',
        value: 0,
        link: '',
      },
      duplicationDebt: {
        name: '',
        value: 0,
        link: '',
      },
      complexityDebt: {
        name: '',
        value: 0,
        link: '',
      },
      violationDebt: {
        name: '',
        value: 0,
        link: '',
      }, // Issues(Inpections)

      totalDebtRatio: { value: 0 },
      violationDebtRatio: { value: 0 },
      duplicationDebtRatio: { value: 0 },
      complexityDebtRatio: { value: 0 },
      acyclicDependencyDebtRatio: { value: 0 },

      tooltipOpen: false,
    };
  }

  componentDidMount() {
    const { project } = this.props;

    getRedcaTechnicalDebt(project).then((valuesReturnedByAPI) => {
      const apiRslt = valuesReturnedByAPI;
      apiRslt.totalDebt.name = 'Total(Technical Debt Ratio)';
      apiRslt.acyclicDependencyDebt.name = 'Package Stability';
      apiRslt.violationDebt.name = 'Issues(Inspections)';
      apiRslt.duplicationDebt.name = 'Duplication';
      apiRslt.complexityDebt.name = 'Complexity';

      apiRslt.totalDebt.link = '';
      apiRslt.acyclicDependencyDebt.link = `/project/extension/RedCA/package_stability_detail?id=${project.key}`;
      apiRslt.violationDebt.link = `/project/issues?id=${project.key}&resolved=false`;
      apiRslt.duplicationDebt.link = `/component_measures?id=${project.key}&metric=Duplications`;
      apiRslt.complexityDebt.link = `/project/extension/RedCA/complexity_detail?id=${project.key}`;

      this.setState(apiRslt);
    });

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
      tooltipOpen, totalDebt, totalDebtRatio, violationDebt,
      duplicationDebt, complexityDebt, acyclicDependencyDebt,
      violationDebtRatio, duplicationDebtRatio, complexityDebtRatio,
      acyclicDependencyDebtRatio,
    } = this.state;

    return (
      <div>
        <h3 style={{ display: 'inline-block' }}>Technical Debt</h3>
        <div className="redca-tooltip">
          <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
          {tooltipOpen
                    && (
                    <div ref={(c) => { this.tooltip = c; }}>
                      <span className="redca-tooltiptext">
                        {TechnicalDebtSummary.renderTooltipInfo()}
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
              <div className="widget-span widget-span-2-5" style={{ display: 'inline-block' }}>
                {TechnicalDebtSummary.renderMeasureMain(totalDebt, totalDebtRatio)}
              </div>

              <div className="widget-span widget-span-9-5" style={{ verticalAlign: 'bottom' }}>
                <div style={{
                  height: '30%', width: '94%', alignContent: 'baseline', padding: '20px 5px',
                }}
                >
                  {this.renderStackedBarChart()}
                </div>
                <div style={{ height: '70%' }}>
                  {TechnicalDebtSummary.renderMeasureSub([violationDebt,
                    duplicationDebt,
                    complexityDebt,
                    acyclicDependencyDebt],
                  [violationDebtRatio,
                    duplicationDebtRatio,
                    complexityDebtRatio,
                    acyclicDependencyDebtRatio])}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderStackedBarChart() {
    const {
      violationDebtRatio,
      duplicationDebtRatio,
      complexityDebtRatio,
      acyclicDependencyDebtRatio,
      totalDebtRatio,
    } = this.state;
    const dataArr = [];
    const data = {};
    data.issues = violationDebtRatio.value;
    data.duplication = duplicationDebtRatio.value;
    data.complexity = complexityDebtRatio.value;
    data.stability = acyclicDependencyDebtRatio.value;
    data.name = 'technical dept';
    dataArr.push(data);

    return (
      <ResponsiveContainer height={50}>
        <BarChart data={dataArr} layout="vertical">
          <XAxis type="number" hide="true" domain={[0, totalDebtRatio.value]} />
          <YAxis type="category" dataKey="name" hide="true" />
          <Tooltip />
          <Legend align="right" verticalAlign="top" />
          <Bar dataKey="issues" stackId="a" fill="#f94f77" />
          <Bar dataKey="duplication" stackId="a" fill="#f9c759" />
          <Bar dataKey="complexity" stackId="a" fill="#82ca9d" />
          <Bar dataKey="stability" stackId="a" fill="#0088FE" />
        </BarChart>
      </ResponsiveContainer>
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

TechnicalDebtSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
