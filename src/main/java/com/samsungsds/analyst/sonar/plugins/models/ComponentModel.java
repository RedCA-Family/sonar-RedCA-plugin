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

public class ComponentModel implements Pagination {
	private Paging paging;
	private List<Components> components;

	public Paging getPaging() {
		return paging;
	}

	public void setPaging(Paging paging) {
		this.paging = paging;
	}

	public List<Components> getComponents() {
		return components;
	}

	public void setComponents(List<Components> components) {
		this.components = components;
	}

	@Override
	public int getTotal() {
		return paging.getTotal();
	}

	@Override
	public int getPageSize() {
		return paging.getPageSize();
	}
}
