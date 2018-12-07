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
package com.samsungsds.analyst.sonar.plugins.ws;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.commons.io.FileUtils;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.RequestHandler;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

public class CodeAnalysistWs implements WebService {
	private static final Logger LOGGER = Loggers.get(CodeAnalysistWs.class);

	@Override
	public void define(Context context) {
		NewController controller = context.createController("api/redca");
		NewController technicaldebt = context.createController("api/redcatechnicaldebt");

		controller.setDescription("redca Web Service");

		// create the URL /api/redca/add
		controller.createAction("add").setDescription("Add").setPost(true).setHandler(new RequestHandler() {
			@Override
			public void handle(Request request, Response response) {
				LOGGER.info("redca Web Service handler");

				String projectKey = request.mandatoryParam("key").replaceAll(":", "-");
				LOGGER.info("Project Key : {}", projectKey);

				LOGGER.info(request.toString());
				InputStream is = request.paramAsInputStream("data");

				File file = new File("/data/" + projectKey + ".json");

				try {
					FileUtils.copyInputStreamToFile(is, file);
				} catch (IOException ioe) {
					throw new RuntimeException(ioe);
				}
			}
		}).createParam("key").setDescription("Project key").setRequired(true);

		// create the URL /api/redca/show
		controller.createAction("show").setDescription("Show").setHandler(new RequestHandler() {
			@Override
			public void handle(Request request, Response response) {
				String projectKey = request.getParam("key").getValue().replaceAll(":", "-");
				LOGGER.info("Project Key : {}", projectKey);

				File file = new File("/data/" + projectKey + ".json");

				String json = null;
				try {
					json = FileUtils.readFileToString(file, "UTF-8");
				} catch (IOException ioe) {
					throw new RuntimeException(ioe);
				}
				LOGGER.info("WS Json : " + json);
				try (OutputStream os = response.stream().output()) {
					os.write(json.getBytes());
				} catch (IOException ioe) {
					throw new RuntimeException(ioe);
				}
			}
		}).createParam("key").setDescription("Project key").setRequired(true);

		// important to apply changes
		controller.done();

		technicaldebt.setDescription("Technical Debt Web Service");

		// create the URL /api/redcatechnicaldebt/add
		technicaldebt.createAction("add").setDescription("Add").setPost(true).setHandler(new RequestHandler() {
			@Override
			public void handle(Request request, Response response) {
				LOGGER.info("redca technical debt Web Service handler");

				String projectKey = request.mandatoryParam("key").replaceAll(":", "-");
				LOGGER.info("Project Key : {}", projectKey);

				LOGGER.info(request.toString());
				InputStream is = request.paramAsInputStream("data");

				File file = new File("/data/" + projectKey + "_technicaldebt"+ ".json");

				try {
					FileUtils.copyInputStreamToFile(is, file);
				} catch (IOException ioe) {
					throw new RuntimeException(ioe);
				}
			}
		}).createParam("key").setDescription("Project key").setRequired(true);

		// create the URL /api/redcatechnicaldebt/show
		technicaldebt.createAction("show").setDescription("Show").setHandler(new RequestHandler() {
			@Override
			public void handle(Request request, Response response) {
				String projectKey = request.getParam("key").getValue().replaceAll(":", "-");
				LOGGER.info("Project Key : {}", projectKey);

				File file = new File("/data/" + projectKey + "_technicaldebt" + ".json");

				String json = null;
				try {
					json = FileUtils.readFileToString(file, "UTF-8");
				} catch (IOException ioe) {
					throw new RuntimeException(ioe);
				}
				LOGGER.info("WS Technical Debt Json : " + json);
				try (OutputStream os = response.stream().output()) {
					os.write(json.getBytes());
				} catch (IOException ioe) {
					throw new RuntimeException(ioe);
				}
			}
		}).createParam("key").setDescription("Project key").setRequired(true);

		// important to apply changes
		technicaldebt.done();

	}
}
