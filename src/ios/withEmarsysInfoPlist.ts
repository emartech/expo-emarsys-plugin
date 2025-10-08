import {
  ConfigPlugin,
  withInfoPlist
} from 'expo/config-plugins';
import { EMSOptions } from '../types';
import { STORE_NAME } from '../constants';


export const withEmarsysInfoPlist: ConfigPlugin<EMSOptions> = (config, options) =>
  withInfoPlist(config, config => {
    const applicationCode = options.applicationCode;
    if (applicationCode) {
      config.modResults[`${STORE_NAME}.applicationCode`] = applicationCode;
    }

    const merchantId = options.merchantId;
    if (merchantId) {
      config.modResults[`${STORE_NAME}.merchantId`] = merchantId;
    }

    const enableConsoleLogging = options.enableConsoleLogging;
    if (enableConsoleLogging) {
      config.modResults[`${STORE_NAME}.enableConsoleLogging`] = enableConsoleLogging;
    }

    const sharedKeychainAccessGroup = options.iosSharedKeychainAccessGroup;
    if (sharedKeychainAccessGroup) {
      config.modResults[`${STORE_NAME}.sharedKeychainAccessGroup`] = sharedKeychainAccessGroup;
    }

    return config;
  });
