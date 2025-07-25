import { ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

const withEmarsysiOS: ConfigPlugin<{
  applicationCode: string,
  merchantId: string
}> = (config, options) => {

  return withInfoPlist(config, config => {
    // Add emarsys sdk properties to the Info.plist file
    // config.modResults.applicationCode = applicationCode;
    return config;
  });
};

export default withEmarsysiOS;