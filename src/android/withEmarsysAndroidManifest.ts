import {
  ConfigPlugin,
  withAndroidManifest
} from 'expo/config-plugins';
import { EMSOptions } from '../types';
import { setMetaData, addEmarsysMessagingService } from './withEmarsysAndroidHelpers';

export const withEmarsysAndroidManifest: ConfigPlugin<EMSOptions> = (config, options) =>
  withAndroidManifest(config, config => {
    const applicationArray = config.modResults.manifest.application;
    if (!Array.isArray(applicationArray) || applicationArray.length === 0) {
      throw new Error("AndroidManifest.xml does not contain an <application> element.");
    }
    const app = applicationArray[0];

    if (options.applicationCode) {
      setMetaData(app, 'EMSApplicationCode', options.applicationCode);
    }
    if (options.merchantId) {
      setMetaData(app, 'EMSMerchantId', options.merchantId);
    }
    if (options.enableConsoleLogging) {
      setMetaData(app, 'EMSEnableConsoleLogging', 'true');
    }

    addEmarsysMessagingService(app);

    return config;
  });
