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
package com.samsungsds.analyst.sonar.plugins.hooks;

import java.io.IOException;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.sonar.api.ce.posttask.PostProjectAnalysisTask;
import org.sonar.api.platform.Server;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import com.samsungsds.analyst.sonar.plugins.utils.HttpClientUtil;
import com.samsungsds.analyst.sonar.plugins.utils.RedcaUtil;

public class TechnicalDebtStatus implements PostProjectAnalysisTask {

	private static final Logger LOGGER = Loggers.get(TechnicalDebtStatus.class);

	private static final String ENGINE = "ca_technical_debt";

	private static final String DUPLICATIONS = "duplicated_blocks";

	private static final String BUG = "reliability_remediation_effort";

	private static final String SECURITY = "security_remediation_effort";

	private static final String CODE_SMELL = "sqale_index";

	private static String user;
	private static boolean isAuthenticated = false;
	//private DuplicationDetailAnalyst anal = new DuplicationDetailAnalyst();

	private final Server server;

	private String serverUrl;

	private String pjtKey;

	private double totalDebt;
	private double totalDebtRatio;
	private double acyclicDependencyDebt;
	private double acyclicDependencyDebtRatio;
	private double complexityDebt;
	private double complexityDebtRatio;
	private double duplicationDebt;
	private double duplicationDebtRatio;
	private double securityDebt;
	private double reliabilityDebt;
	private double codesmellDebt;
	private double violationDebt;
	private double violationDebtRatio;

	private double loc;

	private String strTotalDebt;
	private String strTotalDebtRatio;
	private String strAcyclicDebt;
	private String strAcyclicDebtRatio;
	private String strComplexityDebt;
	private String strComplexityDebtRatio;
	private String strDuplicationDebt;
	private String strDuplicationDebtRatio;
	private String strViolationDebt;
	private String strViolationDebtRatio;

	public TechnicalDebtStatus(Server server) {
		this.server = server;
	}

	@Override
	public void finished(ProjectAnalysis analysis) {
		LOGGER.info("RedCA TechnicalDebt hook start : " + "URL : " + getServerUrl() + " " + "ProjectKey : "
				+ getProjectKey(analysis));
		serverUrl = getServerUrl();
		pjtKey = getProjectKey(analysis);

		initDebt();

		getRawDataFromSonar();

		getTechnicalDebt();

		getTechnicalRatio();

		String json = getJsonDebt();

		LOGGER.info(json);

		save(json, analysis);

	}


	private void initDebt() {
		totalDebt = 0d;
		totalDebtRatio = 0d;
		acyclicDependencyDebt = 0d;
		acyclicDependencyDebtRatio = 0d;
		complexityDebt = 0d;
		complexityDebtRatio = 0d;
		duplicationDebt = 0d;
		duplicationDebtRatio = 0d;
		securityDebt = 0d;
		reliabilityDebt = 0d;
		codesmellDebt = 0d;
		violationDebt = 0d;
		violationDebtRatio = 0d;
	}

	private String getJsonDebt() {
		JSONObject child = new JSONObject();
		child.put("totalDebt", strTotalDebt);
		child.put("totalDebtRatio", strTotalDebtRatio);

		child.put("acyclicDependencyDebt", strAcyclicDebt);
		child.put("acyclicDependencyDebtRatio", strAcyclicDebtRatio);

		child.put("complexityDebt", strComplexityDebt);
		child.put("complexityDebtRatio", strComplexityDebtRatio);

		child.put("duplicationDebt", strDuplicationDebt);
		child.put("duplicationDebtRatio", strDuplicationDebtRatio);

		child.put("violationDebt", strViolationDebt);
		child.put("violationDebtRatio", strViolationDebtRatio);

		JSONObject parent = new JSONObject();
		parent.put("technicalDebtResult", child);

		return parent.toJSONString();
	}

	private void getRawDataFromSonar() {
		getEngineDebtFromUrl();

		getSonarDebtFromUrl();

		getLocFromUrl();
	}

	private void getTechnicalDebt() {
		LOGGER.info("Get Technical Debt");
		try {
			strTotalDebt = transferDebt(totalDebt);

			strAcyclicDebt = transferDebt(acyclicDependencyDebt);

			strComplexityDebt = transferDebt(complexityDebt);

			strDuplicationDebt = transferDebt(duplicationDebt);

			strViolationDebt = transferDebt(violationDebt);
		} catch(Exception e) {
			LOGGER.error(e.getMessage());
		}

	}

	private void getTechnicalRatio() {
		LOGGER.info("Get TechnicalRatio");


		double div = Double.parseDouble(String.format("%.2f", loc * 0.48d));

		strTotalDebtRatio = String.format("%.2f", totalDebt / div * 100);
		LOGGER.info("div : " + div + " " + "totalDebt : " + totalDebt + " ratio : " + strTotalDebtRatio);

		strAcyclicDebtRatio = String.format("%.2f", acyclicDependencyDebt / div * 100);
		LOGGER.info("div : " + div + " " + "acyclicDependencyDebt : " + acyclicDependencyDebt + " ratio : " + strAcyclicDebtRatio);

		strComplexityDebtRatio = String.format("%.2f", complexityDebt / div * 100);
		LOGGER.info("div : " + div + " " + "complexityDebt : " + complexityDebt + " ratio : " + strComplexityDebtRatio);

		strDuplicationDebtRatio = String.format("%.2f", duplicationDebt / div * 100);
		LOGGER.info("div : " + div + " " + "duplicationDebt : " + duplicationDebt + " ratio : " + strDuplicationDebtRatio);

		strViolationDebtRatio = String.format("%.2f", violationDebt / div * 100);
		LOGGER.info("div : " + div + " " + "violationDebt : " + violationDebt + " ratio : " + strViolationDebtRatio);

	}

	private String transferDebt(double debt) throws Exception {
		StringBuilder sb = new StringBuilder();
		int day = 0; int hour = 0;
		int tmp = (int) debt;

		day = tmp / 8;
		hour = tmp % 8;

		if(day > 0) sb.append(RedcaUtil.toCommanValue(day) + "d");

		if(day > 0 && hour > 0) sb.append(" ");

		if(hour > 0) sb.append(RedcaUtil.toCommanValue(hour) + "h");

		if(sb.length() == 0) sb.append("0h");

		return sb.toString();
	}

	private void getEngineDebtFromUrl() {
		String url = getUrl(ENGINE);

		JSONParser parser = new JSONParser();

		LOGGER.info("Measure Technical Debt URL : " + url);

		try {
			JSONObject obj = (JSONObject) parser.parse(HttpClientUtil.getHttpJsonResponse(url, "analyzer", "analyzer"));

			JSONArray arr = (JSONArray) ((JSONObject) obj.get("component")).get("measures");
			if(arr.size() == 0) return;

			obj = (JSONObject) parser.parse(((JSONObject) arr.get(0)).get("value").toString());

			obj = (JSONObject) parser.parse(obj.get("technicalDebtResult").toString());

			acyclicDependencyDebt = Double.parseDouble(obj.get("acyclicDependencyDebt").toString());
			complexityDebt = Double.parseDouble(obj.get("complexityDebt").toString());

			totalDebt += acyclicDependencyDebt;
			totalDebt += complexityDebt;

		} catch (ParseException e) {
			LOGGER.error(e.getMessage());
		}
	}

	private void getSonarDebtFromUrl() {
		duplicationDebt = getDebt(DUPLICATIONS);

		securityDebt = getDebt(SECURITY);

		reliabilityDebt = getDebt(BUG);

		codesmellDebt = getDebt(CODE_SMELL);

		totalDebt += duplicationDebt + securityDebt + reliabilityDebt + codesmellDebt;

		violationDebt = securityDebt + reliabilityDebt + codesmellDebt;
	}

	private void getLocFromUrl() {
		String url = getLocUrl();

		JSONParser parser = new JSONParser();

		LOGGER.info("Measure LOC URL : " + url);

		try {
			JSONObject obj = (JSONObject) parser.parse(HttpClientUtil.getHttpJsonResponse(url, "analyzer", "analyzer"));

			JSONArray arr = (JSONArray) ((JSONObject) obj.get("component")).get("measures");
			if(arr.size() == 0) return;

			loc = Double.parseDouble(((JSONObject) arr.get(0)).get("value").toString());

			LOGGER.info("Measure LOC : " + loc);

		} catch (ParseException e) {
			LOGGER.error(e.getMessage());
		}

	}

	private double getDebt(String key) {
		String url = getUrl(key);
		double rtn = 0d;

		JSONParser parser = new JSONParser();

		LOGGER.info( key + " Technical Debt : " + url);

		try {
			JSONObject obj = (JSONObject) parser.parse(HttpClientUtil.getHttpJsonResponse(url, "analyzer", "analyzer"));

			JSONArray arr = (JSONArray) ((JSONObject) obj.get("component")).get("measures");

			rtn = Double.parseDouble(((JSONObject) arr.get(0)).get("value").toString());

		} catch (ParseException e) {
			LOGGER.error(e.getMessage());
		}

		if(DUPLICATIONS.equals(key)) return rtn * 2d;
		else return ((int) (rtn / 60)) * 1.0d;

	}

	private void save(String json, ProjectAnalysis analysis) {
		String user = "";
		String pwd = "";
		try {
            String response = HttpClientUtil.submitPostMethod(getServerUrl()
            		+ "/api/redcatechnicaldebt/add?key=" + getProjectKey(analysis), json, user, pwd);

            LOGGER.info("Response body : {}", response);
        } catch (IOException ioe) {
            LOGGER.error("Submit Error", ioe);
        }


	}

	private String getServerUrl() {
		return server.getPublicRootUrl();
	}

	private String getProjectKey(ProjectAnalysis analysis) {
		return analysis.getProject().getKey();
	}

	private String getUrl(String key) {
		StringBuilder sb = new StringBuilder();
		sb.append(serverUrl);
		sb.append("/api/measures/component?additionalFields=metrics&metricKeys=");
		sb.append(key);
		sb.append("&component=" + pjtKey);

		return sb.toString();
	}

	private String getLocUrl() {
		StringBuilder sb = new StringBuilder();
		sb.append(serverUrl);
		sb.append("/api/measures/component?component=");
		sb.append(pjtKey);
		sb.append("&metricKeys=ncloc");

		return sb.toString();
	}
}
