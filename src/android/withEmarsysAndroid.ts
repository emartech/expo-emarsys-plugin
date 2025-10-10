import {
  ConfigPlugin
} from 'expo/config-plugins';
import { EMSOptions } from '../types';
import { withEmarsysProjectBuildGradle } from './withEmarsysProjectBuildGradle';
import { withEmarsysAppBuildGradle } from './withEmarsysAppBuildGradle';
import { withEmarsysAndroidManifest } from './withEmarsysAndroidManifest';
import { withEmarsysPushMessageLogoIcon } from './withEmarsysPushMessageLogoIcon';
import { withEmarsysGoogleServicesJson } from './withEmarsysGoogleServicesJson';

export const withEmarsysAndroid: ConfigPlugin<EMSOptions> = (config, options) => {
  config = withEmarsysProjectBuildGradle(config);
  config = withEmarsysAppBuildGradle(config);
  config = withEmarsysAndroidManifest(config, options);
  config = withEmarsysGoogleServicesJson(config);
  config = withEmarsysPushMessageLogoIcon(config);
  return config;
};
