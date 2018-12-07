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
import _ from 'lodash';
import PropTypes from 'prop-types';
import { findMeasureComponent } from '../../api';
import { numberWithCommas } from '../../numberFormat';

export default class ComplexityList extends React.PureComponent {
  static filterConditon(inputObj, conditionCount) {
    const obj = inputObj || [];
    if (conditionCount === undefined) {
      return obj;
    }

    const returnObj = [];
    obj.forEach((value) => {
      if (value.complexity >= conditionCount) {
        returnObj.push(value);
      }
    });

    return returnObj;
  }

  footerOnClick = _.debounce(() => {
  }, 500);

  constructor(props) {
    super(props);
    this.state = {
      complexityList: [],
      totalSize: 0,
    };
  }

  componentDidMount() {
    const metricKeys = 'ca_complexity_matrix';
    const { project, query } = this.props;
    findMeasureComponent(project, metricKeys).then(
      (valuesReturnedByAPI) => {
        const listObj = ComplexityList.filterConditon(
          valuesReturnedByAPI.complexityList,
          query.conditionCount,
        );

        // sort(내림차순)
        listObj.sort((a, b) => b.complexity - a.complexity);

        this.setState({
          complexityList: listObj,
          totalSize: listObj.length,
        });
      },
    );
  }

  makeFooter() {
    const { totalSize, complexityList } = this.state;
    return (
      <footer className="spacer-top note text-center">
        {totalSize}
          of
        {complexityList.length}
          shown
        {totalSize > complexityList.length
          && <button type="button" className="spacer-left" onClick={this.footerOnClick}>Show More</button>
        }
      </footer>
    );
  }

  makeConditionTitle() {
    const { query } = this.props;
    if (query.conditionCount !== undefined) {
      return `(Over ${query.conditionCount})`;
    }
    return '';
  }

  renderComplexityList(obj) {
    const { project } = this.props;
    return (
      <div className="widget-span widget-span-12">
        <table className="data zebra">
          <thead>
            <tr className="code-components-header">
              <th className="thin nowrap text-left code-components-cell">Path</th>
              <th className="thin nowrap text-left code-components-cell">Method name</th>
              <th className="thin nowrap text-center code-components-cell">Line</th>
              <th className="thin nowrap text-center code-components-cell">Complexity</th>
            </tr>
          </thead>
          <tbody>
            {
              obj.map(value => (
                <tr>
                  <td className="thin nowrap">
                    <a href={`/code?id=${project.key}&selected=${project.key}:${value.path}`} className="widget-link">
                      {value.path}
                    </a>
                  </td>
                  <td className="thin nowrap">{value.methodName}</td>
                  <td className="thin nowrap text-center">
                    <a href={`/code?id=${project.key}&selected=${project.key}:${value.path}&line=${value.line}`} className="widget-link">
                      {numberWithCommas(value.line)}
                    </a>
                  </td>
                  <td className="thin nowrap text-center">{numberWithCommas(value.complexity)}</td>
                </tr>
              ))
          }
          </tbody>
        </table>
        {this.makeFooter()}
      </div>
    );
  }

  renderWidget() {
    const { complexityList } = this.state;
    return (
      <div>
        <h3>
          Functional Complexity List
          {this.makeConditionTitle()}
        </h3>
        <div className="block">
          <div className="widget">
            <div className="widget-row">
              {this.renderComplexityList(complexityList)}
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

ComplexityList.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
  query: PropTypes.shape({
    conditionCount: PropTypes.number.isRequired,
  }).isRequired,
};
