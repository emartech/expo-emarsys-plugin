import {
  ConfigPlugin,
} from 'expo/config-plugins';
import { EMSOptions } from '../types';
import { withEmarsysInfoPlist } from './withEmarsysInfoPlist';
import { withEmarsysDangerousMod } from './withEmarsysDangerousMod';
import { withEmarsysXcodeProject } from './withEmarsysXcodeProject';
import { withEmarsysPodfileConfig } from './withEmarsysPodfileConfig';
import { withEmarsysEntitlements } from './withEmarsysEntitlements';

export const withEmarsysiOS: ConfigPlugin<EMSOptions> = (config, options) => {
  config = withEmarsysInfoPlist(config, options);
  config = withEmarsysDangerousMod(config, options);
  config = withEmarsysXcodeProject(config, options);
  config = withEmarsysPodfileConfig(config);
  config = withEmarsysEntitlements(config, options);
  return config;
};
