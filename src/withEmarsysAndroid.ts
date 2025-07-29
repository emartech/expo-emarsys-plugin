import {
  ConfigPlugin,
  withAppBuildGradle,
  withAndroidManifest,
} from 'expo/config-plugins';

const DESUGARING_DEP =
  `coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'`;

const COMPILE_OPTIONS = `
  compileOptions {
    coreLibraryDesugaringEnabled true
  }`;

const withEmarsysAndroid: ConfigPlugin<{
  applicationCode: string,
  merchantId: string
}> = (config, options) => {
  config = withAppBuildGradle(config, config => {
    if (!config.modResults.contents.includes('coreLibraryDesugaringEnabled true')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*{[^}]*}/m,
        match => {
          return match.replace(/}$/, `${COMPILE_OPTIONS}\n}`);
        }
      );
    }

    if (!config.modResults.contents.includes(DESUGARING_DEP)) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{([\s\S]*?)\n}/m,
        (match, deps) => {
          return `dependencies {\n${deps}\n    ${DESUGARING_DEP}\n}`;
        }
      );
    }

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
