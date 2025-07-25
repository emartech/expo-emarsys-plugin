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

    console.log('Emarsys SDK configuration:', {
      applicationCode: config.modResults.EMSApplicationCode,
      merchantId: config.modResults.EMSMerchantId,
    });
    return config;
  });
};

export default withEmarsysiOS;