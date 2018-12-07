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
import { PieChart, Pie } from 'recharts';
import PropTypes from 'prop-types';
import { findMeasureComponent, infoIcon } from '../../api';


export default class UnusedSourceSummary extends React.PureComponent {
  static renderTooltipInfo() {
    return (
      <ol style={{ width: '400px' }} className="redca-tooltip-ol">
        <li className="redca-tooltip-li-1">
          {' '}
          Class
          <ul className="redca-tooltip-ul-1">
            <li>Unused Code를 포함하는 Class의 개수</li>
            <li>(Unused Code를 포함하는 Class 수 / 전체 Class 수) * 100</li>
          </ul>
        </li>

        <li className="redca-tooltip-li-1">
          {' '}
          Method
          <ul className="redca-tooltip-ul-1">
            <li>Unused Code를 포함하는 Method의 개수</li>
            <li>(Unused Code를 포함하는 Method 수 / 전체 Method 수) * 100</li>
          </ul>
        </li>

        <li className="redca-tooltip-li-1">
          {' '}
          Field
          <ul className="redca-tooltip-ul-1">
            <li>Unused Code를 포함하는 Field 의 개수</li>
            <li>(Unused Code를 포함하는 Field 수 / 전체 Field 수) * 100</li>
          </ul>
        </li>

        <li className="redca-tooltip-li-1">
          {' '}
          Const
          <ul className="redca-tooltip-ul-1">
            <li>Unused Code를 포함하는 Const 의 개수</li>
            <li>(Unused Code를 포함하는 Const 수 / 전체 Const 수) * 100</li>
          </ul>
        </li>
      </ol>
    );
  }

  static exportExcel(classObj, methodObj, fieldObj, constObj, fileName) {
    const wb = XLSX.utils.book_new();

    wb.SheetNames.push('class');
    wb.SheetNames.push('method');
    wb.SheetNames.push('field');
    wb.SheetNames.push('const');

    const headerText = [
      {
        packageName: 'PATH',
        className: 'CLASS',
        line: 'LINE',
      },
    ];
    const unusedCodeListHeader = ['packageName', 'className', 'line'];

    const headerTextOptions = { header: unusedCodeListHeader, skipHeader: true };

    const wscols = [
      { wch: 70 }, // project
      { wch: 50 }, // component
      { wch: 10 }, // line
    ];

    const wsClass = XLSX.utils.json_to_sheet(headerText, headerTextOptions);
    wsClass['!cols'] = wscols;
    XLSX.utils.sheet_add_json(wsClass, classObj, { header: unusedCodeListHeader, skipHeader: true, origin: 'A2' });

    const wsMethod = XLSX.utils.json_to_sheet(headerText, headerTextOptions);
    wsMethod['!cols'] = wscols;
    XLSX.utils.sheet_add_json(wsMethod, methodObj, { header: unusedCodeListHeader, skipHeader: true, origin: 'A2' });

    const wsField = XLSX.utils.json_to_sheet(headerText, headerTextOptions);
    wsField['!cols'] = wscols;
    XLSX.utils.sheet_add_json(wsField, fieldObj, { header: unusedCodeListHeader, skipHeader: true, origin: 'A2' });

    const wsConst = XLSX.utils.json_to_sheet(headerText, headerTextOptions);
    wsConst['!cols'] = wscols;
    XLSX.utils.sheet_add_json(wsConst, constObj, { header: unusedCodeListHeader, skipHeader: true, origin: 'A2' });

    wb.Sheets.class = wsClass;
    wb.Sheets.method = wsMethod;
    wb.Sheets.field = wsField;
    wb.Sheets.const = wsConst;

    XLSX.writeFile(wb, fileName, { bookType: 'xlsx', type: 'binary' });
  }

  static deleteUnusedCodeColumns(input) {
    const obj = input;
    for (let i = 0; i < obj.length; i += 1) {
      delete obj[i].description;
      delete obj[i].type;
    }
    return obj;
  }

  constructor(props) {
    super(props);
    this.state = {
      unusedClass: {
        name: 'Class',
        count: '',
        type: 'Class',
      },
      unusedMethod: {
        name: 'Method',
        count: '',
        type: 'Method',
      },
      unusedField: {
        name: 'Field',
        count: '',
        type: 'Field',
      },
      unusedConst: {
        name: 'Const',
        count: '',
        type: 'Constant',
      },
      unusedTotal: {
        name: 'Total',
        count: '',
      },
      tooltipOpen: false,
      downloading: false,
    };
  }

  componentDidMount() {
    const metricKeys = 'ca_unused_code';
    const { project } = this.props;
    const {
      unusedClass, unusedMethod, unusedField, unusedConst, unusedTotal,
    } = this.state;
    findMeasureComponent(project, metricKeys).then(
      (valuesReturnedByAPI) => {
        const json = JSON.parse(valuesReturnedByAPI[metricKeys].value);
        const defaultUnusedCodeBoard = {
          constCnt: '0(0.00%)',
          totCnt: '0',
          classCnt: '0(0.00%)',
          methodCnt: '0(0.00%)',
          fieldCnt: '0(0.00%)',
        };
        const unusedCodeBoard = (json.unusedCodeBoard
          ? json.unusedCodeBoard
          : defaultUnusedCodeBoard);
        this.setState({
          unusedClass: {
            ...unusedClass,
            count: unusedCodeBoard.classCnt,
          },
          unusedMethod: {
            ...unusedMethod,
            count: unusedCodeBoard.methodCnt,
          },
          unusedField: {
            ...unusedField,
            count: unusedCodeBoard.fieldCnt,
          },
          unusedConst: {
            ...unusedConst,
            count: unusedCodeBoard.constCnt,
          },
          unusedTotal: {
            ...unusedTotal,
            count: unusedCodeBoard.totCnt,
          },
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
    } else if (!domNodeTooltip || !domNodeTooltip.contains(event.target)) { // 툴팁
      this.setState({
        tooltipOpen: false,
      });
    }
  };

  exportUnusedCodeList() {
    const metricKeys = 'ca_unused_code';
    const { project } = this.props;
    const {
      unusedClass, unusedMethod, unusedField, unusedConst,
    } = this.state;

    this.setState({
      downloading: true,
    });

    findMeasureComponent(project, metricKeys).then(
      (valuesReturnedByAPI) => {
        const listObj = JSON.parse((valuesReturnedByAPI)[metricKeys].value).unusedCodeList
          ? JSON.parse((valuesReturnedByAPI)[metricKeys].value).unusedCodeList
          : [];

        let classObj = listObj.filter(obj => obj.type === unusedClass.type);
        let methodObj = listObj.filter(obj => obj.type === unusedMethod.type);
        let fieldObj = listObj.filter(obj => obj.type === unusedField.type);
        let constObj = listObj.filter(obj => obj.type === unusedConst.type);
        classObj = UnusedSourceSummary.deleteUnusedCodeColumns(classObj);
        methodObj = UnusedSourceSummary.deleteUnusedCodeColumns(methodObj);
        fieldObj = UnusedSourceSummary.deleteUnusedCodeColumns(fieldObj);
        constObj = UnusedSourceSummary.deleteUnusedCodeColumns(constObj);

        UnusedSourceSummary.exportExcel(classObj, methodObj, fieldObj, constObj, 'unused_code_list.xlsx');
        this.setState({
          downloading: false,
        });
      },
    );
  }

  renderMeasureMain(obj) {
    return (

      <div className="widget-span widget-span-3">
        <div className="widget-measure-container">
          <p className="widget-measure widget-measure-main" style={{ display: 'inline-block' }}>
            <span className="widget-label">{obj.name}</span>
            <span className="nowrap">
              {this.renderPieChart(obj)}
            </span>
          </p>
        </div>
      </div>
    );
  }

  renderWidget() {
    const { tooltipOpen } = this.state;
    const {
      unusedClass, unusedMethod, unusedField, unusedConst,
    } = this.state;
    return (
      <div>
        <h3 style={{ display: 'inline-block' }}>Unused Code</h3>
        {'\u00A0'}
        <div className="redca-tooltip">
          <div ref={(c) => { this.tooltipIcon = c; }}><img alt="help" className="redca-info-icon" src={infoIcon} /></div>
          {tooltipOpen
            && (
            <div ref={(c) => { this.tooltip = c; }}>
              <span className="redca-tooltiptext">
                {UnusedSourceSummary.renderTooltipInfo()}
              </span>
              <div className="redca-tooltip-arrow" />
            </div>
            )
          }
          {!tooltipOpen
            && <div />
            }
        </div>
        <span role="presentation" className="redca-excel-download-text" onClick={() => this.exportUnusedCodeList()}> Excel Download </span>
        <div className="block">
          <div className="widget">
            <div className="widget-row">
              {this.renderMeasureMain(unusedClass)}
              {this.renderMeasureMain(unusedMethod)}
              {this.renderMeasureMain(unusedField)}
              {this.renderMeasureMain(unusedConst)}
            </div>
          </div>
        </div>
      </div>
    );
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

  renderPieChart(obj) {
    const { project } = this.props;
    const num = obj.count.match('[0-9]+\\.[0-9]+');
    const chartData = [
      { name: 'Unused Code', value: num - 0, fill: '#ff6347' },
      { name: 'Used Code', value: 100 - num, fill: '#eee' }];

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

        <a href={`/project/extension/RedCA/unused_code_detail?id=${project.key}&unusedCodeListType=${obj.type}&unusedCodeListName=${obj.name}`}>
          <text style={{ textDecorationLine: 'underline' }} x="50%" y="50%" width={10} scaleToFit={false} textAnchor="middle" dominantBaseline="middle" verticalAnchor="end" fill="#236a97">
            {obj.count}
          </text>
        </a>

      </PieChart>
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

UnusedSourceSummary.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
