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
import com.google.gson.GsonBuilder;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

import java.lang.reflect.Type;

public class JsonUtil {
    private static final Logger LOGGER = Loggers.get(JsonUtil.class);

    private static final GsonBuilder builder;
    private static final Gson gson;

    static {
        builder = new GsonBuilder();
        builder.excludeFieldsWithoutExposeAnnotation();
        gson = builder.create();
    }

    public static String getJson(Object obj) {
        return gson.toJson(obj);
    }

    public static <T> T getModelFromJson(String json, Class<T> modelType) {
        return gson.fromJson(json, modelType);
    }

    public static <T> T getModelFromJson(String json, Type modelType) {
        return gson.fromJson(json, modelType);
    }

    public static <T> T getModelFromUrl(String url, Class<T> modelType, String user, String password) {
        return gson.fromJson(HttpClientUtil.getHttpJsonResponse(url, user, password), modelType);
    }

    public static <T> T getModelFromUrl(String url, Class<T> modelType) {
        return gson.fromJson(HttpClientUtil.getHttpJsonResponse(url, "", ""), modelType);

    }
}
