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

import org.sonar.api.batch.ScannerSide;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import com.samsungsds.analyst.code.api.AnalysisMode;
import com.samsungsds.analyst.code.api.ArgumentInfo;
import com.samsungsds.analyst.code.api.CodeAnalyst;
import com.samsungsds.analyst.code.api.TargetFileInfo;
import com.samsungsds.analyst.code.api.impl.CodeAnalystImpl;

@ScannerSide
public class CodeAnalysistJavaCollector {

	private static final Logger LOGGER = Loggers.get(CodeAnalysistJavaCollector.class);

	public CodeAnalysistJavaCollector() {}

	public String collect(SensorContext context) throws Exception {
		LOGGER.info("Code Anaysist Collector");

		try {
			AnalysisMode mode = setMode();

			ArgumentInfo arg = setArg(mode, context);

			CodeAnalyst analyst = new CodeAnalystImpl();
			analyst.addProgressObserver(progress -> {
				String event = progress.getProgressEvent().toString();
				LOGGER.info(event);
			});
			TargetFileInfo targetFile = setTargetFile();
			String bin = context.config().get("sonar.java.binaries").orElse("").contains(",")
					? context.config().get("sonar.java.binaries").orElse("").split(",")[0]
					: context.config().get("sonar.java.binaries").orElse("");

			String outPath = context.fileSystem().baseDir().getPath() + File.separator
					+ bin;

			Thread thread = Thread.currentThread();
			ClassLoader loader = thread.getContextClassLoader();
			thread.setContextClassLoader(this.getClass().getClassLoader());
			String resultFile = "";
			try {
				resultFile = analyst.analyze(outPath, arg, targetFile);
			} catch(Exception e) {
				LOGGER.error("The exception of code analysis engine", e);
				throw new Exception("The exception of code analysis engine", e);
			} finally {
				thread.setContextClassLoader(loader);
			}

			LOGGER.info("Result File : " + resultFile);

			return resultFile;

		} catch (Exception e) {
			LOGGER.error(e.getMessage());
			throw new Exception("The exception of code analysis engine", e);
		}
	}

	private TargetFileInfo setTargetFile() {
		TargetFileInfo targetFile = new TargetFileInfo();
//		targetFile.addPackage("");

		return targetFile;
	}

	private static AnalysisMode setMode() throws Exception {
		AnalysisMode mode = new AnalysisMode();

		mode.setCodeSize(false);
		mode.setDuplication(false);
		mode.setComplexity(true);
		mode.setPmd(false);
		mode.setFindBugs(false);
		mode.setFindSecBugs(false);
		mode.setDependency(true);
		mode.setUnusedCode(true);
		mode.setSonarJava(false);
		mode.setCkMetrics(false);

		return mode;
	}

	private static ArgumentInfo setArg(AnalysisMode mode, SensorContext context) throws Exception {
		ArgumentInfo argument = new ArgumentInfo();

		argument.setProject(context.fileSystem().baseDir().getPath());

		String sources = File.separator + context.config().get("sonar.sources").orElse("");

		if(sources.indexOf(argument.getProject() + File.separator) >= 0) {
			sources = sources.replace(argument.getProject() + File.separator, "");
		} else {
			sources = sources.substring(1);
		}

		argument.setSrc(sources);

		argument.setBinary(context.config().get("sonar.java.binaries").orElse(""));
		argument.setMode(mode);

		argument.setDetailAnalysis(true);
		argument.setDebug(true);
		argument.setExclude(context.config().get("sonar.exclusions").orElse(""));
		argument.setInclude(context.config().get("sonar.inclusions").orElse(""));

		return argument;
	}
}
