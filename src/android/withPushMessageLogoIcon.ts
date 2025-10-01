import {
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod
} from 'expo/config-plugins';
import { addMetaData } from './withEmarsysAndroidHelpers';

const MOBILE_ENGAGE_LOGO_ICON = 'mobile_engage_logo_icon';

export const withPushMessageLogoIcon: ConfigPlugin = (config) => {
  config = withDangerousMod(config, [
    'android',
    async config => {
      const fs = require('fs');
      const path = require('path');
      const projectRoot = config.modRequest.projectRoot;
      const source = path.join(projectRoot, 'assets', `${MOBILE_ENGAGE_LOGO_ICON}.jpg`);
      const dest = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable', `${MOBILE_ENGAGE_LOGO_ICON}.jpg`);

      if (!fs.existsSync(source)) {
        console.warn(`Source file ${source} does not exist. Skipping copy.`);
        return config;
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(source, dest);
      console.log(`Copied ${MOBILE_ENGAGE_LOGO_ICON} to ${dest}`);
      return config;
    },
  ]);

  config = withAndroidManifest(config, config => {
    const fs = require('fs');
    const path = require('path');
    const projectRoot = config.modRequest.projectRoot;
    const source = path.join(projectRoot, 'assets', `${MOBILE_ENGAGE_LOGO_ICON}.jpg`);
    if (!fs.existsSync(source)) {
      console.warn(`Source file ${source} does not exist. Skipping AndroidManifest update.`);
      return config;
    }
    const applicationArray = config.modResults.manifest.application;
    if (Array.isArray(applicationArray) && applicationArray.length > 0) {
      const app = applicationArray[0];
      addMetaData(app, 'com.emarsys.mobileengage.small_notification_icon', `@drawable/${MOBILE_ENGAGE_LOGO_ICON}`);
    }
    return config;
  });

  return config;
};
