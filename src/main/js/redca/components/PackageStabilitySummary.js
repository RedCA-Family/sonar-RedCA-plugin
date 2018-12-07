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
import XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { findMeasureComponent, infoIcon } from '../../api';
import { numberWithCommas } from '../../numberFormat';

export default class PackageStabilitySummary extends React.PureComponent {
  static renderTooltipInfo() {
    return (
      <ol style={{ width: '400px' }} className="redca-tooltip-ol">
        <li className="redca-tooltip-li-1">
          {' '}
          Cyclic Dependency
          <ul className="redca-tooltip-ul-1">
            <li>JDepend 기반의 순환참조 리스트</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Total
          <ul className="redca-tooltip-ul-1">
            <li>전체 순환참조 개수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          Cyclic Dependency List
          <ul className="redca-tooltip-ul-1">
            <li>순환참조 리스트</li>
          </ul>
        </li>
      </ol>
    );
  }

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

  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      dependencyList: [],
      name: 'Cyclic Dependency',
      tooltipOpen: false,
      source: '',
      downloading: false,
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

    document.addEventListener('click', this.handleClickTooltipIcon, true);
    this.handleClick = this.handleClick.bind(this);
  }


  findAcycleClass(obj) {
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

  renderWidget() {
    const { tooltipOpen, isListOpen, dependencyList } = this.state;
    return (
      <div>
        <h3 style={{ display: 'inline-block' }}>Cyclic Dependency</h3>
        <div className="redca-tooltip">
          <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
          {tooltipOpen
            && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext">
                {PackageStabilitySummary.renderTooltipInfo()}
              </span>
              <div className="redca-tooltip-arrow" />
            </div>
            )
            }
          {!tooltipOpen
            && <div />
            }
        </div>
        <span role="presentation" className="redca-excel-download-text" onClick={() => this.exportAcycleDependencyList()}> Excel Download </span>
        <div className="block">
          <div className="widget">
            <div className="widget-row">
              {this.renderTotal(this.state)}
            </div>
          </div>

          <div role="presentation" className="widget widget-span-12 dashboard-line" onClick={this.handleClick}>
            <div style={{ float: 'left' }}>Cyclic Dependency List </div>
            {isListOpen && (
            <div style={{ float: 'left' }}>
              {' '}
              {'\u00A0'}
              {' '}
▲
              {' '}
            </div>
            )}
            {!isListOpen && (
            <div style={{ float: 'left' }}>
              {' '}
              {'\u00A0'}
              {' '}
▼
              {' '}
            </div>
            )}
          </div>
          {isListOpen && this.renderList(dependencyList)}
        </div>
      </div>
    );
  }

  handleClick() {
    this.setState(prevState => ({ isListOpen: !prevState.isListOpen }));
  }

  renderDownloadingSpinner() {
    const { downloading } = this.state;
    return (downloading
      && (
        <div id="content">
          <div className="redca-global-loading">
            <i className="spinner redca-global-loading-spinner" />
            <span className="redca-global-loading-text">Downloading...</span>
          </div>
        </div>
      )
    );
  }

    handleClickTooltipIcon = (event) => {
      const domNodeIcon = this.tooltipIcon;
      const domNodeTooltip = this.tooltip;

      if (domNodeTooltip == null && domNodeIcon == null) {
        return;
      }

      if (domNodeIcon && domNodeIcon.contains(event.target)) { // 툴팁 아이콘
        this.setState(prevState => ({ tooltipOpen: !prevState.tooltipOpen }));
      } else if (!domNodeTooltip || !domNodeTooltip.contains(event.target)) { // 툴팁 이외 영역
        this.setState({
          tooltipOpen: false,
        });
      }
    };

    exportAcycleDependencyList() {
      const { project } = this.props;
      this.setState({
        downloading: true,
      });

      const metricKeys = 'ca_acycle_dependency';
      const exportFileName = 'cyclic_dependency_list.xlsx';
      findMeasureComponent(project, metricKeys)
        .then(obj => this.exportExcel((obj.dependencyList ? obj.dependencyList : [])
          .map(o => ({ dependencyFlow: o })), exportFileName));
    }

    exportExcel(classObj, fileName) {
      const sheetName = 'Cyclic Dependency';

      const wb = XLSX.utils.book_new();
      wb.SheetNames.push(sheetName);

      const headerText = [{ dependencyFlow: 'Denpendency Flow' }];
      const header = ['dependencyFlow'];
      const headerTextOptions = { header, skipHeader: true };
      const wscols = [
        { wch: 150 },
      ];

      const ws = XLSX.utils.json_to_sheet(headerText, headerTextOptions);
      ws['!cols'] = wscols;
      XLSX.utils.sheet_add_json(ws, classObj, { header, skipHeader: true, origin: 'A2' });

      wb.Sheets[sheetName] = ws;

      XLSX.writeFile(wb, fileName, { bookType: 'xlsx', type: 'binary' });

      this.setState({
        downloading: false,
      });
    }

    renderTotal(obj) {
      const { project } = this.props;
      return (
        <div className="widget-span widget-span-12">
          <div className="widget-measure-container">
            <p className="widget-measure widget-measure-main">
              <span className="widget-label">Total</span>
              <span className="nowrap">
                <a href={`/project/extension/RedCA/package_stability_detail?id=${project.key}`} className="widget-link">{numberWithCommas(obj.total)}</a>
              </span>
            </p>
          </div>
        </div>
      );
    }

    renderList(obj) {
      return (
        <div className="widget-span widget-span-12">
          <table className="data zebra">
            <tbody>
              {(obj || []).map((value) => {
                const acycleClassNameList = PackageStabilitySummary.splitAcycleClass(value);
                const acycleClassName = this.findAcycleClass(acycleClassNameList);
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
        </div>
      );
    }

    render() {
      return (
        <div>
          {this.renderWidget()}
          {this.renderDownloadingSpinner()}
        </div>
      );
    }
}

PackageStabilitySummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
