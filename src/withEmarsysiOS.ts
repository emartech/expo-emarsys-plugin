import { ConfigPlugin, withInfoPlist } from 'expo/config-plugins';
import { EMSOptions } from './types';

const withEmarsysInfoPlist: ConfigPlugin<EMSOptions> = (config, options) =>
  withInfoPlist(config, config => {
    const applicationCode = options.applicationCode;
    if (applicationCode) {
      config.modResults.EMSApplicationCode = applicationCode;
    }

    const merchantId = options.merchantId;
    if (merchantId) {
      config.modResults.EMSMerchantId = merchantId;
    }
    return config;
  });

export const withEmarsysiOS: ConfigPlugin<EMSOptions> = (config, options) => {
  config = withEmarsysInfoPlist(config, options);
  return config;
};
