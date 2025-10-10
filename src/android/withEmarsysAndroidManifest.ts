import {
  ConfigPlugin,
  withAndroidManifest
} from 'expo/config-plugins';
import { EMSOptions } from '../types';
import { STORE_NAME } from '../constants';
import { setMetaData, addEmarsysMessagingService } from './withEmarsysAndroidHelpers';

export const withEmarsysAndroidManifest: ConfigPlugin<EMSOptions> = (config, options) =>
  withAndroidManifest(config, config => {
    const applicationArray = config.modResults.manifest.application;
    if (!Array.isArray(applicationArray) || applicationArray.length === 0) {
      throw new Error("AndroidManifest.xml does not contain an <application> element.");
    }
    const app = applicationArray[0];

    if (options.applicationCode) {
      setMetaData(app, `${STORE_NAME}.applicationCode`, options.applicationCode);
    }
    if (options.merchantId) {
      setMetaData(app, `${STORE_NAME}.merchantId`, options.merchantId);
    }
    if (options.enableConsoleLogging) {
      setMetaData(app, `${STORE_NAME}.enableConsoleLogging`, 'true');
    }
    if (options.androidSharedPackageNames && options.androidSharedPackageNames.length > 0) {
      setMetaData(app, `${STORE_NAME}.sharedPackageNames`, options.androidSharedPackageNames);
    }
    if (options.androidSharedSecret) {
      setMetaData(app, `${STORE_NAME}.sharedSecret`, options.androidSharedSecret);
    }

    addEmarsysMessagingService(app);

    return config;
  });
