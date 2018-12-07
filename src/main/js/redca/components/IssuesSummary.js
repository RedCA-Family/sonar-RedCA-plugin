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
import XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import PropTypes from 'prop-types';
import {
  findMeasureComponent, findIssueFacets, findRules, getIssue, infoIcon, getSource,
} from '../../api';
import { numberWithCommas } from '../../numberFormat';


export default class IssuesSummary extends React.PureComponent {
  static makeCommentsString(issueList_i) {
    let commentsString = '';
    issueList_i.comments.forEach((value) => {
      const comment = value;
      commentsString += `${comment.markdown}(${comment.login}, ${comment.createdAt}) \n`;
    });
    return commentsString;
  }

  static async consoleSource(sourceResult, startLine, endLine, msg = '') {
    const div = document.createElement('div');
    let rsltString = `[${startLine}~${endLine}] ${msg}<br>`;
    await sourceResult.sources.forEach((value) => {
      rsltString = `${rsltString}[${value[0]}] ${value[1]}<br>`;
    });
    rsltString += '<br>';
    div.innerHTML = rsltString;
    return div.innerText;
  }

  static async makeSourceString(issueList_i) {
    const sourceStartLine = issueList_i.textRange.startLine;
    const sourceEndLine = issueList_i.textRange.endLine;
    const componentKey = issueList_i.component;

    const sourceOptions = {
      key: componentKey,
      from: sourceStartLine,
      to: sourceEndLine,
    };

    return IssuesSummary.consoleSource(
      await getSource(sourceOptions), sourceStartLine, sourceEndLine,
    );
  }

  static getSeveritiesOrder(v) {
    if (v.val === 'BLOCKER') {
      return 1;
    } if (v.val === 'CRITICAL') {
      return 2;
    } if (v.val === 'MAJOR') {
      return 3;
    } if (v.val === 'MINOR') {
      return 4;
    } if (v.val === 'INFO') {
      return 5;
    }
    return -1;
  }

  static async makeFlowsString(issueList_i) {
    let flowsString = '';

    for (let j = 0; j < issueList_i.flows.length; j += 1) {
      const flow = issueList_i.flows[j];
      for (let k = 0; k < flow.locations.length; k += 1) {
        const location = flow.locations[k];
        const { startLine, endLine } = location.textRange;
        const { msg } = location;
        const componentKey = issueList_i.component;

        const sourceOptions = {
          key: componentKey,
          from: startLine,
          to: endLine,
        };

        // eslint-disable-next-line no-await-in-loop
        flowsString += await IssuesSummary.consoleSource(
          // eslint-disable-next-line no-await-in-loop
          await getSource(sourceOptions), startLine, endLine, msg,
        );
      }
    }
    return flowsString;
  }

  static renderTooltipInfo() {
    return (
      <ol style={{ width: '600px' }} className="redca-tooltip-ol">
        <li className="redca-tooltip-li-1">
          {' '}
          Issues
          <ul className="redca-tooltip-ul-1">
            <li>전체 coding rule 위반 건수</li>
          </ul>
        </li>
        <li className="redca-tooltip-li-1">
          {' '}
          Severities(심각도)
          <ol className="redca-tooltip-ol-1">
            <li>
              Blocker
              <ul className="redca-tooltip-ul-2">
                <li>
                  application의 동작에 영향을 줄 가능성이 높은
                  버그, 반드시 수정되어야 함
                </li>
                <li>
                  ex) memory leak, unclosed JDBC
                  connection
                </li>
              </ul>
            </li>
            <li>
              Critical
              <ul className="redca-tooltip-ul-2">
                <li>
                  application의 동작에 영향을 줄 가능성이 낮은
                  버그 또는 보안결함, 즉시 검토 필요
                </li>
                <li>ex) empty catch block, SQL injection….</li>
              </ul>
            </li>
            <li>
              Major
              <ul className="redca-tooltip-ul-2">
                <li>
                  개발자의 생산성에 큰 영향을 줄 수 있는 품질 결
                  함
                </li>
                <li>
                  ex) uncovered piece of code, duplicated
                  blocks, unused parameters…
                </li>
              </ul>
            </li>
            <li>
              Minor
              <ul className="redca-tooltip-ul-2">
                <li>
                  개발자의 생산성에 약간의 영향을 줄 수 있는 품
                  질 결함
                </li>
                <li>
                  ex) lines should not be too long, &quot;switch&quot;
                  statements should have at least 3 cases, ...
                </li>
              </ul>
            </li>
            <li>
              Info
              <ul className="redca-tooltip-ul-2">
                <li>information</li>
              </ul>
            </li>
          </ol>
        </li>
        <li className="redca-tooltip-li-1">
          {' '}
          Rule Type
          <ol className="redca-tooltip-ol-1">
            <li>
              Bug
              <ul className="redca-tooltip-ul-2">
                <li>명백하게 잘못된 코드</li>
              </ul>
            </li>
            <li>
              Vulnerabilities
              <ul className="redca-tooltip-ul-2">
                <li>해커가 악용할 수 있는 코드</li>
              </ul>
            </li>
            <li>
              Code Smells
              <ul className="redca-tooltip-ul-2">
                <li>bug, vulnerability를 제외한 코드</li>
              </ul>
            </li>
          </ol>
        </li>
        <li>
          {' '}
          Issues Rules Top
        </li>
      </ol>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      violations: {
        name: '',
        total: 0,
        values: [],
      },
      vulnerabilities: {
        name: '',
        total: 0,
        values: [],
        link_key: 'VULNERABILITY',
        color: '#f9c759',
      },
      code_smells: {
        name: '',
        total: 0,
        values: [],
        link_key: 'CODE_SMELL',
        color: '#82ca9d',
      },
      bugs: {
        name: '',
        total: 0,
        values: [],
        link_key: 'BUG',
        color: '#f94f77',
      },
      isListOpen: false,
      tooltipOpen: false,
      downloading: false,
    };
  }

  componentDidMount() {
    this.getData();
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClickTooltipIcon, true);
  }


  async getSeveritiesName(metricKeys) {
    const { project } = this.props;
    return findMeasureComponent(project, metricKeys);
  }

  async getSeveritiesFacets(type) {
    const facets = await this.getIssueFacets('severities', 'count', type, false);

    facets.values.sort((a, b) => {
      const aOrder = IssuesSummary.getSeveritiesOrder(a);
      const bOrder = IssuesSummary.getSeveritiesOrder(b);
      return aOrder - bOrder;
    });

    return {
      total: facets.total,
      values: facets.values,
    };
  }

  async getViolations() {
    const { project } = this.props;
    const violations = await this.getIssueFacets('rules', 'count', '', false);
    violations.values.map(async (value, i) => {
      if (value.val !== '' && i < 5) {
        const rules = await findRules(project, value.val);
        violations.values[i].name = rules.values[0].name;
      }
    });
    return violations;
  }

  async getIssueFacets(facets, facetMode, types, resolved) {
    const { project } = this.props;
    const facetsRslt = await findIssueFacets(project, facets, facetMode, types, resolved);
    return {
      total: facetsRslt.total,
      values: facetsRslt.values[0].values,
    };
  }


  async getData() {
    const {
      bugs, vulnerabilities, code_smells,
    } = this.state;

    const violationsSeveritiesFacets = await this.getViolations();

    // bugs
    const bugsSeveritiesFacets = await this.getSeveritiesFacets('BUG');
    const bugsFacets = {
      ...bugs,
      ...bugsSeveritiesFacets,
    };

    // vulnerability
    const vulnerabilitiesSeveritiesFacets = await this.getSeveritiesFacets('VULNERABILITY');
    const vulnerabilitiesFacets = {
      ...vulnerabilities,
      ...vulnerabilitiesSeveritiesFacets,
    };

    // code smell
    const codeSmellSeveritiesFacets = await this.getSeveritiesFacets('CODE_SMELL');
    const codeSmellsFacets = {
      ...code_smells,
      ...codeSmellSeveritiesFacets,
    };

    // Name
    const SeveritiesNames = await this.getSeveritiesName('violations,vulnerabilities,code_smells,bugs');
    const violationsWithName = {
      ...violationsSeveritiesFacets,
      name: SeveritiesNames.violations.name,
    };

    const bugsFacetsWithName = {
      ...bugsFacets,
      name: SeveritiesNames.bugs.name,
    };

    const vulnerabilitiesFacetsWithName = {
      ...vulnerabilitiesFacets,
      name: SeveritiesNames.vulnerabilities.name,
    };

    const codeSmellsFacetsWithName = {
      ...codeSmellsFacets,
      name: SeveritiesNames.code_smells.name,
    };
    this.setState({
      violations: violationsWithName,
      bugs: bugsFacetsWithName,
      vulnerabilities: vulnerabilitiesFacetsWithName,
      code_smells: codeSmellsFacetsWithName,
    });
  }

  handleClickTooltipIcon = (event) => {
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

  handleClick() {
    this.setState(prevState => ({ isListOpen: !prevState.isListOpen }));
  }

  async issueHandle(issueList, issueListOptions) {
    const { project } = this.props;
    const valuesReturnedByAPI = await getIssue(issueListOptions);
    let fullIssueList = issueList.concat(valuesReturnedByAPI.issues);

    const pageIdx = valuesReturnedByAPI.p;
    const pagingSize = valuesReturnedByAPI.ps;
    const pageTotalSize = pageIdx * pagingSize;
    const nextPageIdx = pageIdx + 1;
    if (valuesReturnedByAPI.total > pageTotalSize) {
      const thisIssueListOptions = {
        componentKeys: project.key,
        statuses: 'OPEN,CONFIRMED,REOPENED,RESOLVED',
        ps: pagingSize,
        p: nextPageIdx,
        additionalFields: 'comments',
      };

      fullIssueList = await this.issueHandle(fullIssueList, thisIssueListOptions);
    } else {
      for (let i = 0; i < fullIssueList.length; i += 1) {
        delete fullIssueList[i].key;
        delete fullIssueList[i].hash;
        delete fullIssueList[i].tags;
        delete fullIssueList[i].creationDate;
        delete fullIssueList[i].updateDate;
        delete fullIssueList[i].organization;
        delete fullIssueList[i].effort;

        fullIssueList[i].commentsString = IssuesSummary.makeCommentsString(fullIssueList[i]);

        // sourceString
        if (fullIssueList[i].textRange !== undefined) {
          if (fullIssueList[i].sourceString === undefined) fullIssueList[i].sourceString = '';
          // eslint-disable-next-line no-await-in-loop
          fullIssueList[i].sourceString += await IssuesSummary.makeSourceString(fullIssueList[i]);
        }

        // flowsString
        if (fullIssueList[i].flowsString === undefined) fullIssueList[i].flowsString = '';
        // eslint-disable-next-line no-await-in-loop
        fullIssueList[i].flowsString = await IssuesSummary.makeFlowsString(fullIssueList[i]);
      }
    }
    return fullIssueList;
  }

  async exportIssuesList(issueP, issuePs, issueList) {
    const { project } = this.props;
    this.setState({
      downloading: true,
    });

    const issueListOptions = {
      componentKeys: project.key,
      statuses: 'OPEN,CONFIRMED,REOPENED,RESOLVED',
      ps: issuePs,
      p: issueP,
      additionalFields: 'comments',
    };

    try {
      this.exportExcel(await this.issueHandle(issueList, issueListOptions), 'issues.xlsx');
    } catch (exception) {
      this.setState({
        downloading: false,
      });
      // eslint-disable-next-line no-alert
      alert('작업 도중 오류가 발생하였습니다.');
    }
  }

  exportExcel(val, fileName) {
    const wb = XLSX.utils.book_new();
    wb.SheetNames.push('Issues');

    const headerText = [
      {
        project: 'PROJECT',
        component: 'COMPONENT',
        line: 'LINE',
        type: 'TYPE',
        rule: 'RULE',
        message: 'MESSAGE',
        severity: 'SEVERITY',
        debt: 'DEBT',
        author: 'AUTHOR',
        assignee: 'ASSIGNEE',
        status: 'STATUS',
        resolution: 'RESOLUTION',
        commentsString: 'COMMENTS',
        sourceString: 'SOURCE',
        flowsString: 'FLOWS',
      },
    ];

    const issuesListHeader = ['project', 'component', 'line', 'type', 'rule', 'message', 'severity', 'debt', 'author', 'assignee', 'status', 'resolution', 'commentsString', 'sourceString', 'flowsString'];
    const headerTextOptions = { header: issuesListHeader, skipHeader: true };

    const ws = XLSX.utils.json_to_sheet(headerText, headerTextOptions);

    ws['!cols'] = [
      { wch: 20 }, // project
      { wch: 50 }, // component
      { wch: 10 }, // line
      { wch: 15 }, // type
      { wch: 30 }, // rule
      { wch: 70 }, // message
      { wch: 10 }, // severity
      { wch: 10 }, // debt
      { wch: 10 }, // author
      { wch: 10 }, // assignee
      { wch: 15 }, // status
      { wch: 15 }, // resolution
      { wch: 50 }, // commentsString
      { wch: 50 }, // sourceString
      { wch: 50 }, // flowsString
    ];
    XLSX.utils.sheet_add_json(ws, val, { header: issuesListHeader, skipHeader: true, origin: 'A2' });

    wb.Sheets.Issues = ws;

    XLSX.writeFile(wb, fileName, { bookType: 'xlsx', type: 'binary' });

    this.setState({
      downloading: false,
    });
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

  renderSeveritiesOrderChart(obj, color) {
    const objArr = [];
    objArr.push(obj);
    const { violations } = this.state;

    return (
      <ResponsiveContainer height={18}>
        <BarChart data={objArr} layout="vertical">
          <YAxis type="category" dataKey="val" hide="true" />
          <XAxis type="number" dataKey="count" domain={[0, violations.total]} hide="true" />
          <Bar dataKey="count" fill={color} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  renderStackedBarChart() {
    const dataArr = [];
    const {
      vulnerabilities, code_smells, bugs, violations,
    } = this.state;
    const data = {};
    data.vulnerabilities = vulnerabilities.total;
    data.code_smells = code_smells.total;
    data.bugs = bugs.total;
    data.name = 'total_issue_count';
    dataArr.push(data);

    return (
      <ResponsiveContainer height={50}>
        <BarChart data={dataArr} layout="vertical">
          <XAxis type="number" hide="true" domain={[0, violations.total]} />
          <YAxis type="category" dataKey="name" hide="true" />
          <Tooltip />
          <Legend align="right" verticalAlign="top" />
          <Bar dataKey="bugs" stackId="a" fill={bugs.color} />
          <Bar dataKey="vulnerabilities" stackId="a" fill={vulnerabilities.color} />
          <Bar dataKey="code_smells" stackId="a" fill={code_smells.color} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  renderWidget() {
    const {
      tooltipOpen, violations, bugs, vulnerabilities, code_smells, isListOpen,
    } = this.state;
    return (
      <div>
        <h3 style={{ display: 'inline-block' }}>Issues(Inspection)</h3>
        {'\u00A0'}
        <div className="redca-tooltip">
          <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
          {tooltipOpen
          && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext">
                {IssuesSummary.renderTooltipInfo()}
              </span>
              <div className="redca-tooltip-arrow" />
            </div>
          )
          }
          {!tooltipOpen
          && <div />
          }
        </div>
        <span role="presentation" className="redca-excel-download-text" onClick={() => this.exportIssuesList(1, 500, [])}> Excel Download </span>
        <div className="block">
          <div className="widget">
            <div className="widget-row">
              {this.renderMeasureMain(violations)}
              {this.renderMeasure(bugs)}
              {this.renderMeasure(vulnerabilities)}
              {this.renderMeasure(code_smells)}
            </div>
          </div>
          <div role="presentation" className="widget widget-span-12 dashboard-line" onClick={this.handleClick}>
            <div style={{ float: 'left' }}>Issues Rules Top 5</div>
            {isListOpen && (
              <div style={{ float: 'left' }}>
                {' '}
                {'\u00A0'}
                ▲
                {' '}
              </div>
            )}
            {!isListOpen && (
              <div style={{ float: 'left' }}>
                {' '}
                {'\u00A0'}
                ▼
                {' '}
              </div>
            )}
          </div>
          {isListOpen && this.renderTopRules(violations)}
        </div>
      </div>
    );
  }

  renderTopRules(obj) {
    const resolved = false;
    const { project } = this.props;
    return (
      <div className="widget-span widget-span-12">
        <table className="data zebra">
          <thead>
            <tr className="code-components-header">
              <th className="thin nowrap text-left code-components-cell">Rule</th>
              <th className="thin nowrap text-right code-components-cell">Count</th>
            </tr>
          </thead>
          <tbody>
            {obj.values.map((value, i) => {
              if (i < 5) {
                return (
                  <tr>
                    <td className="thin nowrap">
                      {value.name}
                    </td>
                    <td className="thin nowrap text-right">
                      <a
                        href={`/project/issues?id=${project.key}&rules=${value.val}&resolved=${resolved}`}
                        className="widget-link"
                      >
                        {numberWithCommas(value.count)}
                      </a>
                    </td>
                  </tr>
                );
              }
              return (<div />);
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderSeverities(obj) {
    const resolved = false;
    const { project } = this.props;
    return (
      <table className="severities widget-barchar widget-span-9">
        <tbody>
          {obj.values.map((value, i) => {
            if (value.val === 'BLOCKER') {
              return (
                <tr>
                  <td style={{ width: '18px' }}>
                    <i className="icon-severity-blocker" />
                  </td>
                  <td>
                  Blocker
                  </td>
                  <td>
                    {this.renderSeveritiesOrderChart(value, obj.color)}
                  </td>
                  <td className="thin right nowrap">
                    <a
                      href={`/project/issues?id=${project.key}&types=${obj.link_key}&severities=${value.val}&resolved=${resolved}`}
                      className="widget-link"
                    >
                      {numberWithCommas(value.count)}
                    </a>
                  </td>
                </tr>
              );
            }
            return (<div />);
          })}

          {obj.values.map((value, i) => {
            if (value.val === 'CRITICAL') {
              return (
                <tr>
                  <td style={{ width: '18px' }}>
                    <i className="icon-severity-critical" />
                  </td>
                  <td>
                  Critical
                  </td>
                  <td>
                    {this.renderSeveritiesOrderChart(value, obj.color)}
                  </td>
                  <td className="thin right nowrap">
                    <a
                      href={`/project/issues?id=${project.key}&types=${obj.link_key}&severities=${value.val}&resolved=${resolved}`}
                      className="widget-link"
                    >
                      {numberWithCommas(value.count)}
                    </a>
                  </td>
                </tr>
              );
            }
            return (<div />);
          })}

          {obj.values.map((value, i) => {
            if (value.val === 'MAJOR') {
              return (
                <tr>
                  <td style={{ width: '18px' }}>
                    <i className="icon-severity-major" />
                  </td>
                  <td>
                  Major
                  </td>
                  <td>
                    {this.renderSeveritiesOrderChart(value, obj.color)}
                  </td>
                  <td className="thin right nowrap">
                    <a
                      href={`/project/issues?id=${project.key}&types=${obj.link_key}&severities=${value.val}&resolved=${resolved}`}
                      className="widget-link"
                    >
                      {numberWithCommas(value.count)}
                    </a>
                  </td>
                </tr>
              );
            }
            return (<div />);
          })}

          {obj.values.map((value, i) => {
            if (value.val === 'MINOR') {
              return (
                <tr>
                  <td style={{ width: '18px' }}>
                    <i className="icon-severity-minor" />

                  </td>
                  <td>
                  Minor
                  </td>
                  <td>
                    {this.renderSeveritiesOrderChart(value, obj.color)}
                  </td>
                  <td className="thin right nowrap">
                    <a
                      href={`/project/issues?id=${project.key}&types=${obj.link_key}&severities=${value.val}&resolved=${resolved}`}
                      className="widget-link"
                    >
                      {numberWithCommas(value.count)}
                    </a>
                  </td>
                </tr>
              );
            }
            return (<div />);
          })}

          {obj.values.map((value, i) => {
            if (value.val === 'INFO') {
              return (
                <tr>
                  <td style={{ width: '18px' }}>
                    <i className="icon-severity-info" />
                  </td>
                  <td>
                  Info
                  </td>
                  <td>
                    {this.renderSeveritiesOrderChart(value, obj.color)}
                  </td>
                  <td className="thin right nowrap">
                    <a
                      href={`/project/issues?id=${project.key}&types=${obj.link_key}&severities=${value.val}&resolved=${resolved}`}
                      className="widget-link"
                    >
                      {numberWithCommas(value.count)}
                    </a>
                  </td>
                </tr>
              );
            }
            return (<div />);
          })}
        </tbody>
      </table>

    );
  }

  renderMeasure(mainObj) {
    const resolved = false;
    const { project } = this.props;
    return (
      <div className="widget-span widget-span-4">
        <div className="widget-measure-container">
          <p className="widget-measure widget-measure">
            <span className="widget-label">{mainObj.name}</span>
            <span className="nowrap">
              <a
                href={`/project/issues?id=${project.key}&types=${mainObj.link_key}&resolved=${resolved}`}
                className="widget-link"
              >
                {numberWithCommas(mainObj.total)}
              </a>
            </span>
          </p>
          <p>
            {this.renderSeverities(mainObj)}
          </p>
        </div>
      </div>
    );
  }

  renderMeasureMain(mainObj) {
    const resolved = false;
    const { project } = this.props;
    return (
      <div>
        <div className="widget-span widget-span-2-5" style={{ display: 'inline-block' }}>
          <div className="widget-measure-container">
            <p className="widget-measure widget-measure-main" style={{ display: 'inline-block' }}>
              <span className="widget-label">{mainObj.name}</span>
              <span className="nowrap">
                <div>
                  <a
                    href={`/project/issues?id=${project.key}&resolved=${resolved}`}
                    className="widget-link"
                  >
                    {numberWithCommas(mainObj.total)}
                  </a>
                </div>
              </span>
            </p>
          </div>
        </div>
        <div className="widget-span widget-span-9-5" style={{ display: 'inline-block', verticalAlign: 'bottom' }}>
          <div style={{ width: '94%', alignContent: 'baseline', padding: '20px 5px' }}>
            {this.renderStackedBarChart()}
          </div>
        </div>
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

IssuesSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
