import { ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

const withEmarsysiOS: ConfigPlugin<{
  applicationCode: string,
  merchantId: string
}> = (config, options) => {

  return withInfoPlist(config, config => {
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
};

export default withEmarsysiOS;