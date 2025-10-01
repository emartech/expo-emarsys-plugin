import {
  ConfigPlugin,
  withAndroidManifest
} from 'expo/config-plugins';
import { EMSOptions } from '../types';
import { addMetaData, addEmarsysMessagingService } from './withEmarsysAndroidHelpers';

export const withEmarsysAndroidManifest: ConfigPlugin<EMSOptions> = (config, options) =>
  withAndroidManifest(config, config => {
    const applicationArray = config.modResults.manifest.application;
    if (!Array.isArray(applicationArray) || applicationArray.length === 0) {
      throw new Error("AndroidManifest.xml does not contain an <application> element.");
    }
    const app = applicationArray[0];

    if (options.applicationCode) {
      addMetaData(app, 'EMSApplicationCode', options.applicationCode);
    }
    if (options.merchantId) {
      addMetaData(app, 'EMSMerchantId', options.merchantId);
    }

    addEmarsysMessagingService(app);

    return config;
  });
