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

import okhttp3.*;
import org.apache.commons.lang.StringUtils;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import java.io.IOException;
import java.net.ProtocolException;

public class HttpClientUtil {
    private static final Logger LOGGER = Loggers.get(HttpClientUtil.class);

    private static final String AUTHENTICATION_TEST_URL = "/api/languages/list";

    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    public static OkHttpClient client;

    public static String submitPostMethod(String url, String json, String user, String password)throws IOException {
        createHttpClient(url, user, password);

        // RequestBody body = RequestBody.create(JSON, json);

        MultipartBody body = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("data","data.json", RequestBody.create(JSON, json)).build();
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body().string();
        }
    }

    public static String getHttpJsonResponse(String url) {
		if (client == null) {
			client = getOkHttpClient("", "");
		}

		return getResponse(url);
	}

    public static String getHttpJsonResponse(String url, String user, String password) {
        createHttpClient(url, user, password);

        return getResponse(url);
    }

    private static void createHttpClient(String url, String user, String password) {
        if (client == null) {
            client = getOkHttpClient(user, password);

            if (!StringUtils.isEmpty(user) && !StringUtils.isEmpty(password)) {
                checkAuthentication(url);
            }
        }
    }

    private static synchronized OkHttpClient getOkHttpClient(String user, String password) {
        if (client == null) {
            if (StringUtils.isEmpty(user) || StringUtils.isEmpty(password)) {
                return new OkHttpClient();
            } else {
                return createAuthenticatedClient(user, password);
            }
        } else {
            return client;
        }
    }

    private static void checkAuthentication(String url) {
        String server = url.substring(0, url.indexOf("/", 7));

        try {
            String result = getResponse(server + AUTHENTICATION_TEST_URL);

            LOGGER.debug("{}", result);
        } catch (RuntimeException ex) {
            if (ex.getCause() instanceof ProtocolException) {
                throw new SonarServerException();
            }
        }
    }

    private static String getResponse(String url) {
        Request request = new Request.Builder().url(url).build();
        try (Response response = client.newCall(request).execute()) {
            String body = response.body().string();

            if (response.isSuccessful()) {
                return body;
            } else {
                LOGGER.info("Response Code : {} ", response.code());
                LOGGER.info("Response Body : {}", body);

                throw new SonarServerException(body);
            }
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }
    }


    private static OkHttpClient createAuthenticatedClient(final String username, final String password) {
        // build client with authentication information.
        OkHttpClient httpClient = new OkHttpClient.Builder().authenticator(new Authenticator() {
            public Request authenticate(Route route, Response response) throws IOException {
                String credential = Credentials.basic(username, password);
                return response.request().newBuilder().header("Authorization", credential).build();
            }
        }).build();

        return httpClient;
    }
}
