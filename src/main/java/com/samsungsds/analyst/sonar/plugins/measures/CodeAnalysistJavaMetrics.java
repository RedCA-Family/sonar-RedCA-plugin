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
package com.samsungsds.analyst.sonar.plugins.measures;

import java.util.List;

import org.sonar.api.measures.CoreMetrics;
import org.sonar.api.measures.Metric;
import org.sonar.api.measures.Metrics;

import static java.util.Arrays.asList;

public class CodeAnalysistJavaMetrics implements Metrics {

	public static final Metric<String> CA_MARTIN_MATRIX =
		    new Metric.Builder(
		        "ca_martin_matrix", // metric identifier
		        "CA Martin Matrix", // metric name
		        Metric.ValueType.STRING) // metric data type
		    .setDescription("The result of Martin Matrix")
		    .setQualitative(false)
		    .setHidden(true)
		    .setDomain(CoreMetrics.DOMAIN_GENERAL)
		    .create();

	public static final Metric<String> CA_ACYCLE_DEPENDENCY =
		    new Metric.Builder(
		        "ca_acycle_dependency", // metric identifier
		        "CA Acycle Dependency", // metric name
		        Metric.ValueType.STRING) // metric data type
		    .setDescription("The result of acyclic dependency")
		    .setQualitative(false)
		    .setHidden(true)
		    .setDomain(CoreMetrics.DOMAIN_GENERAL)
		    .create();
	public static final Metric<String> CA_COMPLEXITY_MATRIX =
		    new Metric.Builder(
		        "ca_complexity_matrix", // metric identifier
		        "CA Complexity Matrix", // metric name
		        Metric.ValueType.STRING) // metric data type
		    .setDescription("The result of Complexity's Matrix")
		    .setQualitative(false)
		    .setHidden(true)
		    .setDomain(CoreMetrics.DOMAIN_GENERAL)
		    .create();

	public static final Metric<String> CA_TECHNICAL_DEBT =
		    new Metric.Builder(
		        "ca_technical_debt", // metric identifier
		        "CA Technical Debt", // metric name
		        Metric.ValueType.STRING) // metric data type
		    .setDescription("The result of Technical Debt")
		    .setQualitative(false)
		    .setHidden(true)
		    .setDomain(CoreMetrics.DOMAIN_GENERAL)
		    .create();

	public static final Metric<String> CA_UNUSED_CODE =
		    new Metric.Builder(
		        "ca_unused_code", // metric identifier
		        "CA Unused Code", // metric name
		        Metric.ValueType.STRING) // metric data type
		    .setDescription("The result of Unused Code")
		    .setQualitative(false)
		    .setHidden(true)
		    .setDomain(CoreMetrics.DOMAIN_GENERAL)
		    .create();

	@Override
	public List<Metric> getMetrics() {
		return asList(CA_MARTIN_MATRIX, CA_ACYCLE_DEPENDENCY, CA_COMPLEXITY_MATRIX, CA_TECHNICAL_DEBT, CA_UNUSED_CODE);
	}

}
