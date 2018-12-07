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
package com.samsungsds.analyst.sonar.plugins.redca.web;

import org.sonar.api.web.page.Context;
import org.sonar.api.web.page.Page;
import org.sonar.api.web.page.PageDefinition;

import java.util.Collection;

/**
 * Created by sds on 2018-01-04.
 */
public class RedCAPluginPageDefinition implements PageDefinition {

    @Override
    public void define(Context context) {
        context
                .addPage(Page.builder("RedCA/excel_download")
                        .setName("Excel Download")
                        .setAdmin(true)
                .setScope(Page.Scope.GLOBAL).build());

        context
                .addPage(Page.builder("RedCA/_redca_dashboard")
                        .setName("RedCA Dashboard")
                        .setScope(Page.Scope.COMPONENT).build());

        context
                .addPage(Page.builder("RedCA/unused_code_detail")
                        .setName("└─  Unused Code Detail")
                        .setScope(Page.Scope.COMPONENT).build());

        context
                .addPage(Page.builder("RedCA/complexity_detail")
                        .setName("└─  Functional Complexity Detail")
                        .setScope(Page.Scope.COMPONENT).build());

        context
                .addPage(Page.builder("RedCA/package_stability_detail")
                        .setName("└─  Cyclic Dependency Detail")
                        .setScope(Page.Scope.COMPONENT).build());

    }
}
