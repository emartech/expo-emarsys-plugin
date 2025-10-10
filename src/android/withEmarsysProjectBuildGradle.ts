import {
  ConfigPlugin,
  withProjectBuildGradle
} from 'expo/config-plugins';

const GOOGLE_SERVICES_CLASSPATH = "classpath('com.google.gms:google-services:4.4.3')";

export const withEmarsysProjectBuildGradle: ConfigPlugin = config =>
  withProjectBuildGradle(config, config => {
    let contents = config.modResults.contents;
    if (!contents.includes(GOOGLE_SERVICES_CLASSPATH)) {
      contents = contents.replace(
        /(buildscript\s*{[\s\S]*?dependencies\s*{)/m,
        `$1\n        ${GOOGLE_SERVICES_CLASSPATH}`
      );
    }
    config.modResults.contents = contents;
    return config;
  });

