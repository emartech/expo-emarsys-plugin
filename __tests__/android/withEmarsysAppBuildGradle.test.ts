import { ExpoConfig } from 'expo/config';
import { EMSOptions } from '../../src/types';
import { withEmarsysAppBuildGradle } from '../../src/android/withEmarsysAppBuildGradle';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withAppBuildGradle: jest.fn((config, modifyFunction) => {
    return modifyFunction(config);
  }),
}));

// Type for config with modResults
type ConfigWithModResults = ExpoConfig & {
  modResults: {
    contents: string;
  };
};

describe('withEmarsysAppBuildGradle', () => {
  let mockConfig: ExpoConfig;
  let _mockOptions: EMSOptions;

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
    };
    _mockOptions = {
      applicationCode: 'TEST_APP_CODE',
      merchantId: 'TEST_MERCHANT_ID',
    };
    jest.clearAllMocks();
  });

  it('should add coreLibraryDesugaringEnabled to existing compileOptions', () => {
    const mockAppBuildGradleContent = `
android {
  compileSdkVersion 34
  
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
  }
}

dependencies {
  implementation 'androidx.core:core:1.8.0'
}`;

    const configWithAppBuildGradle: ConfigWithModResults = {
      ...mockConfig,
      modResults: {
        contents: mockAppBuildGradleContent
      }
    };

    const result = withEmarsysAppBuildGradle(configWithAppBuildGradle) as ConfigWithModResults;

    expect(result.modResults.contents).toContain('coreLibraryDesugaringEnabled true');
    expect(result.modResults.contents).toContain("coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'");
    expect(result.modResults.contents).toContain("implementation platform('com.google.firebase:firebase-bom:34.0.0')");
    expect(result.modResults.contents).toContain("apply plugin: 'com.google.gms.google-services'");
  });

  it('should add compileOptions block when not present', () => {
    const mockAppBuildGradleContent = `
android {
  compileSdkVersion 34
  namespace "com.test.app"
}

dependencies {
  implementation 'androidx.core:core:1.8.0'
}`;

    const configWithAppBuildGradle: ConfigWithModResults = {
      ...mockConfig,
      modResults: {
        contents: mockAppBuildGradleContent
      }
    };

    const result = withEmarsysAppBuildGradle(configWithAppBuildGradle) as ConfigWithModResults;

    expect(result.modResults.contents).toContain('compileOptions {');
    expect(result.modResults.contents).toContain('coreLibraryDesugaringEnabled true');
  });

  it('should not duplicate coreLibraryDesugaringEnabled when already present', () => {
    const mockAppBuildGradleContent = `
android {
  compileSdkVersion 34
  
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
      coreLibraryDesugaringEnabled true
  }
}

dependencies {
  implementation 'androidx.core:core:1.8.0'
  coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'
  implementation platform('com.google.firebase:firebase-bom:34.0.0')
}
apply plugin: 'com.google.gms.google-services'`;

    const configWithAppBuildGradle: ConfigWithModResults = {
      ...mockConfig,
      modResults: {
        contents: mockAppBuildGradleContent
      }
    };

    const result = withEmarsysAppBuildGradle(configWithAppBuildGradle) as ConfigWithModResults;

    // Count occurrences to ensure no duplication
    const desugaringMatches = result.modResults.contents.match(/coreLibraryDesugaringEnabled true/g);
    const desugaringDepMatches = result.modResults.contents.match(/coreLibraryDesugaring 'com\.android\.tools:desugar_jdk_libs_nio:2\.1\.5'/g);
    const firebaseMatches = result.modResults.contents.match(/implementation platform\('com\.google\.firebase:firebase-bom:34\.0\.0'\)/g);
    const pluginMatches = result.modResults.contents.match(/apply plugin: 'com\.google\.gms\.google-services'/g);

    expect(desugaringMatches).toHaveLength(1);
    expect(desugaringDepMatches).toHaveLength(1);
    expect(firebaseMatches).toHaveLength(1);
    expect(pluginMatches).toHaveLength(1);
  });

  it('should handle empty dependencies block', () => {
    const mockAppBuildGradleContent = `
android {
  compileSdkVersion 34
}

dependencies {
}`;

    const configWithAppBuildGradle: ConfigWithModResults = {
      ...mockConfig,
      modResults: {
        contents: mockAppBuildGradleContent
      }
    };

    const result = withEmarsysAppBuildGradle(configWithAppBuildGradle) as ConfigWithModResults;

    expect(result.modResults.contents).toContain("coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'");
    expect(result.modResults.contents).toContain("implementation platform('com.google.firebase:firebase-bom:34.0.0')");
  });

  it('should add google-services plugin at the end', () => {
    const mockAppBuildGradleContent = `
android {
  compileSdkVersion 34
}

dependencies {
  implementation 'androidx.core:core:1.8.0'
}`;

    const configWithAppBuildGradle: ConfigWithModResults = {
      ...mockConfig,
      modResults: {
        contents: mockAppBuildGradleContent
      }
    };

    const result = withEmarsysAppBuildGradle(configWithAppBuildGradle) as ConfigWithModResults;

    // The plugin should be added at the very end
    expect(result.modResults.contents.trim()).toMatch(/apply plugin: 'com\.google\.gms\.google-services'\s*$/);
  });

  it('should preserve existing content and formatting', () => {
    const mockAppBuildGradleContent = `
// App build.gradle comment
android {
  compileSdkVersion 34
  namespace "com.test.app"
  
  defaultConfig {
      applicationId "com.test.app"
      minSdkVersion 21
      targetSdkVersion 34
  }
  
  // Existing compile options
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
  }
}

dependencies {
  // Core dependencies
  implementation 'androidx.core:core:1.8.0'
  implementation 'com.facebook.react:react-native:+'
}

// Some other configuration
task customTask {
  doLast {
      println 'Custom task executed'
  }
}`;

    const configWithAppBuildGradle: ConfigWithModResults = {
      ...mockConfig,
      modResults: {
        contents: mockAppBuildGradleContent
      }
    };

    const result = withEmarsysAppBuildGradle(configWithAppBuildGradle) as ConfigWithModResults;

    // Should preserve comments and other content
    expect(result.modResults.contents).toContain('// App build.gradle comment');
    expect(result.modResults.contents).toContain('// Existing compile options');
    expect(result.modResults.contents).toContain('// Core dependencies');
    expect(result.modResults.contents).toContain('task customTask');
    expect(result.modResults.contents).toContain('defaultConfig {');
    
    // Should also have the new content
    expect(result.modResults.contents).toContain('coreLibraryDesugaringEnabled true');
    expect(result.modResults.contents).toContain("coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'");
  });
});