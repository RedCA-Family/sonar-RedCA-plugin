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
/* eslint-disable import/no-unresolved */
import { getJSON } from 'sonar-request'; // see https://github.com/SonarSource/sonarqube/blob/master/server/sonar-web/src/main/js/app/utils/exposeLibraries.js

export const infoIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjE1cHgiIGhlaWdodD0iMTVweCIgdmlld0JveD0iMCAwIDE1IDE1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNDcuMSAoNDU0MjIpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPg0KICAgIDx0aXRsZT5pbmZvcm1hdGlvbi1waWN0b2dyYW0tbTwvdGl0bGU+DQogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+DQogICAgPGRlZnM+PC9kZWZzPg0KICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuMDM2NDU4MywwLDAsMC4wMzY0NTgzLDEsLTAuMTY2NjY3KSI+DQogICAgICAgIDxwYXRoDQogICAgICAgICAgZmlsbD0iI0NEQ0RDRCINCiAgICAgICAgICBkPSJNMjI0LDM0NEwyMjQsMjk2QzIyNCwyOTMuNjY3IDIyMy4yNSwyOTEuNzUgMjIxLjc1LDI5MC4yNUMyMjAuMjUsMjg4Ljc1IDIxOC4zMzMsMjg4IDIxNiwyODhMMTY4LDI4OEMxNjUuNjY3LDI4OCAxNjMuNzUsMjg4Ljc1IDE2Mi4yNSwyOTAuMjVDMTYwLjc1LDI5MS43NSAxNjAsMjkzLjY2NyAxNjAsMjk2TDE2MCwzNDRDMTYwLDM0Ni4zMzMgMTYwLjc1LDM0OC4yNSAxNjIuMjUsMzQ5Ljc1QzE2My43NSwzNTEuMjUgMTY1LjY2NywzNTIgMTY4LDM1MkwyMTYsMzUyQzIxOC4zMzMsMzUyIDIyMC4yNSwzNTEuMjUgMjIxLjc1LDM0OS43NUMyMjMuMjUsMzQ4LjI1IDIyNCwzNDYuMzMzIDIyNCwzNDRaTTI4OCwxNzZDMjg4LDE2MS4zMzMgMjgzLjM3NSwxNDcuNzUgMjc0LjEyNSwxMzUuMjVDMjY0Ljg3NSwxMjIuNzUgMjUzLjMzMywxMTMuMDgzIDIzOS41LDEwNi4yNUMyMjUuNjY3LDk5LjQxNyAyMTEuNSw5NiAxOTcsOTZDMTU2LjUsOTYgMTI1LjU4MywxMTMuNzUgMTA0LjI1LDE0OS4yNUMxMDEuNzUsMTUzLjI1IDEwMi40MTcsMTU2Ljc1IDEwNi4yNSwxNTkuNzVMMTM5LjI1LDE4NC43NUMxNDAuNDE3LDE4NS43NSAxNDIsMTg2LjI1IDE0NCwxODYuMjVDMTQ2LjY2NywxODYuMjUgMTQ4Ljc1LDE4NS4yNSAxNTAuMjUsMTgzLjI1QzE1OS4wODMsMTcxLjkxNyAxNjYuMjUsMTY0LjI1IDE3MS43NSwxNjAuMjVDMTc3LjQxNywxNTYuMjUgMTg0LjU4MywxNTQuMjUgMTkzLjI1LDE1NC4yNUMyMDEuMjUsMTU0LjI1IDIwOC4zNzUsMTU2LjQxNyAyMTQuNjI1LDE2MC43NUMyMjAuODc1LDE2NS4wODMgMjI0LDE3MCAyMjQsMTc1LjVDMjI0LDE4MS44MzMgMjIyLjMzMywxODYuOTE3IDIxOSwxOTAuNzVDMjE1LjY2NywxOTQuNTgzIDIxMCwxOTguMzMzIDIwMiwyMDJDMTkxLjUsMjA2LjY2NyAxODEuODc1LDIxMy44NzUgMTczLjEyNSwyMjMuNjI1QzE2NC4zNzUsMjMzLjM3NSAxNjAsMjQzLjgzMyAxNjAsMjU1TDE2MCwyNjRDMTYwLDI2Ni4zMzMgMTYwLjc1LDI2OC4yNSAxNjIuMjUsMjY5Ljc1QzE2My43NSwyNzEuMjUgMTY1LjY2NywyNzIgMTY4LDI3MkwyMTYsMjcyQzIxOC4zMzMsMjcyIDIyMC4yNSwyNzEuMjUgMjIxLjc1LDI2OS43NUMyMjMuMjUsMjY4LjI1IDIyNCwyNjYuMzMzIDIyNCwyNjRDMjI0LDI2MC44MzMgMjI1Ljc5MiwyNTYuNzA4IDIyOS4zNzUsMjUxLjYyNUMyMzIuOTU4LDI0Ni41NDIgMjM3LjUsMjQyLjQxNyAyNDMsMjM5LjI1QzI0OC4zMzMsMjM2LjI1IDI1Mi40MTcsMjMzLjg3NSAyNTUuMjUsMjMyLjEyNUMyNTguMDgzLDIzMC4zNzUgMjYxLjkxNywyMjcuNDU4IDI2Ni43NSwyMjMuMzc1QzI3MS41ODMsMjE5LjI5MiAyNzUuMjkyLDIxNS4yOTIgMjc3Ljg3NSwyMTEuMzc1QzI4MC40NTgsMjA3LjQ1OCAyODIuNzkyLDIwMi40MTcgMjg0Ljg3NSwxOTYuMjVDMjg2Ljk1OCwxOTAuMDgzIDI4OCwxODMuMzMzIDI4OCwxNzZaTTM4NCwyMjRDMzg0LDI1OC44MzMgMzc1LjQxNywyOTAuOTU4IDM1OC4yNSwzMjAuMzc1QzM0MS4wODMsMzQ5Ljc5MiAzMTcuNzkyLDM3My4wODMgMjg4LjM3NSwzOTAuMjVDMjU4Ljk1OCw0MDcuNDE3IDIyNi44MzMsNDE2IDE5Miw0MTZDMTU3LjE2Nyw0MTYgMTI1LjA0Miw0MDcuNDE3IDk1LjYyNSwzOTAuMjVDNjYuMjA4LDM3My4wODMgNDIuOTE3LDM0OS43OTIgMjUuNzUsMzIwLjM3NUM4LjU4MywyOTAuOTU4IDAsMjU4LjgzMyAwLDIyNEMwLDE4OS4xNjcgOC41ODMsMTU3LjA0MiAyNS43NSwxMjcuNjI1QzQyLjkxNyw5OC4yMDggNjYuMjA4LDc0LjkxNyA5NS42MjUsNTcuNzVDMTI1LjA0Miw0MC41ODMgMTU3LjE2NywzMiAxOTIsMzJDMjI2LjgzMywzMiAyNTguOTU4LDQwLjU4MyAyODguMzc1LDU3Ljc1QzMxNy43OTIsNzQuOTE3IDM0MS4wODMsOTguMjA4IDM1OC4yNSwxMjcuNjI1QzM3NS40MTcsMTU3LjA0MiAzODQsMTg5LjE2NyAzODQsMjI0WiINCiAgICAgICAgLz4NCiAgICAgIDwvZz4NCjwvc3ZnPg0K';

export function getIssue(options) {
  return getJSON('/api/issues/search',
    options).then(response => response);
}

export function getRedcaTechnicalDebt(componentKey) {
  return getJSON('/api/redcatechnicaldebt/show', {
    key: componentKey.key,
  }).then((response) => {
    const result = {};
    const { technicalDebtResult } = response;

    Object.keys(technicalDebtResult).forEach((key) => {
      result[key] = {
        name: key,
        value: technicalDebtResult[key],
      };
    });
    return result;
  }).catch(() => ({
    totalDebt: {},
    totalDebtRatio: {},
    acyclicDependencyDebt: {},
    acyclicDependencyDebtRatio: {},
    violationDebt: {},
    violationDebtRatio: {},
    duplicationDebt: {},
    duplicationDebtRatio: {},
    complexityDebt: {},
    complexityDebtRatio: {},
  }));
}

export function findRedCADuplictionFilesList(componentKeys) {
  return getJSON('/api/redca/show', {
    key: componentKeys.key,
  }).then(response => response).catch(() => []);
}

function makeMeasureComponentSummaryObj(measure, metric) {
  const result = {};

  result.metric = measure.metric;
  result.periods = measure.periods;
  result.key = metric.key;
  result.name = metric.name;
  result.description = metric.description;
  result.domain = metric.domain;
  result.type = metric.type;
  result.higherValuesAreBetter = metric.higherValuesAreBetter;
  result.qualitative = metric.qualitative;
  result.hidden = metric.hidden;
  result.custom = metric.custom;
  result.value = measure.value;

  return result;
}

export function findRules(componentKeys, ruleKey) {
  return getJSON('/api/rules/search', {
    rule_key: ruleKey,
  }).then((response) => {
    const result = {
      total: 0,
      values: [],
    };

    result.total = response.total;

    for (let i = 0; i < response.total; i += 1) {
      const value = {};
      value.name = response.rules[i].name;
      value.key = response.rules[i].key;

      result.values[i] = value;
    }

    return result;
  });
}

export function findIssueFacets(componentKeys, facets, facetMode, types, resolved) {
  return getJSON('/api/issues/search', {
    facets, // severities, rules...
    facetMode, // count
    componentKeys: componentKeys.key, // projectkey
    types, // CODE_SMELL, BUG, VULNERABILITY
    s: 'SEVERITY',
    resolved,
  }).then((response) => {
    const result = {
      total: 0,
      values: [],
    };

    const rsltFacets = response.facets;
    for (let i = 0; i < rsltFacets.length; i += 1) {
      result.values[i] = rsltFacets[i];
    }

    result.total = response.total;
    return result;
  });
}

export const findMeasureComponent = (project, metricKeys) => getJSON('/api/measures/component', {
  component: project.key,
  metricKeys,
  additionalFields: 'periods,metrics',
}).then((response) => {
  let result = {};
  const measures = (response.component.measures instanceof Array
    ? response.component.measures
    : []);
  const metrics = response.metrics instanceof Array ? response.metrics : [];

  if (metricKeys === 'ca_acycle_dependency') {
    result = {
      name: metrics[0].name,
      dependencyList: JSON.parse(measures[0].value).acyclicDependencyList,
      source: JSON.parse(measures[0].value).sources,
    };
  } else if (metricKeys === 'ca_technical_debt') {
    const { technicalDebtResult } = JSON.parse(measures[0].value);

    Object.keys(technicalDebtResult).forEach((key) => {
      result[key] = {
        name: key,
        value: technicalDebtResult[key],
      };
    });
  } else if (metricKeys === 'ca_complexity_matrix') {
    result = {
      name: metrics[0].name,
      complexity: (JSON.parse(measures[0].value).complexity
        ? JSON.parse(measures[0].value).complexity
        : {}
      ),
      complexityList: (JSON.parse(measures[0].value).complexityList
        ? JSON.parse(measures[0].value).complexityList
        : []
      ),
    };
  } else {
    metrics.forEach((ma) => {
      let measure = { metric: '', value: 0, periods: '' };
      measures.forEach((mt) => {
        if (mt.metric === ma.key) {
          measure = mt;
        }
      });
      result[ma.key] = makeMeasureComponentSummaryObj(measure, ma);
    });
  }
  return result;
}).catch(() => ({}));

export function getSource(options) {
  return getJSON('/api/sources/show',
    options).then(response => response);
}
