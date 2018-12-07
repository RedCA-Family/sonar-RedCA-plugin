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


export default class UnusedSourceList extends React.PureComponent {
  footerOnClick = _.debounce(() => {
  }, 500);

  constructor(props) {
    super(props);
    this.state = {
      unusedCodeList: [],
      unusedCodeListName: 'All (Class, Method, Field, Const)',
      totalSize: 0,
    };
  }

  async componentDidMount() {
    const metricKeys = 'ca_unused_code';
    const { project, query } = this.props;

    let unusedCodeListType = 'All';
    let unusedCodeListName = 'All (Class, Method, Field, Const)';
    if (query.unusedCodeListType != null && query.unusedCodeListType !== undefined) {
      ({ unusedCodeListType } = query);
    }
    if (query.unusedCodeListName != null && query.unusedCodeListName !== undefined) {
      ({ unusedCodeListName } = query);
    }
    this.setState({ unusedCodeListName });

    // eslint-disable-next-line max-len
    let listObj = JSON.parse((await findMeasureComponent(project, metricKeys))[metricKeys].value).unusedCodeList
    // eslint-disable-next-line max-len
      ? JSON.parse((await findMeasureComponent(project, metricKeys))[metricKeys].value).unusedCodeList
      : [];
    if (unusedCodeListType !== 'All' && unusedCodeListType !== '') {
      listObj = listObj.filter(obj => obj.type === query.unusedCodeListType);
    }

    this.setState({ unusedCodeList: listObj, totalSize: listObj.length });
  }

  makeFooter() {
    const { totalSize, unusedCodeList } = this.state;
    return (
      <footer className="spacer-top note text-center">
        {totalSize}
        {' '}
of
        {unusedCodeList.length}
        {' '}
shown
        {totalSize > unusedCodeList.length
            && <span role="presentation" className="spacer-left" onClick={this.footerOnClick}>Show More</span>
        }
      </footer>
    );
  }

  renderUnusedSourceList(obj) {
    return (
      <div className="widget-span widget-span-12">
        <p className="widget-measure widget-measure-main" />
        <table className="data zebra">
          <thead>
            <tr className="code-components-header">
              <th className="thin nowrap text-left code-components-cell">path</th>
              <th className="thin nowrap text-left code-components-cell">class name</th>
              <th className="thin nowrap text-left code-components-cell">line</th>
              <th className="thin nowrap text-left code-components-cell">type</th>
            </tr>
          </thead>
          <tbody>
            {
              obj.map(value => (
                <tr>
                  <td className="thin nowrap">
                    {value.packageName}
                  </td>
                  <td className="thin nowrap">
                    {value.className}
                  </td>
                  <td className="thin nowrap" style={{ align: 'center' }}>{value.line === 0 ? '' : numberWithCommas(value.line)}</td>
                  <td className="thin nowrap" style={{ align: 'center' }}>
                    {' '}
                    {value.type}
                  </td>
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
    const { unusedCodeListName, unusedCodeList } = this.state;
    return (
      <div>
        <h3>
Unused Code List - Type :
          {unusedCodeListName}
          {' '}

        </h3>
        <div className="block">
          <div className="widget">
            <div className="widget-row">
              {this.renderUnusedSourceList(unusedCodeList)}
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

UnusedSourceList.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
