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
package com.samsungsds.analyst.sonar.plugins.models;

import java.util.List;
import java.util.Map;

public class DuplicationModel {
	private List<Duplications> duplications;
	private Map<String, Files> files;

	public List<Duplications> getDuplications() {
		return duplications;
	}

	public void setDuplications(List<Duplications> duplications) {
		this.duplications = duplications;
	}

	public Map<String, Files> getFiles() {
		return files;
	}

	public void setFiles(Map<String, Files> files) {
		this.files = files;
	}
}
