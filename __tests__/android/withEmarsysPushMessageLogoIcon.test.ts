import { ExpoConfig } from 'expo/config';
import { withEmarsysPushMessageLogoIcon } from '../../src/android/withEmarsysPushMessageLogoIcon';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withDangerousMod: jest.fn((config, modConfig) => {
    const [platform, modFunction] = modConfig;
    if (platform === 'android' && typeof modFunction === 'function') {
      return modFunction(config);
    }
    return config;
  }),
  withAndroidManifest: jest.fn((config, modifyFunction) => {
    // Create a proper config structure for the Android manifest modifier
    const manifestConfig = {
      ...config,
      modRequest: config.modRequest || { projectRoot: '/test/project' },
      // Preserve existing modResults if they exist, otherwise provide default
      modResults: config.modResults || {
        manifest: {
          application: [{}]
        }
      }
    };
    const result = modifyFunction(manifestConfig);
    // Ensure we return a config that preserves the original properties
    return { ...config, ...result };
  }),
}));

// Mock the helper function
jest.mock('../../src/android/withEmarsysAndroidHelpers', () => ({
  addMetaData: jest.fn(),
}));

// Mock file system operations
const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
};

const mockPath = {
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((filePath) => filePath.split('/').slice(0, -1).join('/')),
};

jest.mock('fs', () => mockFs);
jest.mock('path', () => mockPath);

// Mock console methods
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();
global.console = {
  ...global.console,
  log: mockConsoleLog,
  warn: mockConsoleWarn,
};

// Type for config with modRequest and manifest
type ConfigWithModRequest = ExpoConfig & {
  modRequest: {
    projectRoot: string;
  };
  modResults?: {
    manifest: {
      application: Array<{
        'meta-data'?: Array<{
          $: {
            'android:name': string;
            'android:value': string;
          };
        }>;
      }>;
    };
  };
};

describe('withPushMessageLogoIcon', () => {
  let mockConfig: ConfigWithModRequest;
  const { addMetaData } = require('../../src/android/withEmarsysAndroidHelpers');

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
      modRequest: {
        projectRoot: '/test/project'
      },
      modResults: {
        manifest: {
          application: [{}]
        }
      }
    };
    jest.clearAllMocks();
    
    // Reset all mocks to default behavior
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.copyFileSync.mockImplementation(() => {});
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.dirname.mockImplementation((filePath) => filePath.split('/').slice(0, -1).join('/'));
    addMetaData.mockImplementation(() => {});
  });

  it('should be a function', () => {
    expect(typeof withEmarsysPushMessageLogoIcon).toBe('function');
  });

  it('should accept only config parameter', () => {
    expect(withEmarsysPushMessageLogoIcon.length).toBe(1);
  });

  describe('file operations', () => {
    it('should copy mobile_engage_logo_icon.jpg when source file exists', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg') // source path
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg'); // dest path
      mockPath.dirname.mockReturnValue('/test/project/android/app/src/main/res/drawable');

      const result = await withEmarsysPushMessageLogoIcon(mockConfig);

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/project/assets/mobile_engage_logo_icon.jpg');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/project/android/app/src/main/res/drawable', { recursive: true });
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        '/test/project/assets/mobile_engage_logo_icon.jpg',
        '/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('Copied mobile_engage_logo_icon to /test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg');
      // Function should return some config object
      expect(result).toBeDefined();
    });

    it('should skip file operations and warn when source file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockPath.join.mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg');

      const result = await withEmarsysPushMessageLogoIcon(mockConfig);

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/project/assets/mobile_engage_logo_icon.jpg');
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith('Source file /test/project/assets/mobile_engage_logo_icon.jpg does not exist. Skipping copy.');
      // Function should return some config object
      expect(result).toBeDefined();
    });

    it('should create destination directory recursively', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg');
      mockPath.dirname.mockReturnValue('/test/project/android/app/src/main/res/drawable');

      await withEmarsysPushMessageLogoIcon(mockConfig);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/project/android/app/src/main/res/drawable', { recursive: true });
    });
  });

  describe('android manifest modifications', () => {
    it('should add meta-data to android manifest when source file exists', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg') // for dangerous mod
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg') // for dangerous mod
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg'); // for manifest mod

      const result = await withEmarsysPushMessageLogoIcon(mockConfig);

      expect(addMetaData).toHaveBeenCalledWith(
        mockConfig.modResults?.manifest.application[0],
        'com.emarsys.mobileengage.small_notification_icon',
        '@drawable/mobile_engage_logo_icon'
      );
      // Function should return some config object
      expect(result).toBeDefined();
    });

    it('should skip manifest modification and warn when source file does not exist', async () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // for dangerous mod
        .mockReturnValueOnce(false); // for manifest mod
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg') // for dangerous mod
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg'); // for manifest mod

      const result = await withEmarsysPushMessageLogoIcon(mockConfig);

      expect(addMetaData).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith('Source file /test/project/assets/mobile_engage_logo_icon.jpg does not exist. Skipping AndroidManifest update.');
      // Function should return some config object
      expect(result).toBeDefined();
    });

    it('should handle empty application array in manifest', async () => {
      // Mock withAndroidManifest to use the actual empty array
      const { withAndroidManifest } = require('expo/config-plugins');
      withAndroidManifest.mockImplementationOnce((config: any, modifyFunction: any) => {
        const manifestConfig = {
          ...config,
          modRequest: { projectRoot: '/test/project' },
          modResults: {
            manifest: {
              application: [] // Empty array
            }
          }
        };
        const result = modifyFunction(manifestConfig);
        return { ...config, ...result };
      });

      const configWithEmptyApp = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: []
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg');

      const result = await withEmarsysPushMessageLogoIcon(configWithEmptyApp);

      expect(addMetaData).not.toHaveBeenCalled();
      // Function should return some config object
      expect(result).toBeDefined();
    });

    it('should handle non-array application in manifest', async () => {
      // Mock withAndroidManifest to use a non-array application
      const { withAndroidManifest } = require('expo/config-plugins');
      withAndroidManifest.mockImplementationOnce((config: any, modifyFunction: any) => {
        const manifestConfig = {
          ...config,
          modRequest: { projectRoot: '/test/project' },
          modResults: {
            manifest: {
              application: {} as any // Non-array
            }
          }
        };
        const result = modifyFunction(manifestConfig);
        return { ...config, ...result };
      });

      const configWithNonArrayApp = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: {} as any
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg');

      const result = await withEmarsysPushMessageLogoIcon(configWithNonArrayApp);

      expect(addMetaData).not.toHaveBeenCalled();
      // Function should return some config object
      expect(result).toBeDefined();
    });

    it('should handle missing modResults in config', async () => {
      const configWithoutModResults = {
        ...mockConfig,
        modResults: undefined
      };

      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg');

      // This should not throw an error
      expect(() => withEmarsysPushMessageLogoIcon(configWithoutModResults)).not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should perform both file operations and manifest modifications when source exists', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg');

      const result = await withEmarsysPushMessageLogoIcon(mockConfig);

      // Verify file operations
      expect(mockFs.copyFileSync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('Copied mobile_engage_logo_icon to /test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg');
      
      // Verify manifest modifications
      expect(addMetaData).toHaveBeenCalledWith(
        mockConfig.modResults?.manifest.application[0],
        'com.emarsys.mobileengage.small_notification_icon',
        '@drawable/mobile_engage_logo_icon'
      );
      
      // Function should return some config object
      expect(result).toBeDefined();
    });

    it('should skip both operations when source file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg');

      const result = await withEmarsysPushMessageLogoIcon(mockConfig);

      // Verify file operations were skipped
      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith('Source file /test/project/assets/mobile_engage_logo_icon.jpg does not exist. Skipping copy.');
      
      // Verify manifest modifications were skipped
      expect(addMetaData).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith('Source file /test/project/assets/mobile_engage_logo_icon.jpg does not exist. Skipping AndroidManifest update.');
      
      // Function should return some config object
      expect(result).toBeDefined();
    });
  });

  describe('path construction', () => {
    it('should construct correct source and destination paths', async () => {
      mockFs.existsSync.mockReturnValue(true);
      
      await withEmarsysPushMessageLogoIcon(mockConfig);

      // Check source path construction (called twice - once for each mod)
      expect(mockPath.join).toHaveBeenCalledWith('/test/project', 'assets', 'mobile_engage_logo_icon.jpg');
      
      // Check destination path construction
      expect(mockPath.join).toHaveBeenCalledWith('/test/project', 'android', 'app', 'src', 'main', 'res', 'drawable', 'mobile_engage_logo_icon.jpg');
    });

    it('should use correct drawable reference in meta-data', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/android/app/src/main/res/drawable/mobile_engage_logo_icon.jpg')
        .mockReturnValueOnce('/test/project/assets/mobile_engage_logo_icon.jpg');

      await withEmarsysPushMessageLogoIcon(mockConfig);

      expect(addMetaData).toHaveBeenCalledWith(
        expect.any(Object),
        'com.emarsys.mobileengage.small_notification_icon',
        '@drawable/mobile_engage_logo_icon'
      );
    });
  });
});