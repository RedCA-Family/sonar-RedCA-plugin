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
import java.util.List;

import org.sonar.api.ce.posttask.PostProjectAnalysisTask;
import org.sonar.api.platform.Server;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.samsungsds.analyst.code.main.detailed.Duplication;
import com.samsungsds.analyst.code.main.detailed.DuplicationDetailAnalyst;
import com.samsungsds.analyst.code.sonar.DuplicationResult;
import com.samsungsds.analyst.sonar.plugins.models.Blocks;
import com.samsungsds.analyst.sonar.plugins.models.ComponentModel;
import com.samsungsds.analyst.sonar.plugins.models.Components;
import com.samsungsds.analyst.sonar.plugins.models.DuplicationModel;
import com.samsungsds.analyst.sonar.plugins.models.Duplications;
import com.samsungsds.analyst.sonar.plugins.utils.HttpClientUtil;
import com.samsungsds.analyst.sonar.plugins.utils.JsonUtil;

public class DuplicateTopStatus implements PostProjectAnalysisTask {

	private static final Logger LOGGER = Loggers.get(DuplicateTopStatus.class);

	private static final String COMPONENTS_URL = "/api/components/tree?baseComponentKey=";
	private static final String DUPLICATIONS_URL = "/api/duplications/show?key=";
	private static final String PAGE_INDEX_PARAM = "pageIndex";

	private int rowIndex = 0;

	private static String user, password;
	private static boolean isAuthenticated = false;
	private DuplicationDetailAnalyst anal;

	private final Server server;

	private String serverUrl;

	private String pjtKey;

	public DuplicateTopStatus(Server server) {
		this.server = server;
	}

	@Override
	public void finished(ProjectAnalysis analysis) {
		LOGGER.info("RedCA Duplicate Top 10 hook start : " + "URL : " + getServerUrl() + " " + "ProjectKey : "
				+ getProjectKey(analysis));
		serverUrl = getServerUrl();
		pjtKey = getProjectKey(analysis);

		String url = serverUrl + COMPONENTS_URL + pjtKey;

		getAuthInfo(analysis);

		ComponentModel model = getModelFromUrl(url, ComponentModel.class);

		int total = model.getTotal();
		int pageSize = model.getPageSize();

		int lastIndex = (total + pageSize - 1) / pageSize;

		LOGGER.info("Total Components : " + total + ", last index = " + lastIndex);

		anal = new DuplicationDetailAnalyst();
		for (int pageIndex = 1; pageIndex <= lastIndex; pageIndex++) {
			processComponents(pageIndex, analysis);
		}

		List<Duplication> list = anal.getTopList();
		String json = JsonUtil.getJson(list);

		LOGGER.info(json);

		save(json, analysis);

	}

	private void getAuthInfo(ProjectAnalysis analysis) {
		user = "analyzer";
	    password = "analyzer";

	    LOGGER.info("user: " + user + " " + "password: "+ password);
	}

	private void save(String json, ProjectAnalysis analysis) {
		String user = "";
		String pwd = "";
		try {
            String response = HttpClientUtil.submitPostMethod(getServerUrl()
            		+ "/api/redca/add?key=" + getProjectKey(analysis), json, user, pwd);

            LOGGER.info("Response body : {}", response);
        } catch (IOException ioe) {
            LOGGER.error("Submit Error", ioe);
        }


	}

	protected void processComponents(int pageIndex, ProjectAnalysis analysis) {
		String url = serverUrl + COMPONENTS_URL + pjtKey + "&" + PAGE_INDEX_PARAM + "=" + pageIndex;

		ComponentModel model = getModelFromUrl(url, ComponentModel.class);

		List<Components> list = model.getComponents();

		for (Components component : list) {
			processDuplications(component, analysis);
		}
	}

	protected void processDuplications(Components component, ProjectAnalysis analysis) {
		String url = serverUrl + DUPLICATIONS_URL + component.getKey();
		DuplicationModel model = getModelFromUrl(url, DuplicationModel.class);

		for (Duplications duplications : model.getDuplications()) {
			for (int i = 1; i < duplications.getBlocks().size(); i++) {

				Blocks source = duplications.getBlocks().get(0);
				Blocks target = duplications.getBlocks().get(i);

				String[] data = new String[] { Integer.toString(++rowIndex), component.getPath(),
						Integer.toString(source.getFrom()), Integer.toString(source.getFrom() + source.getSize() - 1),
						component.getPath().equals(model.getFiles().get(target.get_ref()).getName()) ? "-"
								: model.getFiles().get(target.get_ref()).getName(),
						Integer.toString(target.getFrom()), Integer.toString(target.getFrom() + target.getSize() - 1) };

				transferRow(data);
			}
		}
	}

	protected static <T> T getModelFromUrl(String url, Class<T> modelType) {
		GsonBuilder builder = new GsonBuilder();
		Gson gson = builder.create();

		if (! "".equals(user) && ! "".equals(password)) {
//			String password = null;
//			try (Scanner in = new Scanner(System.in)) {
//				password = in.nextLine();
//			}

			T result = gson.fromJson(HttpClientUtil.getHttpJsonResponse(url, user, password), modelType);

			isAuthenticated = true;

			return result;
		}
		return gson.fromJson(HttpClientUtil.getHttpJsonResponse(url), modelType);
	}

	private void transferRow(String[] data) {

		DuplicationResult result = new DuplicationResult(data[1], Integer.parseInt(data[2]),
				Integer.parseInt(data[3]), "-".equals(data[4]) ? data[1] : data[4] , Integer.parseInt(data[5]), Integer.parseInt(data[6]));

		anal.add(result);
	}

	private String getServerUrl() {
		return server.getPublicRootUrl();
	}

	private String getProjectKey(ProjectAnalysis analysis) {
		return analysis.getProject().getKey();
	}
}
