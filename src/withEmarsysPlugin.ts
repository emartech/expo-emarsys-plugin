import { ConfigPlugin, createRunOncePlugin } from "expo/config-plugins";
import withEmarsysAndroid from "./withEmarsysAndroid";
import withEmarsysiOS from "./withEmarsysiOS";

const withEmarsysPlugin: ConfigPlugin<{
  applicationCode: string,
  merchantId: string
}> = (
  config,
  options
) => {
  console.log("withEmarsysPlugin called with options:", options);
  config = withEmarsysAndroid(config, options);
  return withEmarsysiOS(config, options);
};

const pkg = require("../package.json");

export default createRunOncePlugin(
  withEmarsysPlugin,
  pkg.name,
  pkg.version
);