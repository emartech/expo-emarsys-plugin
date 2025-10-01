import {
  ConfigPlugin
} from 'expo/config-plugins';
import { EMSOptions } from '../types';
import { withEmarsysProjectBuildGradle } from './withEmarsysProjectBuildGradle';
import { withEmarsysAppBuildGradle } from './withEmarsysAppBuildGradle';
import { withEmarsysAndroidManifest } from './withEmarsysAndroidManifest';
import { withPushMessageLogoIcon } from './withPushMessageLogoIcon';
import { withGoogleServicesJson } from './withGoogleServicesJson';

export const withEmarsysAndroid: ConfigPlugin<EMSOptions> = (config, options) => {
  config = withEmarsysProjectBuildGradle(config);
  config = withEmarsysAppBuildGradle(config);
  config = withEmarsysAndroidManifest(config, options);
  config = withGoogleServicesJson(config);
  config = withPushMessageLogoIcon(config);
  return config;
};
