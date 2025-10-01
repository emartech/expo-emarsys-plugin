import {
  ConfigPlugin,
  withDangerousMod
} from 'expo/config-plugins';
import { EMSOptions } from '../types';

const NOTIFICATION_SERVICE_TARGET = 'NotificationService';
const NOTIFICATION_SERVICE_FILES = [
  'NotificationService.swift',
  'NotificationService-Info.plist'
];

export const withEmarsysDangerousMod: ConfigPlugin<EMSOptions> = (config, options) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const fs = require('fs');
      const path = require('path');
      const projectRoot = config.modRequest.projectRoot;

      // Notification Service Extension
      // Copy files
      // TODO - get pluginDir with require.resolve
      const pluginDir = `${projectRoot}/node_modules/expo-emarsys-plugin`;
      const sourceDir = path.join(pluginDir, 'ios', NOTIFICATION_SERVICE_TARGET);
      const destDir = path.join(projectRoot, 'ios', NOTIFICATION_SERVICE_TARGET);
      if (!fs.existsSync(`${destDir}`)) {
        fs.mkdirSync(`${destDir}`);
      }
      for (const file of NOTIFICATION_SERVICE_FILES) {
        fs.copyFileSync(`${sourceDir}/${file}`, `${destDir}/${file}`);
      }

      // Update Podfile
      const podfilePath = `${projectRoot}/ios/Podfile`;
      const podfile = fs.readFileSync(podfilePath);
      if (!podfile.includes(`target '${NOTIFICATION_SERVICE_TARGET}'`)) {
        fs.appendFileSync(podfilePath, `
target '${NOTIFICATION_SERVICE_TARGET}' do
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  pod 'EmarsysNotificationService'
end`
        );
      }

      return config;
    },
  ]);
