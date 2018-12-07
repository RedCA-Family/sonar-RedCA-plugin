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

import org.sonar.api.batch.sensor.Sensor;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.SensorDescriptor;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

public class CodeAnalysistSensor implements Sensor {

	private static final Logger LOGGER = Loggers.get(CodeAnalysistSensor.class);

	private final CodeAnalysistJavaParser caJavaParser;
	private final CodeAnalysistJavaCollector caJavaCollector;

	public CodeAnalysistSensor(CodeAnalysistJavaParser caJavaParser, CodeAnalysistJavaCollector caJavaCollector) {
		this.caJavaCollector = caJavaCollector;
		this.caJavaParser = caJavaParser;
	}

	@Override
	public void describe(SensorDescriptor descriptor) {
		descriptor.onlyOnLanguage("java").name("CodeAnalysistSensor");
	}

	@Override
	public void execute(SensorContext context) {
		LOGGER.info("Code Anaysist execute");
		try {
			if("false".equals(context.config().get("sonar.redca").orElse(""))) {
				LOGGER.info("sonar.redca is false.");
				return;
			}

			validate(context);

			String result = collect(context);

			File file = CodeAnalysistUtils.getReportsDirectories(context, result);
			parser(context, file);

			if(! file.delete()) file.deleteOnExit();

		} catch(Exception e) {
			LOGGER.error(e.getMessage());
		}

	}

	private void validate(SensorContext context) throws Exception {
//		String[] valids = {"sonar.sources", "sonar.java.binaries", "sonar.sourceEncoding", "sonar.java.source"};
		checkExisistValue(context);

		String base = context.fileSystem().baseDir().getPath();

		LOGGER.info("base: " + base);

		checkSrcValue(context, base);

		checkBinValue(context, base);
	}

	private void checkBinValue(SensorContext context, String base) throws Exception {
		String binary = context.config().get("sonar.java.binaries").orElse("");
		LOGGER.info("sonar.java.binaries : " + binary);

		if(binary.contains(",")) {
			String[] bins = binary.split(",");
			for(String bin : bins) {
				File binf = new File(base + File.separator + bin);
				if(! binf.exists() || ! binf.isDirectory()) {
					LOGGER.info("not a valided binary path : " + binf.getPath());
					throw new Exception("sonar.java.binaries is not a valided attribute value.");
				}
			}
		} else {
			File bin = new File(base + File.separator + binary);
			if(! bin.exists() || ! bin.isDirectory()) {
				LOGGER.info("not a valided binary path : " + bin.getPath());
				throw new Exception("sonar.java.binaries is not a valided attribute value.");
			}
		}
	}

	private void checkSrcValue(SensorContext context, String base) throws Exception {
		String sources = context.config().get("sonar.sources").orElse("");

		LOGGER.info("sonar.sources : " + sources);
		if(sources.contains(",")) {
			String[] srcArr = sources.split(",");
			for(String srcStr : srcArr) {
				File src;

				if(srcStr.indexOf(base + File.separator) >= 0) {
					src = new File(srcStr.replace(base + File.separator, ""));
				} else {
					src = new File(base + File.separator + srcStr);
				}

				if(! src.exists() || ! src.isDirectory()) {
					LOGGER.info("not a valided source path : " + src.getPath());
					throw new Exception("sonar.sources is not a valided attribute value.");
				}
			}

		} else {
			File src;

			if(sources.indexOf(base + File.separator) >= 0) {
				src = new File(sources.replace(base + File.separator, ""));
			} else {
				src = new File(base + File.separator + sources);
			}

			if(! src.exists() || ! src.isDirectory()) {
				LOGGER.info("not a valided source path : " + src.getPath());
				throw new Exception("sonar.sources is not a valided attribute value.");
			}
		}


	}

	private void checkExisistValue(SensorContext context) throws Exception {
		String[] valids = {"sonar.sources", "sonar.java.binaries"};
		for(String valid : valids) {
			if("".equals(context.config().get(valid).orElse("")))
				throw new Exception(valid + " "+ "is a required attribute value.");
		}
	}

	protected String collect(SensorContext context) throws Exception {
		LOGGER.info("Code Anaysist Collect");

		return caJavaCollector.collect(context);
	}

	protected void parser(SensorContext context, File file) throws Exception {
		LOGGER.info("Code Anaysist Parser");

		caJavaParser.parse(context, file);
	}

	@Override
	public String toString() {
		return getClass().getSimpleName();
	}
}
