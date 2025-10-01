import {
  ConfigPlugin,
  withPodfileProperties
} from 'expo/config-plugins';

export const withEmarsysPodfileConfig: ConfigPlugin = (config) => {
  config = withPodfileProperties(config, ({ modResults, ...config }) => {
    modResults = {
      ...modResults,
      "ios.useFrameworks": "static",
      "ios.deploymentTarget": "15.1",
    };
    return {
      modResults,
      ...config,
    };
  });

  return config;
}
