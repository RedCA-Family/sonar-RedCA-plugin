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
package com.samsungsds.analyst.sonar.plugins.redca;

import org.sonar.api.Plugin;

import com.samsungsds.analyst.sonar.plugins.hooks.DuplicateTopStatus;
import com.samsungsds.analyst.sonar.plugins.hooks.TechnicalDebtStatus;
import com.samsungsds.analyst.sonar.plugins.measures.CodeAnalysistJavaCollector;
import com.samsungsds.analyst.sonar.plugins.measures.CodeAnalysistJavaMetrics;
import com.samsungsds.analyst.sonar.plugins.measures.CodeAnalysistJavaParser;
import com.samsungsds.analyst.sonar.plugins.measures.CodeAnalysistSensor;
import com.samsungsds.analyst.sonar.plugins.redca.web.RedCAPluginPageDefinition;
import com.samsungsds.analyst.sonar.plugins.ws.CodeAnalysistWs;

public class RedCAPlugin implements Plugin {
    @Override
    public void define(Context context) {
    	//--------------------------------------------------------------------------------
        // RedCA Sonar plug in Scanner
    	//--------------------------------------------------------------------------------
        context.addExtension(CodeAnalysistSensor.class);

        context.addExtension(CodeAnalysistJavaCollector.class);
        context.addExtensions(CodeAnalysistJavaParser.class, CodeAnalysistJavaMetrics.class);
        context.addExtension(DuplicateTopStatus.class);
        context.addExtension(TechnicalDebtStatus.class);
        context.addExtension(CodeAnalysistWs.class);

        //--------------------------------------------------------------------------------
        // RedCA Sonar plug in Page
        //--------------------------------------------------------------------------------
        context.addExtension(RedCAPluginPageDefinition.class);
    }
}
