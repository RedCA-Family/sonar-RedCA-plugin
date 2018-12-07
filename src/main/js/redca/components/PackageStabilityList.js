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
import { findMeasureComponent } from '../../api';

export default class PackageStabilityList extends React.PureComponent {
  static splitAcycleClass(obj) {
    const splitAcycleList = [];
    const splitedStringList = obj.split(' |-> ');
    splitedStringList.forEach((splitedString) => {
      const splitedStringList2 = splitedString.split(' | ');
      splitedStringList2.forEach((splitedString2) => {
        splitAcycleList.push(splitedString2);
      });
    });
    return splitAcycleList;
  }

  static findAcycleClass(obj) {
    const reducedObjs = obj.reduce((x, y) => {
      const rslt = x;
      // eslint-disable-next-line no-plusplus
      rslt[y] = ++rslt[y] || 1;
      return rslt;
    }, {});

    let acycleClassName = '';
    for (const key in reducedObjs) {
      if (reducedObjs[key] > 1) {
        acycleClassName = key;
        break;
      }
    }
    return acycleClassName;
  }

  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      dependencyList: [],
      name: 'Cyclic Dependency',
      isListOpen: false,
      source: '',
    };
  }

  componentDidMount() {
    const { project } = this.props;
    const metricKeys = 'ca_acycle_dependency';
    findMeasureComponent(project, metricKeys).then((valuesReturnedByAPI) => {
      this.setState(prevState => ({
        ...prevState,
        total: (valuesReturnedByAPI.dependencyList
          ? valuesReturnedByAPI.dependencyList.length
          : 0),
        dependencyList: (valuesReturnedByAPI.dependencyList
          ? valuesReturnedByAPI.dependencyList
          : []),
        source: (valuesReturnedByAPI.source
          ? valuesReturnedByAPI.source
          : ''),
      }));
    });
  }

  makeFooter() {
    const { total, dependencyList } = this.state;
    return (
      <footer className="spacer-top note text-center">
        {total}
        {' '}
of
        {dependencyList.length}
        {' '}
shown
        <div role="presentation" className="spacer-left" onClick={this.footerOnClick}>Show More</div>
        {total > dependencyList.length
                && <div role="presentation" className="spacer-left" onClick={this.footerOnClick}>Show More</div>
                }
      </footer>
    );
  }


  renderAcycleDependencyList(obj) {
    return (
      <div className="widget-span widget-span-12">
        <table className="data zebra">
          <thead>
            <tr className="code-components-header">
              <th className="thin nowrap text-left code-components-cell">Dependency List</th>
            </tr>
          </thead>
          <tbody>
            {obj.map((value) => {
              const acycleClassNameList = PackageStabilityList.splitAcycleClass(value);
              const acycleClassName = PackageStabilityList.findAcycleClass(acycleClassNameList);
              const acycleClassNameListSize = acycleClassNameList.length;

              return (
                <tr>
                  <td className="thin nowrap">
                    {
                    acycleClassNameList.map((splitedString, i) => {
                      if (splitedString === acycleClassName) {
                        if (acycleClassNameListSize - 1 > i) {
                          return (
                            <span>
                              <span style={{ color: 'red', borderBottom: 'dashed', borderBottomWidth: 0 }}>{splitedString}</span>
                              <span> → </span>
                            </span>
                          );
                        }
                        return (
                          <span>
                            <span style={{ color: 'red', borderBottom: 'dashed', borderBottomWidth: 0 }}>{splitedString}</span>
                          </span>
                        );
                      }
                      if (acycleClassNameListSize - 1 > i) {
                        return (
                          <span>
                            <span>{splitedString}</span>
                            <span> → </span>
                          </span>
                        );
                      }
                      return (
                        <span>
                          <span>{splitedString}</span>
                        </span>
                      );
                    })
                  }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {this.makeFooter()}
      </div>
    );
  }


  renderWidget() {
    const { dependencyList } = this.state;
    return (
      <div>
        <h3>Cyclic Dependency</h3>
        <div className="block">
          <div className="widget">
            <div className="widget-row">
              {this.renderAcycleDependencyList(dependencyList)}
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

PackageStabilityList.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
