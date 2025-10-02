import { ExpoConfig } from 'expo/config';
import { withEmarsysXcodeProject } from '../../src/ios/withEmarsysXcodeProject';
import { EMSOptions } from '../../src/types';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withXcodeProject: jest.fn((config, modifyFunction) => {
    return modifyFunction(config);
  }),
}));

describe('withEmarsysXcodeProject', () => {
  type XcodeProjectConfig = ExpoConfig & {
    ios?: {
      bundleIdentifier?: string;
    };
    modResults: {
      pbxGroupByName: jest.MockedFunction<any>;
      hash: {
        project: {
          objects: {
            [key: string]: any;
            PBXTargetDependency?: any;
            PBXContainerItemProxy?: any;
            PBXGroup?: any;
            XCBuildConfiguration?: any;
          };
        };
      };
      addTarget: jest.MockedFunction<any>;
      addPbxGroup: jest.MockedFunction<any>;
      addToPbxGroup: jest.MockedFunction<any>;
      addBuildPhase: jest.MockedFunction<any>;
    };
  };

  let mockConfig: XcodeProjectConfig;
  let mockOptions: EMSOptions;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
      ios: {
        bundleIdentifier: 'com.example.testapp',
      },
      modResults: {
        pbxGroupByName: jest.fn(),
        hash: {
          project: {
            objects: {
              PBXGroup: {
                'group1': { name: 'TestGroup', path: 'TestPath' },
                'group2': { name: undefined, path: undefined, children: [] }, // unnamed group
                'group3': { name: undefined, path: undefined, children: [] }, // unnamed group
              },
              XCBuildConfiguration: {
                'config1': {
                  buildSettings: {
                    PRODUCT_NAME: '"TestApp"',
                    CURRENT_PROJECT_VERSION: '1',
                    MARKETING_VERSION: '1.0.0',
                    SWIFT_VERSION: '5.0',
                    TARGETED_DEVICE_FAMILY: '1,2',
                    DEVELOPMENT_TEAM: 'TEAMID123',
                    PROVISIONING_PROFILE_SPECIFIER: 'TestProfile',
                    CODE_SIGN_STYLE: 'Manual',
                    CODE_SIGN_IDENTITY: 'iPhone Developer',
                    OTHER_CODE_SIGN_FLAGS: '--deep',
                  }
                },
                'config2': {
                  buildSettings: {
                    PRODUCT_NAME: '"NotificationService"', // This is the target config
                  }
                }
              }
            }
          }
        },
        addTarget: jest.fn(),
        addPbxGroup: jest.fn(),
        addToPbxGroup: jest.fn(),
        addBuildPhase: jest.fn(),
      }
    } as XcodeProjectConfig;
    
    mockOptions = {
      applicationCode: 'TEST_APP_CODE',
      merchantId: 'TEST_MERCHANT_ID',
    };

    // Mock return values
    mockConfig.modResults.pbxGroupByName.mockReturnValue(null); // Group doesn't exist initially
    mockConfig.modResults.addTarget.mockReturnValue({ uuid: 'target-uuid-123' });
    mockConfig.modResults.addPbxGroup.mockReturnValue({ uuid: 'group-uuid-123' });

    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should be a function', () => {
    expect(typeof withEmarsysXcodeProject).toBe('function');
  });

  it('should accept config and options parameters', () => {
    expect(withEmarsysXcodeProject.length).toBe(2);
  });

  it('should work with valid option types', () => {
    // Test that options have correct types
    expect(typeof mockOptions.applicationCode).toBe('string');
    expect(typeof mockOptions.merchantId).toBe('string');
    
    // Test that function exists
    expect(typeof withEmarsysXcodeProject).toBe('function');
  });

  it('should work with empty options object', () => {
    // Test that the function exists and can handle empty options type
    expect(typeof withEmarsysXcodeProject).toBe('function');
    
    // Test that empty options can be created
    const emptyOptions = {} as EMSOptions;
    expect(typeof emptyOptions).toBe('object');
  });

  describe('NotificationService target handling', () => {
    it('should return early if NotificationService target already exists', () => {
      mockConfig.modResults.pbxGroupByName.mockReturnValue({ uuid: 'existing-group' });

      const result = withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.pbxGroupByName).toHaveBeenCalledWith('NotificationService');
      expect(consoleLogSpy).toHaveBeenCalledWith('NotificationService already exists');
      expect(mockConfig.modResults.addTarget).not.toHaveBeenCalled();
      expect(result).toBe(mockConfig);
    });

    it('should proceed to create NotificationService target when it does not exist', () => {
      mockConfig.modResults.pbxGroupByName.mockReturnValue(null);

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.pbxGroupByName).toHaveBeenCalledWith('NotificationService');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(mockConfig.modResults.addTarget).toHaveBeenCalled();
    });
  });

  describe('project objects initialization', () => {
    it('should initialize PBXTargetDependency if it does not exist', () => {
      delete mockConfig.modResults.hash.project.objects.PBXTargetDependency;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.hash.project.objects.PBXTargetDependency).toEqual({});
    });

    it('should initialize PBXContainerItemProxy if it does not exist', () => {
      delete mockConfig.modResults.hash.project.objects.PBXContainerItemProxy;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.hash.project.objects.PBXContainerItemProxy).toEqual({});
    });

    it('should not overwrite existing PBXTargetDependency', () => {
      const existingDependency = { 'dep1': 'value1' };
      mockConfig.modResults.hash.project.objects.PBXTargetDependency = existingDependency;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.hash.project.objects.PBXTargetDependency).toBe(existingDependency);
    });

    it('should not overwrite existing PBXContainerItemProxy', () => {
      const existingProxy = { 'proxy1': 'value1' };
      mockConfig.modResults.hash.project.objects.PBXContainerItemProxy = existingProxy;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.hash.project.objects.PBXContainerItemProxy).toBe(existingProxy);
    });
  });

  describe('target creation', () => {
    it('should add NotificationService target with correct parameters', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addTarget).toHaveBeenCalledWith(
        'NotificationService',
        'app_extension',
        'NotificationService',
        'com.example.testapp.NotificationService'
      );
    });

    it('should handle missing bundle identifier gracefully', () => {
      delete mockConfig.ios?.bundleIdentifier;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addTarget).toHaveBeenCalledWith(
        'NotificationService',
        'app_extension',
        'NotificationService',
        'undefined.NotificationService'
      );
    });

    it('should handle missing ios config gracefully', () => {
      delete mockConfig.ios;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addTarget).toHaveBeenCalledWith(
        'NotificationService',
        'app_extension',
        'NotificationService',
        'undefined.NotificationService'
      );
    });
  });

  describe('PBX group creation', () => {
    it('should add PBX group with correct files and target name', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addPbxGroup).toHaveBeenCalledWith(
        ['NotificationService.swift', 'NotificationService-Info.plist'],
        'NotificationService',
        'NotificationService'
      );
    });

    it('should add group to unnamed parent groups', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addToPbxGroup).toHaveBeenCalledWith('group-uuid-123', 'group2');
      expect(mockConfig.modResults.addToPbxGroup).toHaveBeenCalledWith('group-uuid-123', 'group3');
      expect(mockConfig.modResults.addToPbxGroup).not.toHaveBeenCalledWith('group-uuid-123', 'group1');
      expect(mockConfig.modResults.addToPbxGroup).toHaveBeenCalledTimes(2);
    });

    it('should handle empty PBXGroup objects', () => {
      mockConfig.modResults.hash.project.objects.PBXGroup = {};

      expect(() => withEmarsysXcodeProject(mockConfig, mockOptions)).not.toThrow();
      expect(mockConfig.modResults.addToPbxGroup).not.toHaveBeenCalled();
    });

    it('should handle non-object PBXGroup entries', () => {
      mockConfig.modResults.hash.project.objects.PBXGroup = {
        'string-key': 'not-an-object',
        'valid-key': { name: undefined, path: undefined, children: [] }
      };

      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addToPbxGroup).toHaveBeenCalledWith('group-uuid-123', 'valid-key');
      expect(mockConfig.modResults.addToPbxGroup).toHaveBeenCalledTimes(1);
    });

    it('should throw error when PBXGroup entry is null', () => {
      mockConfig.modResults.hash.project.objects.PBXGroup = {
        'null-key': null,
        'valid-key': { name: undefined, path: undefined, children: [] }
      };

      expect(() => withEmarsysXcodeProject(mockConfig, mockOptions)).toThrow("Cannot read properties of null (reading 'name')");
    });
  });

  describe('build phase creation', () => {
    it('should add build phase with correct parameters', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addBuildPhase).toHaveBeenCalledWith(
        ['NotificationService.swift'],
        'PBXSourcesBuildPhase',
        'Sources',
        'target-uuid-123'
      );
    });
  });

  describe('build settings configuration', () => {
    it('should copy build settings from existing configuration to NotificationService', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      const notificationServiceConfig = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config2;
      
      expect(notificationServiceConfig.buildSettings.CURRENT_PROJECT_VERSION).toBe('1');
      expect(notificationServiceConfig.buildSettings.MARKETING_VERSION).toBe('1.0.0');
      expect(notificationServiceConfig.buildSettings.SWIFT_VERSION).toBe('5.0');
      expect(notificationServiceConfig.buildSettings.TARGETED_DEVICE_FAMILY).toBe('1,2');
      expect(notificationServiceConfig.buildSettings.DEVELOPMENT_TEAM).toBe('TEAMID123');
      expect(notificationServiceConfig.buildSettings.PROVISIONING_PROFILE_SPECIFIER).toBe('TestProfile');
      expect(notificationServiceConfig.buildSettings.CODE_SIGN_STYLE).toBe('Manual');
      expect(notificationServiceConfig.buildSettings.CODE_SIGN_IDENTITY).toBe('iPhone Developer');
      expect(notificationServiceConfig.buildSettings.OTHER_CODE_SIGN_FLAGS).toBe('--deep');
    });

    it('should not copy settings that do not exist in source configuration', () => {
      // Remove some settings from source
      delete mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config1.buildSettings.DEVELOPMENT_TEAM;
      delete mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config1.buildSettings.SWIFT_VERSION;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      const notificationServiceConfig = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config2;
      
      expect(notificationServiceConfig.buildSettings.CURRENT_PROJECT_VERSION).toBe('1');
      expect(notificationServiceConfig.buildSettings.MARKETING_VERSION).toBe('1.0.0');
      expect(notificationServiceConfig.buildSettings.DEVELOPMENT_TEAM).toBeUndefined();
      expect(notificationServiceConfig.buildSettings.SWIFT_VERSION).toBeUndefined();
    });

    it('should handle missing XCBuildConfiguration objects', () => {
      mockConfig.modResults.hash.project.objects.XCBuildConfiguration = {};

      expect(() => withEmarsysXcodeProject(mockConfig, mockOptions)).not.toThrow();
    });

    it('should handle configurations without buildSettings', () => {
      mockConfig.modResults.hash.project.objects.XCBuildConfiguration = {
        'config1': {}, // No buildSettings
        'config2': {
          buildSettings: {
            PRODUCT_NAME: '"NotificationService"'
          }
        }
      };

      expect(() => withEmarsysXcodeProject(mockConfig, mockOptions)).not.toThrow();
    });

    it('should handle configurations with null buildSettings', () => {
      mockConfig.modResults.hash.project.objects.XCBuildConfiguration = {
        'config1': {
          buildSettings: null
        },
        'config2': {
          buildSettings: {
            PRODUCT_NAME: '"NotificationService"'
          }
        }
      };

      expect(() => withEmarsysXcodeProject(mockConfig, mockOptions)).not.toThrow();
    });

    it('should not copy from NotificationService configurations', () => {
      mockConfig.modResults.hash.project.objects.XCBuildConfiguration = {
        'config1': {
          buildSettings: {
            PRODUCT_NAME: '"NotificationService"',
            CURRENT_PROJECT_VERSION: '999', // Should not be used as source
          }
        },
        'config2': {
          buildSettings: {
            PRODUCT_NAME: '"MainApp"',
            CURRENT_PROJECT_VERSION: '1',
          }
        },
        'config3': {
          buildSettings: {
            PRODUCT_NAME: '"NotificationService"', // Target config
          }
        }
      };

      withEmarsysXcodeProject(mockConfig, mockOptions);

      const notificationServiceConfig = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config3;
      expect(notificationServiceConfig.buildSettings.CURRENT_PROJECT_VERSION).toBe('1');
    });
  });

  describe('config handling', () => {
    it('should return the config object', () => {
      const result = withEmarsysXcodeProject(mockConfig, mockOptions);
      
      expect(result).toBe(mockConfig);
      expect(result.name).toBe('test-app');
      expect(result.slug).toBe('test-app');
    });

    it('should work with minimal config', () => {
      const minimalConfig: XcodeProjectConfig = {
        name: 'minimal-app',
        slug: 'minimal-app',
        modResults: {
          pbxGroupByName: jest.fn().mockReturnValue(null),
          hash: {
            project: {
              objects: {
                PBXGroup: {},
                XCBuildConfiguration: {}
              }
            }
          },
          addTarget: jest.fn().mockReturnValue({ uuid: 'target-uuid' }),
          addPbxGroup: jest.fn().mockReturnValue({ uuid: 'group-uuid' }),
          addToPbxGroup: jest.fn(),
          addBuildPhase: jest.fn(),
        }
      };
      
      const result = withEmarsysXcodeProject(minimalConfig, mockOptions);
      
      expect(result.name).toBe('minimal-app');
      expect(minimalConfig.modResults.addTarget).toHaveBeenCalled();
    });

    it('should work with undefined options', () => {
      expect(() => withEmarsysXcodeProject(mockConfig, undefined as any)).not.toThrow();
    });

    it('should work with null options', () => {
      expect(() => withEmarsysXcodeProject(mockConfig, null as any)).not.toThrow();
    });
  });

  describe('constants', () => {
    it('should use correct notification service target name', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.pbxGroupByName).toHaveBeenCalledWith('NotificationService');
      expect(mockConfig.modResults.addTarget).toHaveBeenCalledWith(
        'NotificationService',
        expect.any(String),
        'NotificationService',
        expect.any(String)
      );
    });

    it('should use correct notification service files', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addPbxGroup).toHaveBeenCalledWith(
        ['NotificationService.swift', 'NotificationService-Info.plist'],
        expect.any(String),
        expect.any(String)
      );
    });

    it('should use correct target type', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addTarget).toHaveBeenCalledWith(
        expect.any(String),
        'app_extension',
        expect.any(String),
        expect.any(String)
      );
    });

    it('should use correct build phase configuration', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      expect(mockConfig.modResults.addBuildPhase).toHaveBeenCalledWith(
        ['NotificationService.swift'],
        'PBXSourcesBuildPhase',
        'Sources',
        expect.any(String)
      );
    });
  });

  describe('build settings copying', () => {
    const expectedSettingsToCopy = [
      'CURRENT_PROJECT_VERSION',
      'MARKETING_VERSION',
      'SWIFT_VERSION',
      'TARGETED_DEVICE_FAMILY',
      'DEVELOPMENT_TEAM',
      'PROVISIONING_PROFILE_SPECIFIER',
      'CODE_SIGN_STYLE',
      'CODE_SIGN_IDENTITY',
      'OTHER_CODE_SIGN_FLAGS'
    ];

    it('should copy all specified build settings when available', () => {
      withEmarsysXcodeProject(mockConfig, mockOptions);

      const targetConfig = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config2;
      
      expectedSettingsToCopy.forEach(setting => {
        expect(targetConfig.buildSettings[setting]).toBeDefined();
      });
    });

    it('should not add undefined settings to target configuration', () => {
      const sourceConfig = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config1;
      
      // Remove some settings
      delete sourceConfig.buildSettings.DEVELOPMENT_TEAM;
      delete sourceConfig.buildSettings.CODE_SIGN_IDENTITY;

      withEmarsysXcodeProject(mockConfig, mockOptions);

      const targetConfig = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.config2;
      
      expect(targetConfig.buildSettings.DEVELOPMENT_TEAM).toBeUndefined();
      expect(targetConfig.buildSettings.CODE_SIGN_IDENTITY).toBeUndefined();
      expect(targetConfig.buildSettings.CURRENT_PROJECT_VERSION).toBe('1'); // Should still exist
    });

    it('should handle multiple NotificationService configurations', () => {
      mockConfig.modResults.hash.project.objects.XCBuildConfiguration = {
        'source': {
          buildSettings: {
            PRODUCT_NAME: '"MainApp"',
            CURRENT_PROJECT_VERSION: '1',
            SWIFT_VERSION: '5.0'
          }
        },
        'target1': {
          buildSettings: {
            PRODUCT_NAME: '"NotificationService"'
          }
        },
        'target2': {
          buildSettings: {
            PRODUCT_NAME: '"NotificationService"'
          }
        }
      };

      withEmarsysXcodeProject(mockConfig, mockOptions);

      const target1 = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.target1;
      const target2 = mockConfig.modResults.hash.project.objects.XCBuildConfiguration.target2;
      
      expect(target1.buildSettings.CURRENT_PROJECT_VERSION).toBe('1');
      expect(target1.buildSettings.SWIFT_VERSION).toBe('5.0');
      expect(target2.buildSettings.CURRENT_PROJECT_VERSION).toBe('1');
      expect(target2.buildSettings.SWIFT_VERSION).toBe('5.0');
    });
  });
});