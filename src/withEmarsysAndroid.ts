import {
  ConfigPlugin,
  withProjectBuildGradle,
  withAppBuildGradle,
  withAndroidManifest,
} from 'expo/config-plugins';
import { EmarsysSDKOptions } from './types';

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

const withEmarsysAndroidManifest: ConfigPlugin<EmarsysSDKOptions> = (config, options) =>
  withAndroidManifest(config, config => {
    const applicationArray = config.modResults.manifest.application;
    if (!Array.isArray(applicationArray) || applicationArray.length === 0) {
      throw new Error("AndroidManifest.xml does not contain an <application> element.");
    }
    const app = applicationArray[0];
    app['meta-data'] = app['meta-data'] || [];

    if (options.applicationCode) {
      app['meta-data'].push({
        $: {
          'android:name': 'EMSApplicationCode',
          'android:value': options.applicationCode,
        },
      });
    }
    if (options.merchantId) {
      app['meta-data'].push({
        $: {
          'android:name': 'EMSMerchantId',
          'android:value': options.merchantId,
        },
      });
    }

    app.service = app.service || [];
    const alreadyExists = app.service.some(
      (srv) => srv.$['android:name'] === SERVICE_NAME
    );
    if (!alreadyExists) {
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

    return config;
  });


export const withEmarsysAndroid: ConfigPlugin<{
  applicationCode: string,
  merchantId: string,
}> = (config, options) => {
  config = withEmarsysProjectBuildGradle(config);
  config = withEmarsysAppBuildGradle(config);
  config = withEmarsysAndroidManifest(config, options);
  return config;
};
