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
package com.samsungsds.analyst.sonar.plugins.utils;

import com.google.gson.Gson;
import com.samsungsds.analyst.sonar.plugins.ws.model.ErrorModel;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

public class SonarServerException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private static final Logger LOGGER = Loggers.get(SonarServerException.class);

    private static Gson gson = new Gson();

    public SonarServerException(String body) {
        ErrorModel error = gson.fromJson(body, ErrorModel.class);

        LOGGER.error("Error Code : {}", error.getErrCode());
        LOGGER.error("Error Message : {}", error.getErrMsg());
    }

    public SonarServerException() {
        LOGGER.error("Authentication Error");
    }

}
