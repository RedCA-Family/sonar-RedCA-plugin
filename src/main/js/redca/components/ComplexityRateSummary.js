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
import PropTypes from 'prop-types';
import { findMeasureComponent, infoIcon } from '../../api';
import { numberWithCommas } from '../../numberFormat';


export default class ComplexityRateSummary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      complexityTotal: { name: 'Total', value: '0' },
      complexityEqualOrOver50: { name: 'Equal Or Over 50', value: '0 (0.0%)' },
      complexityOver20: { name: 'Over 20', value: '0 (0.0%)' },
      complexityOver15: { name: 'Over 15', value: '0 (0.0%)' },
      complexityOver10: { name: 'Over 10', value: '0 (0.0%)' },
      tooltipOpen: false,
    };
  }

  componentDidMount() {
    const metricKeys = 'ca_complexity_matrix';
    const { project } = this.props;
    const {
      complexityEqualOrOver50,
      complexityOver10,
      complexityOver15,
      complexityOver20,
      complexityTotal,
    } = this.state;

    findMeasureComponent(project, metricKeys).then(
      (valuesReturnedByAPI) => {
        const complexityDefault = {
          complexityEqualOrOver50: '0 (0.0%)',
          complexityOver10: '0 (0.0%)',
          complexityOver15: '0 (0.0%)',
          complexityOver20: '0 (0.0%)',
          complexityTotal: '0',
        };
        const complexity = (valuesReturnedByAPI.complexity
          ? valuesReturnedByAPI.complexity
          : complexityDefault);

        this.setState({
          complexityEqualOrOver50: {
            name: complexityEqualOrOver50.name,
            value: complexity.complexityEqualOrOver50,
          },
          complexityOver10: {
            name: complexityOver10.name,
            value: complexity.complexityOver10,
          },
          complexityOver15: {
            name: complexityOver15.name,
            value: complexity.complexityOver15,
          },
          complexityOver20: {
            name: complexityOver20.name,
            value: complexity.complexityOver20,
          },
          complexityTotal: {
            name: complexityTotal.name,
            value: complexity.complexityTotal,
          },
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

    static renderTooltipInfo() {
      return (
        <ol style={{ width: '400px' }} className="redca-tooltip-ol">
          <li className="redca-tooltip-li-1">
            {' '}
          Total
            <ul className="redca-tooltip-ul-1">
              <li>전체 Complexity의 합</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            {' '}
          Equal or Over 50
            <ul className="redca-tooltip-ul-1">
              <li>Complexity 50 이상인 Function 개수( x &gt;=50 )</li>
            </ul>
          </li>
          <li className="redca-tooltip-li-1">
            {' '}
          Over 20
            <ul className="redca-tooltip-ul-1">
              <li>Complexity 20 초과인 Function 개수 ( x &gt; 20 )</li>
            </ul>
          </li>
        </ol>
      );
    }

    renderWidget() {
      const {
        tooltipOpen, complexityTotal, complexityEqualOrOver50, complexityOver20,
      } = this.state;
      return (
        <div>
          <h3 style={{ display: 'inline-block' }}>Functional Complexity</h3>
          <div className="redca-tooltip">
            <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
            {tooltipOpen
          && (
          <div ref={(c) => { this.tooltip = c; }}>
            <span className="redca-tooltiptext">
              {ComplexityRateSummary.renderTooltipInfo()}
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
                <div className="widget-span widget-span-12">
                  <div className="widget-measure-container">
                    {this.renderMeasureMain(complexityTotal)}
                    {this.renderMeasureSub(complexityEqualOrOver50, 50)}
                    {this.renderMeasureSub(complexityOver20, 20)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      );
    }

    renderMeasureSub(obj, conditionCount) {
      const { project } = this.props;
      return (
        <p className="widget-measure widget-measure" style={{ display: 'inline-block' }}>
          <span className="widget-label">
            {obj.name}
            {' '}
          </span>
          <span className="nowrap">
            <a href={`/project/extension/RedCA/complexity_detail?id=${project.key}&conditionCount=${conditionCount}`} className="widget-link">
              {numberWithCommas(obj.value)}
            </a>

          </span>
        </p>
      );
    }

    renderMeasureMain(obj) {
      const { project } = this.props;
      return (
        <p className="widget-measure widget-measure-main">
          <span className="widget-label">
            {obj.name}
            {' '}
          </span>
          <span className="nowrap">
            <a href={`/project/extension/RedCA/complexity_detail?id=${project.key}`} className="widget-link">
              {numberWithCommas(obj.value)}
            </a>

          </span>
        </p>
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

ComplexityRateSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
