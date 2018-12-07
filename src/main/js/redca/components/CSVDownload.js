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

export default class CSVDownload extends React.PureComponent {
    state = {
      csvData: ['a', 'b', 'c'],
    };

    componentDidMount() {
      const options = {
        componentKey: this.props.project.key,
        resolved: true,
      };
      let returnVal;
      getIssue(options).then(
        (valuesReturnedByAPI) => {
          returnVal = valuesReturnedByAPI;
          data = [
            ['Ahmed', 'Tomi', 'ah@smthing.co.com'],
            ['Raed', 'Labes', 'rl@smthing.co.com'],
            ['Yezzi', 'Min l3b', 'ymin@cocococo.com'],
          ];

          this.setState({
            csvData: data,
          });
        },
      );
    }

    render() {
      return (
        <CSVDownload data={this.state.csvData} />
      );
    }
}

CSVDownload.propTypes = {
  project: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
};
