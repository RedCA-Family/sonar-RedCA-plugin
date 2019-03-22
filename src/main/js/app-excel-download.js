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
import { render, unmountComponentAtNode } from 'react-dom';
import XLSX from 'xlsx';
import { getJSON } from 'sonar-request';
import { findIssueFacets, findMeasureComponent } from './api';

import './redca-style.css';

export default class ExcelExport extends React.PureComponent {
   state = {
     downloading: true,
     url: '',
   };


   componentDidMount() {
     getJSON('/api/settings/values', {
       keys: 'sonar.core.serverBaseURL',
     }).then((response) => {
       response.settings.forEach((setting) => {
         if (setting.key === 'sonar.core.serverBaseURL') {
           this.state.url = setting.value;
         }
       });
     });
   }

   executeExcelExport() {
     return new Promise((resolve, reject) => {
       function getProjectList(p, ps, projectList) {
         getJSON('/api/components/search_projects', {
           ps,
           p,
         }).then((response) => {
           const total = response.paging.total;
           const pageTotalSize = response.paging.pageIndex * response.paging.pageSize;

           projectList = projectList.concat(response.components);

           if (total > pageTotalSize) {
             getProjectList(p + 1, ps, projectList);
           } else {
             resolve(projectList);
           }
         }).catch((err) => {
           console.log(err);
           reject(err);
         });
       }
       getProjectList(1, 500, []);
     });
   }

   executeExcelExportMain() {
     this.executeExcelExport()
       .then((data) => {
         this.excelExport(data, 0, []);
       }).catch((err) => {
         console.log(err);
       });
   }

   excelExport(projectList, idx, projects) {
     const projectInfo = {
       team: '',
       group: '',
       system: '',
       lines: 0,
       ncloc: 0,
       classes: 0,
       functions: 0,
       duplicated_lines_density: 0,
       duplicated_lines: 0,
       complexityTotal: 0,
       complexityOver20: 0,
       complexityEqualOrOver50: 0,
       bugs: 0,
       vulnerabilities: 0,
       codeSmells: 0,
       dependencyListSize: 0,
       url: '',
     };

     const project = projectList[idx];

     const { tags } = project;
     tags.filter((element) => {
       const splitstr = element.split('.')[1];
       if (element.startsWith('t.')) {
         if (projectInfo.team === '') {
           projectInfo.team = splitstr;
         } else {
           projectInfo.team = `${projectInfo.team}, ${splitstr}`;
         }
       }

       if (element.startsWith('g.')) {
         if (projectInfo.group === '') {
           projectInfo.group = splitstr;
         } else {
           projectInfo.group = `${projectInfo.team}, ${splitstr}`;
         }
       }
     });

     projectInfo.system = project.name;

     const basic = new Promise((resolve, reject) => {
       const basicMetricKeys = 'ncloc,lines,classes,functions,duplicated_lines_density,duplicated_lines';
       findMeasureComponent(project, basicMetricKeys).then((valuesReturnedByAPI) => {
         projectInfo.lines = valuesReturnedByAPI.lines.value;
         projectInfo.ncloc = valuesReturnedByAPI.ncloc.value;
         projectInfo.classes = valuesReturnedByAPI.classes.value;
         projectInfo.functions = valuesReturnedByAPI.functions.value;
         projectInfo.duplicated_lines_density = valuesReturnedByAPI.duplicated_lines_density.value;
         projectInfo.duplicated_lines = valuesReturnedByAPI.duplicated_lines.value;
         resolve(1);
       }).catch((err) => {
         reject(err);
       });
     });

     const complexity = new Promise((resolve, reject) => {
       const complexityMetricKeys = 'ca_complexity_matrix';
       findMeasureComponent(project, complexityMetricKeys).then((valuesReturnedByAPI) => {
         projectInfo.complexityTotal = valuesReturnedByAPI.complexity ? valuesReturnedByAPI.complexity.complexityTotal : '-';
         projectInfo.complexityOver20 = valuesReturnedByAPI.complexity ? valuesReturnedByAPI.complexity.complexityOver20 : '-';
         projectInfo.complexityEqualOrOver50 = valuesReturnedByAPI.complexity ? valuesReturnedByAPI.complexity.complexityEqualOrOver50 : '-';
         resolve(2);
       }).catch((err) => {
         reject(err);
       });
     });

     const acycle = new Promise((resolve, reject) => {
       const acycleMetricKeys = 'ca_acycle_dependency';
       findMeasureComponent(project, acycleMetricKeys).then((valuesReturnedByAPI) => {
         projectInfo.dependencyListSize = valuesReturnedByAPI.dependencyList ? valuesReturnedByAPI.dependencyList.length : '-';
         resolve(3);
       }).catch((err) => {
         reject(err);
       });
     });

     const issues = new Promise((resolve, reject) => {
       const facets = 'types';
       const facetMode = 'count';
       const types = '';
       findIssueFacets(project, facets, facetMode, types, false).then((valuesReturnedByAPI) => {
         for (let i = 0; i < valuesReturnedByAPI.values[0].values.length; i += 1) {
           if (valuesReturnedByAPI.values[0].values[i].val === "VULNERABILITY") {
             projectInfo.vulnerabilities = valuesReturnedByAPI.values[0].values[i].count;
           } else if (valuesReturnedByAPI.values[0].values[i].val === "BUG") {
             projectInfo.bugs = valuesReturnedByAPI.values[0].values[i].count;
           } else if (valuesReturnedByAPI.values[0].values[i].val === "CODE_SMELL") {
             projectInfo.codeSmells = valuesReturnedByAPI.values[0].values[i].count;
           }
         }
         resolve(4);
       }).catch((err) => {
         reject(err);
       });
     });

     projectInfo.url = `${this.state.url}/project/extension/RedCA/_redca_dashboard?id=${project.key}`;
     Promise.all([basic, complexity, acycle, issues]).then(() => {
       projects.push(projectInfo);
       if (idx === projectList.length - 1) {
         this.createExcel(projects);
       } else {
         this.excelExport(projectList, idx + 1, projects);
       }
     }).catch((err) => {
       console.log(err);
     });
   }

   createExcel(val) {
     function yyyymmddhhMMss() {
       const d = new Date();
       const yyyy = d.getFullYear().toString();
       const mm = (d.getMonth() + 1).toString();
       const dd = d.getDate().toString();
       const hh = d.getHours().toString();
       const MM = d.getMinutes().toString();
       const ss = d.getSeconds().toString();
       return yyyy
                + (mm[1] ? mm : `0${mm[0]}`)
                + (dd[1] ? dd : `0${dd[0]}`)
                + (hh[1] ? hh : `0${hh[0]}`)
                + (MM[1] ? MM : `0${MM[0]}`)
                + (ss[1] ? ss : `0${ss[0]}`);
     }

     const wb = XLSX.utils.book_new();
     wb.SheetNames.push('result');
     const headerText = [
       {
         team: '팀',
         group: '그룹명',
         system: '시스템명',
         lines: 'Lines',
         ncloc: 'LOC',
         classes: 'Class',
         functions: 'Function',
         duplicated_lines_density: '중복도(비율)',
         duplicated_lines: '중복라인수',
         complexityTotal: '복잡도',
         complexityOver20: '복잡도 21이상 함수수',
         complexityEqualOrOver50: '복잡도 50이상 함수수',
         bugs: '버그수',
         vulnerabilities: '취약점',
         codeSmells: '코드스멜수',
         dependencyListSize: '순환참조수',
         url: 'URL',
       },
     ];

     const infoListHeader = ['team',
       'group',
       'system',
       'lines',
       'ncloc',
       'classes',
       'functions',
       'duplicated_lines_density',
       'duplicated_lines',
       'complexityTotal',
       'complexityOver20',
       'complexityEqualOrOver50',
       'bugs',
       'vulnerabilities',
       'codeSmells',
       'dependencyListSize',
       'url',
     ];
     const headerTextOptions = { header: infoListHeader, skipHeader: true };
     const ws = XLSX.utils.json_to_sheet(headerText, headerTextOptions);

     ws['!cols'] = [
       { wch: 20 },
       { wch: 20 },
       { wch: 20 },
       { wch: 10 },
       { wch: 10 },
       { wch: 10 },
       { wch: 10 },
       { wch: 10 },
       { wch: 10 },
       { wch: 10 },
       { wch: 20 },
       { wch: 20 },
       { wch: 10 },
       { wch: 10 },
       { wch: 10 },
       { wch: 10 },
       { wch: 20 },
     ];

     XLSX.utils.sheet_add_json(ws, val, { header: infoListHeader, skipHeader: true, origin: 'A2' });
     wb.Sheets.result = ws;
     XLSX.writeFile(wb, `result-${yyyymmddhhMMss()}.xlsx`, { bookType: 'xlsx', type: 'binary' });
     this.setState({
       downloading: false,
     });
   }

   render() {
     const { downloading } = this.state;
     { downloading && this.executeExcelExportMain(); }
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
}

window.registerExtension('RedCA/excel_download', (options) => {
  const { el } = options;


  render(
    <div>
      <ExcelExport />
    </div>,
    el,
  );

  return () => unmountComponentAtNode(el);
});
