import { ConfigPlugin, createRunOncePlugin } from "expo/config-plugins";
// import withAndroidPlugin from "./withAndroidPlugin";
// import withIosPlugin from "./withIosPlugin";

const withEmarsysPlugin: ConfigPlugin<{
  applicationCode: string,
  merchantId: string
}> = (
  config,
  options
) => {
  console.log("withEmarsysPlugin called with options:", options);
  // config = withAndroidPlugin(config, options);
  // Then apply iOS modifications and return
  // return withIosPlugin(config, options);
  return config;
};

const pkg = require("../package.json");

export default createRunOncePlugin(
  withEmarsysPlugin,
  pkg.name,
  pkg.version
);