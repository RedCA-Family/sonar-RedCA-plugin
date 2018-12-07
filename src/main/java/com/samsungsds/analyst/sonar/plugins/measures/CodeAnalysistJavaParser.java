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

import java.io.File;
import java.io.FileReader;
import java.io.Serializable;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.sonar.api.batch.ScannerSide;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.measures.Metric;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import com.google.gson.Gson;
import com.samsungsds.analyst.sonar.plugins.utils.RedcaUtil;

@ScannerSide
public class CodeAnalysistJavaParser {

	private static final Logger LOGGER = Loggers.get(CodeAnalysistJavaParser.class);

	private String martinMatrix;

	private String acycle;

	private String complexity;

	private JSONObject jsonObject;

	private String technicalDebt;

	private String unUsedCode;

	private String sources;

//	private JSONObject srcObj;

	public CodeAnalysistJavaParser() {}

	public void parse(SensorContext context, File file) throws Exception {
		LOGGER.info("Code Anaysist Parser Collect : " + file.getName());

		this.sources = context.config().get("sonar.sources").orElse("");
//		srcObj = new JSONObject();
//		srcObj.put("sources", sources);
		try {
			getJsonObject(file);

			parseFiles();

			save(context);
		} catch(Exception e) {
			LOGGER.error(e.getMessage());
		}


	}

	private void getJsonObject(File file) throws Exception {
		try {
			JSONParser parser = new JSONParser();
			FileReader reader = new FileReader(file);
			jsonObject = (JSONObject) parser.parse(reader);

		} catch (Exception e) {
			e.printStackTrace();
			throw new Exception("Occured the Exception of getting json data", e);
		}
	}

	private void parseFiles() {
		getMartinMatrix();
		LOGGER.info("Get Martin Matrix JSON");

		getAcycle();
		LOGGER.info("Get Acyclic Dependency JSON");

		getComplexity();
		LOGGER.info("Get Complexity JSON");

		getTechnicalDebt();
		LOGGER.info("Get TechnicalDebt JSON");

		getUnusedCode();
		LOGGER.info("Get UnusedCode JSON");
	}

	private void getMartinMatrix() {
		JSONArray  arr = (JSONArray) jsonObject.get("topMartinMetricsList");
		Gson gson = new Gson();

		JSONObject object = new JSONObject();
		object.put("topMartinMetricsList", arr);
		object.put("sources", sources);

		martinMatrix = gson.toJson(object);

	}

	private void getAcycle() {
		JSONArray  arr = (JSONArray) jsonObject.get("acyclicDependencyList");
		Gson gson = new Gson();

		JSONObject object = new JSONObject();
		object.put("acyclicDependencyList", arr);
		object.put("sources", sources);

		acycle = gson.toJson(object);
	}

	private void getComplexity() {
		String complexityTotal = jsonObject.get("complexityTotal").toString();

		int functions = Integer.parseInt(jsonObject.get("complexityFunctions").toString());
		int ten_over = Integer.parseInt(jsonObject.get("complexityOver10").toString());
		int fiftenn_over = Integer.parseInt(jsonObject.get("complexityOver15").toString());
		int twenty_over = Integer.parseInt(jsonObject.get("complexityOver20").toString());
		int fifty_over = Integer.parseInt(jsonObject.get("complexityEqualOrOver50").toString());

		String complexityOver10 = functions == 0 || ten_over ==0 ? "0 (0.00%)" : ten_over + " (" + getPct(ten_over , functions)  + "%)";
		String complexityOver15 = functions == 0 || fiftenn_over ==0 ? "0 (0.00%)" : fiftenn_over + " (" + getPct(fiftenn_over , functions) + "%)";
		String complexityOver20 = functions == 0 || twenty_over ==0 ? "0 (0.00%)" : twenty_over + " (" + getPct(twenty_over , functions) + "%)";
		String complexityEqualOrOver50 = functions == 0 || fifty_over ==0 ? "0 (0.00%)" : fifty_over + " (" + getPct(fifty_over , functions) + "%)";


		JSONObject object = new JSONObject();
		object.put("complexityTotal", complexityTotal);
		object.put("complexityOver10", complexityOver10);
		object.put("complexityOver15", complexityOver15);
		object.put("complexityOver20", complexityOver20);
		object.put("complexityEqualOrOver50", complexityEqualOrOver50);

		JSONObject obj = new JSONObject();
		obj.put("complexity", object);
		obj.put("complexityList", jsonObject.get("complexityList"));

		complexity = obj.toString();

	}

	private void getTechnicalDebt() {
		JSONObject  obj = (JSONObject) jsonObject.get("technicalDebtResult");
		Gson gson = new Gson();

		JSONObject object = new JSONObject();
		object.put("technicalDebtResult", obj);
		technicalDebt = gson.toJson(object);
	}

	private void getUnusedCode() {
		JSONArray unusedList = (JSONArray) jsonObject.get("unusedCodeList");
		Gson gson = new Gson();

		JSONObject object = new JSONObject();
		object.put("unusedCodeList", changeUnusedList(unusedList));
		object.put("unusedCodeBoard", getUnusedBoard(unusedList));

		unUsedCode = gson.toJson(object);
	}

	private JSONArray changeUnusedList(JSONArray unusedList) {
		for (int i = 0; i < unusedList.size(); i++) {
			JSONObject object = (JSONObject) unusedList.get(i);
			String className = object.get("className").toString();
			String packageName = object.get("packageName").toString();

			object.replace("className", className + ".java");
//			object.replace("packageName", sources + "/" + packageName.replace(".", "/"));
			object.replace("packageName", packageName.replace(".", "/"));
		}

		return unusedList;
	}

	private JSONObject getUnusedBoard(JSONArray unusedList) {
		int totCnt = 0, classCnt = 0, classTotCnt = 0,
			fieldCnt = 0, fieldTotCnt = 0,
			methodCnt = 0, methodTotCnt = 0,
			constCnt = 0, constTotCnt = 0;

		totCnt = unusedList.size();
		classCnt = Integer.parseInt(jsonObject.get("unusedClassCount").toString());
		classTotCnt = Integer.parseInt(jsonObject.get("ucTotalClassCount").toString());

		fieldCnt = Integer.parseInt(jsonObject.get("unusedFieldCount").toString());
		fieldTotCnt = Integer.parseInt(jsonObject.get("ucTotalFieldCount").toString());

		methodCnt = Integer.parseInt(jsonObject.get("unusedMethodCount").toString());
		methodTotCnt = Integer.parseInt(jsonObject.get("ucTotalMethodCount").toString());

		constCnt = Integer.parseInt(jsonObject.get("unusedConstantCount").toString());
		constTotCnt = Integer.parseInt(jsonObject.get("ucTotalConstantCount").toString());

		JSONObject object = new JSONObject();
		object.put("totCnt", RedcaUtil.toCommanValue(totCnt));
		object.put("classCnt", RedcaUtil.toCommanValue(classCnt) + "(" + getPct(classCnt, classTotCnt) + "%)");
		object.put("fieldCnt", RedcaUtil.toCommanValue(fieldCnt) + "(" + getPct(fieldCnt,fieldTotCnt) + "%)");
		object.put("methodCnt", RedcaUtil.toCommanValue(methodCnt) + "(" + getPct(methodCnt,methodTotCnt) + "%)");
		object.put("constCnt", RedcaUtil.toCommanValue(constCnt) + "(" + getPct(constCnt,constTotCnt) + "%)");

		return object;
	}

	private String getPct(int x, int y) {
		if(x == 0 || y == 0)
			return "0.00";
		else
			return String.format("%.2f", (double) x/y*100);
	}

	private void save(SensorContext context) {
		saveMeasure(context, CodeAnalysistJavaMetrics.CA_MARTIN_MATRIX, martinMatrix);

		saveMeasure(context, CodeAnalysistJavaMetrics.CA_ACYCLE_DEPENDENCY, acycle);

		saveMeasure(context, CodeAnalysistJavaMetrics.CA_COMPLEXITY_MATRIX, complexity);

		saveMeasure(context, CodeAnalysistJavaMetrics.CA_TECHNICAL_DEBT, technicalDebt);

		saveMeasure(context, CodeAnalysistJavaMetrics.CA_UNUSED_CODE, unUsedCode);
	}

	private static <T extends Serializable> void saveMeasure(SensorContext context,
			Metric<T> metric, T value) {
		context.<T> newMeasure().forMetric(metric).on(context.module()).withValue(value).save();
	}
}
