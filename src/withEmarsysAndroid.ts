import {
  ConfigPlugin,
  withProjectBuildGradle,
  withAppBuildGradle,
  withAndroidManifest,
  withDangerousMod,
} from 'expo/config-plugins';

import { EMSOptions } from './types';

const DESUGARING_DEP =
  `coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'`;

const COMPILE_OPTIONS = `
  compileOptions {
    coreLibraryDesugaringEnabled true
  }`;
const GOOGLE_SERVICES_CLASSPATH = "classpath('com.google.gms:google-services:4.4.3')";
const GOOGLE_SERVICES_PLUGIN = "apply plugin: 'com.google.gms.google-services'";
const FIREBASE_BOM_DEP = "implementation platform('com.google.firebase:firebase-bom:34.0.0')";

const SERVICE_NAME = "com.emarsys.service.EmarsysFirebaseMessagingService";
const MESSAGING_EVENT = "com.google.firebase.MESSAGING_EVENT";

const withEmarsysProjectBuildGradle: ConfigPlugin = config =>
  withProjectBuildGradle(config, config => {
    let contents = config.modResults.contents;
    if (!contents.includes(GOOGLE_SERVICES_CLASSPATH)) {
      contents = contents.replace(
        /(buildscript\s*{[\s\S]*?dependencies\s*{)/m,
        `$1\n        ${GOOGLE_SERVICES_CLASSPATH}`
      );
    }
    config.modResults.contents = contents;
    return config;
  });

const withEmarsysAppBuildGradle: ConfigPlugin = config =>
  withAppBuildGradle(config, config => {
    let contents = config.modResults.contents;

    // Ensure coreLibraryDesugaringEnabled
    if (!contents.includes('coreLibraryDesugaringEnabled true')) {
      contents = contents.replace(
        /android\s*{[^}]*}/m,
        match => {
          if (match.includes('compileOptions')) {
            return match.replace(
              /compileOptions\s*{[^}]*}/m,
              compileOptionsBlock => {
                if (compileOptionsBlock.includes('coreLibraryDesugaringEnabled')) {
                  return compileOptionsBlock;
                }
                return compileOptionsBlock.replace(
                  /}/,
                  '    coreLibraryDesugaringEnabled true\n}'
                );
              }
            );
          } else {
            return match.replace(
              /}/,
              `${COMPILE_OPTIONS}\n}`
            );
          }
        }
      );
    }

    // Add desugaring and firebase bom dependencies
    contents = contents.replace(
      /dependencies\s*{([\s\S]*?)\n}/m,
      (match, deps) => {
        let updatedDeps = deps;
        if (!updatedDeps.includes(DESUGARING_DEP)) {
          updatedDeps += `\n    ${DESUGARING_DEP}`;
        }
        if (!updatedDeps.includes(FIREBASE_BOM_DEP)) {
          updatedDeps += `\n    ${FIREBASE_BOM_DEP}`;
        }
        return `dependencies {\n${updatedDeps}\n}`;
      }
    );

    // Add google-services plugin
    if (!contents.includes(GOOGLE_SERVICES_PLUGIN)) {
      contents = `${contents.trim()}\n${GOOGLE_SERVICES_PLUGIN}\n`;
    }

    config.modResults.contents = contents;
    return config;
  });

function addMetaData(
  app: any,
  name: string,
  value: string
) {
  if (!app['meta-data']) {
    app['meta-data'] = [];
  }
  if (!app['meta-data'].some((item: any) => item.$ && item.$['android:name'] === name)) {
    app['meta-data'].push({
      $: {
        'android:name': name,
        'android:value': value,
      },
    });
  }
}

function addEmarsysMessagingService(app: any) {
  app.service = app.service || [];
  const hasEmarsysMessagingService = app.service.some(
    (srv: any) => srv.$['android:name'] === SERVICE_NAME
  );

  const hasMessagingEventIntentFilter = app.service.some(
    (srv: any) => srv['intent-filter'] &&
      srv['intent-filter'].some((filter: any) =>
        filter.action &&
        filter.action.some((action: any) =>
          action.$ && action.$['android:name'] === MESSAGING_EVENT
        )
      )
  );

  if (!hasEmarsysMessagingService && !hasMessagingEventIntentFilter) {
    app.service.push({
      $: {
        'android:name': SERVICE_NAME,
        'android:exported': 'false',
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': MESSAGING_EVENT,
              },
            },
          ],
        },
      ],
    });
  }
}

const withEmarsysAndroidManifest: ConfigPlugin<EMSOptions> = (config, options) =>
  withAndroidManifest(config, config => {
    const applicationArray = config.modResults.manifest.application;
    if (!Array.isArray(applicationArray) || applicationArray.length === 0) {
      throw new Error("AndroidManifest.xml does not contain an <application> element.");
    }
    const app = applicationArray[0];

    if (options.applicationCode) {
      addMetaData(app, 'EMSApplicationCode', options.applicationCode);
    }
    if (options.merchantId) {
      addMetaData(app, 'EMSMerchantId', options.merchantId);
    }

    addMetaData(app, 'com.emarsys.mobileengage.small_notification_icon', '@drawable/mobile_engage_logo_icon');

    addEmarsysMessagingService(app);

    return config;
  });

const withLogoIcon: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const fs = require('fs');
      const path = require('path');
      const projectRoot = config.modRequest.projectRoot;
      const source = path.join(projectRoot, 'assets', 'mobile_engage_logo_icon.jpg');
      const dest = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable', 'mobile_engage_logo_icon.jpg');

      if (!fs.existsSync(source)) {
        throw new Error(
          `mobile_engage_logo_icon not found in assets. Please put your file at: ${source}`
        );
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });

      fs.copyFileSync(source, dest);
      console.log(`Copied mobile_engage_logo_icon to ${dest}`);

      return config;
    },
  ]);
};

const withGoogleServicesJson: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const fs = require('fs');
      const path = require('path');
      const projectRoot = config.modRequest.projectRoot;
      const source = path.join(projectRoot, 'assets', 'google-services.json');
      const dest = path.join(projectRoot, 'android', 'app', 'google-services.json');

      if (!fs.existsSync(source)) {
        throw new Error(
          `google-services.json not found in assets. Please put your file at: ${source}`
        );
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });

      fs.copyFileSync(source, dest);
      console.log(`Copied google-services.json to ${dest}`);

      return config;
    },
  ]);
};

export const withEmarsysAndroid: ConfigPlugin<EMSOptions> = (config, options) => {
  config = withEmarsysProjectBuildGradle(config);
  config = withEmarsysAppBuildGradle(config);
  config = withEmarsysAndroidManifest(config, options);
  config = withGoogleServicesJson(config);
  config = withLogoIcon(config);
  return config;
};
