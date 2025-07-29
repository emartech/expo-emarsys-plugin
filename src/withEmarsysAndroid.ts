import {
  ConfigPlugin,
  withProjectBuildGradle,
  withAppBuildGradle,
  withAndroidManifest,
} from 'expo/config-plugins';

const DESUGARING_DEP =
  `coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'`;

const COMPILE_OPTIONS = `
  compileOptions {
    coreLibraryDesugaringEnabled true
  }`;
const GOOGLE_SERVICES_CLASSPATH = "classpath('com.google.gms:google-services:4.4.3')";
const GOOGLE_SERVICES_PLUGIN = "apply plugin: 'com.google.gms.google-services'";
const FIREBASE_BOM_DEP = "implementation platform('com.google.firebase:firebase-bom:34.0.0')";

const withEmarsysAndroid: ConfigPlugin<{
  applicationCode: string,
  merchantId: string
}> = (config, options) => {

  config = withProjectBuildGradle(config, config => {
    let contents = config.modResults.contents;
    if (!contents.includes(GOOGLE_SERVICES_CLASSPATH)) {
      contents = contents.replace(
        /(buildscript\s*{[\s\S]*?dependencies\s*{)/m,
        `$1\n        ${GOOGLE_SERVICES_CLASSPATH}`
      );
      console.log('Inserted google-services classpath');
    }
    config.modResults.contents = contents;
    return config;
  });

  config = withAppBuildGradle(config, config => {
    let contents = config.modResults.contents;

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

    if (!contents.includes(GOOGLE_SERVICES_PLUGIN)) {
      contents = `${contents.trim()}\n${GOOGLE_SERVICES_PLUGIN}\n`;
    }

    config.modResults.contents = contents;
    return config;
  });

  config = withAndroidManifest(config, config => {
    const applicationArray = config.modResults.manifest.application;
    if (!Array.isArray(applicationArray) || applicationArray.length === 0) {
      throw new Error("AndroidManifest.xml does not contain an <application> element.");
    }
    const app = applicationArray[0];
    app['meta-data'] = app['meta-data'] || [];
    
    const applicationCode = options.applicationCode;
    if (applicationCode) {
      app['meta-data'].push({
        $: {
          'android:name': 'EMSApplicationCode',
          'android:value': applicationCode,
        },
      });
    }

    const merchantId = options.merchantId;
    if (merchantId) {
      app['meta-data'].push({
        $: {
          'android:name': 'EMSMerchantId',
          'android:value': merchantId,
        },
      });
    }

    const SERVICE_NAME = "com.emarsys.service.EmarsysFirebaseMessagingService";
    const MESSAGING_EVENT = "com.google.firebase.MESSAGING_EVENT";
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

  return config;
};

export default withEmarsysAndroid;
