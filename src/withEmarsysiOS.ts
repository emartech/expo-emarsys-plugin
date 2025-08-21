import {
  ConfigPlugin,
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
  withPodfileProperties
} from 'expo/config-plugins';
import { EMSOptions } from './types';

const NOTIFICATION_SERVICE_TARGET = 'NotificationService';
const NOTIFICATION_SERVICE_FILES = [
  'NotificationService.swift',
  'NotificationService-Info.plist'
];

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

const withEmarsysDangerousMod: ConfigPlugin<EMSOptions> = (config, options) =>
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

const withEmarsysXcodeProject: ConfigPlugin<EMSOptions> = (config, options) =>
  withXcodeProject(config, (config) => {
    // Notification Service Extension
    if (!!config.modResults.pbxGroupByName(NOTIFICATION_SERVICE_TARGET)) {
      console.log(`${NOTIFICATION_SERVICE_TARGET} already exists`);
      return config;
    }

    // Initialize project objects
    const objects = config.modResults.hash.project.objects;
    objects['PBXTargetDependency'] = objects['PBXTargetDependency'] || {};
    objects['PBXContainerItemProxy'] = objects['PBXContainerItemProxy'] || {};

    // Add target
    const target = config.modResults.addTarget(
      NOTIFICATION_SERVICE_TARGET,
      'app_extension',
      NOTIFICATION_SERVICE_TARGET,
      `${config.ios?.bundleIdentifier}.${NOTIFICATION_SERVICE_TARGET}`,
    );

    // Add PBX group
    const pbxGroup = config.modResults.addPbxGroup(
      NOTIFICATION_SERVICE_FILES,
      NOTIFICATION_SERVICE_TARGET,
      NOTIFICATION_SERVICE_TARGET,
    );
    const groups = config.modResults.hash.project.objects['PBXGroup'];
    for (const key of Object.keys(groups)) {
      if (typeof groups[key] === 'object' && groups[key].name === undefined && groups[key].path === undefined) {
        config.modResults.addToPbxGroup(pbxGroup.uuid, key);
      }
    };

    // Add build phase
    config.modResults.addBuildPhase(
      ['NotificationService.swift',],
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid
    );

    // Set build settings
    const configurations = config.modResults.hash.project.objects['XCBuildConfiguration'];
    let existingBuildSettings;
    for (const key of Object.keys(configurations)) {
      const buildSettings = configurations[key].buildSettings;
      if (buildSettings && buildSettings.PRODUCT_NAME && buildSettings.PRODUCT_NAME !== `"${NOTIFICATION_SERVICE_TARGET}"`) {
        existingBuildSettings = buildSettings;
        break;
      }
    }
    if (existingBuildSettings) {
      const settingsToCopy = [
        'CURRENT_PROJECT_VERSION', 'MARKETING_VERSION',
        'SWIFT_VERSION', 'TARGETED_DEVICE_FAMILY',
        'DEVELOPMENT_TEAM', 'PROVISIONING_PROFILE_SPECIFIER',
        'CODE_SIGN_STYLE', 'CODE_SIGN_IDENTITY', 'OTHER_CODE_SIGN_FLAGS'
      ]
      for (const key of Object.keys(configurations)) {
        const buildSettings = configurations[key].buildSettings;
        if (buildSettings && buildSettings.PRODUCT_NAME === `"${NOTIFICATION_SERVICE_TARGET}"`) {
          for (const setting of settingsToCopy) {
            if (existingBuildSettings[setting]) { buildSettings[setting] = existingBuildSettings[setting] };
          }
        }
      }
    }

    return config;
  });

const withEmarsysPodfileConfig: ConfigPlugin = (config) => {
  config = withPodfileProperties(config, ({ modResults, ...config }) => {
    modResults = {
      ...modResults,
      "ios.useFrameworks": "static",
      "ios.deploymentTarget": "15.1",
    };
    return {
      modResults,
      ...config,
    };
  });

  return config;
}

export const withEmarsysiOS: ConfigPlugin<EMSOptions> = (config, options) => {
  config = withEmarsysInfoPlist(config, options);
  config = withEmarsysDangerousMod(config, options);
  config = withEmarsysXcodeProject(config, options);
  config = withEmarsysPodfileConfig(config);
  return config;
};
