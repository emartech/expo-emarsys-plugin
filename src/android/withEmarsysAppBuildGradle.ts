import {
  ConfigPlugin,
  withAppBuildGradle
} from 'expo/config-plugins'

const DESUGARING_DEP =
  `coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'`;

const COMPILE_OPTIONS = `
  compileOptions {
    coreLibraryDesugaringEnabled true
  }`;

const GOOGLE_SERVICES_PLUGIN = "apply plugin: 'com.google.gms.google-services'";
const FIREBASE_BOM_DEP = "implementation platform('com.google.firebase:firebase-bom:34.0.0')";

export const withEmarsysAppBuildGradle: ConfigPlugin = config =>
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
