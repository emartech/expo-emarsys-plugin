import {
  ConfigPlugin,
  withAppBuildGradle,
  // withAndroidManifest,
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
    // Inject compileOptions in android { ... }
    if (!config.modResults.contents.includes('coreLibraryDesugaringEnabled true')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*{[^}]*}/m,
        match => {
          // Add compileOptions before the last '}'
          return match.replace(/}$/, `${COMPILE_OPTIONS}\n}`);
        }
      );
    }

    // Inject dependency in dependencies { ... }
    if (!config.modResults.contents.includes(DESUGARING_DEP)) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{([\s\S]*?)\n}/m, // Multi-line, matches until last newline before }
        (match, deps) => {
          // Insert just before the closing }
          return `dependencies {\n${deps}\n    ${DESUGARING_DEP}\n}`;
        }
      );
    }

    return config;
  });

  // config = withAndroidManifest(config, config => {
  //   // TODO: Add Emarsys messaging service, etc.
  //   return config;
  // });

  return config;
};

export default withEmarsysAndroid;
