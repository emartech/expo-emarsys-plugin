import {
  ConfigPlugin,
  withEntitlementsPlist
} from 'expo/config-plugins';
import { EMSOptions } from '../types';

export const withEmarsysEntitlements: ConfigPlugin<EMSOptions> = (config, options) =>
  withEntitlementsPlist(config, config => {
    if (options.iosSharedKeychainAccessGroup) {
      if (!config.modResults['keychain-access-groups']) {
        config.modResults['keychain-access-groups'] = [];
      }
      
      const keychainGroups = config.modResults['keychain-access-groups'] as string[];
      if (!keychainGroups.includes(options.iosSharedKeychainAccessGroup)) {
        keychainGroups.push(options.iosSharedKeychainAccessGroup);
      }
    }

    return config;
  });