import {
  ConfigPlugin,
  withInfoPlist
} from 'expo/config-plugins';
import { EMSOptions } from '../types';

export const withEmarsysInfoPlist: ConfigPlugin<EMSOptions> = (config, options) =>
  withInfoPlist(config, config => {
    const applicationCode = options.applicationCode;
    if (applicationCode) {
      config.modResults.EMSApplicationCode = applicationCode;
    }

    const merchantId = options.merchantId;
    if (merchantId) {
      config.modResults.EMSMerchantId = merchantId;
    }

    const enableConsoleLogging = options.enableConsoleLogging;
    if (enableConsoleLogging) {
      config.modResults.EMSEnableConsoleLogging = enableConsoleLogging;
    }
    return config;
  });
