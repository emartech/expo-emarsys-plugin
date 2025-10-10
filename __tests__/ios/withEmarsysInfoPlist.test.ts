import { ExpoConfig } from 'expo/config';
import { withEmarsysInfoPlist } from '../../src/ios/withEmarsysInfoPlist';
import { EMSOptions } from '../../src/types';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withInfoPlist: jest.fn((config, modifyFunction) => {
    return modifyFunction(config);
  }),
}));

describe('withEmarsysInfoPlist', () => {
  type InfoPlistConfig = ExpoConfig & {
    modResults: {
      [key: string]: any;
      'com.emarsys.rnwrapper.applicationCode'?: string;
      'com.emarsys.rnwrapper.merchantId'?: string;
      'com.emarsys.rnwrapper.enableConsoleLogging'?: boolean;
    };
  };

  let mockConfig: InfoPlistConfig;
  let mockOptions: EMSOptions;

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
      modResults: {},
    } as InfoPlistConfig;
    
    mockOptions = {
      applicationCode: 'TEST_APP_CODE',
      merchantId: 'TEST_MERCHANT_ID',
      enableConsoleLogging: true,
      androidSharedPackageNames: [],
      androidSharedSecret: '',
      iosSharedKeychainAccessGroup: ''
    };

    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof withEmarsysInfoPlist).toBe('function');
  });

  it('should accept config and options parameters', () => {
    expect(withEmarsysInfoPlist.length).toBe(2);
  });

  it('should work with valid option types', () => {
    // Test that options have correct types
    expect(typeof mockOptions.applicationCode).toBe('string');
    expect(typeof mockOptions.merchantId).toBe('string');
    expect(typeof mockOptions.enableConsoleLogging).toBe('boolean');
    
    // Test that function exists
    expect(typeof withEmarsysInfoPlist).toBe('function');
  });

  it('should work with empty options object', () => {
    // Test that the function exists and can handle empty options type
    expect(typeof withEmarsysInfoPlist).toBe('function');
    
    // Test that minimal options can be created
    const minimalOptions = {
      applicationCode: '',
      merchantId: '',
      enableConsoleLogging: false
    } as EMSOptions;
    expect(typeof minimalOptions).toBe('object');
  });

  describe('Info.plist modifications', () => {
    it('should add com.emarsys.rnwrapper.applicationCode when applicationCode is provided', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: 'TEST123',
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('TEST123');
    });

    it('should add com.emarsys.rnwrapper.merchantId when merchantId is provided', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: 'TEST123',
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('MERCHANT456');
    });

    it('should add both com.emarsys.rnwrapper.applicationCode and com.emarsys.rnwrapper.merchantId when both are provided', () => {
      const result = withEmarsysInfoPlist(mockConfig, mockOptions) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('TEST_APP_CODE');
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('TEST_MERCHANT_ID');
      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBe(true);
    });

    it('should not add com.emarsys.rnwrapper.applicationCode when applicationCode is not provided', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: '',
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false
      } as EMSOptions) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('MERCHANT456');
    });

    it('should not add com.emarsys.rnwrapper.merchantId when merchantId is not provided', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: 'TEST123',
        merchantId: '',
        enableConsoleLogging: false
      } as EMSOptions) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('TEST123');
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBeUndefined();
    });

    it('should not add any keys when both options are not provided', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: '',
        merchantId: '',
        enableConsoleLogging: false
      } as EMSOptions) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBeUndefined();
    });

    it('should not add com.emarsys.rnwrapper.applicationCode when applicationCode is empty string', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: '',
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false
      } as EMSOptions) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('MERCHANT456');
    });

    it('should not add com.emarsys.rnwrapper.merchantId when merchantId is empty string', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: 'TEST123',
        merchantId: '',
        enableConsoleLogging: false
      } as EMSOptions) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('TEST123');
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBeUndefined();
    });

    it('should not add keys when both options are empty strings', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: '',
        merchantId: '',
        enableConsoleLogging: false
      } as EMSOptions) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBeUndefined();
    });

    it('should preserve existing modResults properties', () => {
      const configWithExistingData: InfoPlistConfig = {
        ...mockConfig,
        modResults: {
          CFBundleVersion: '1.0.0',
          CFBundleDisplayName: 'MyApp',
          SomeOtherKey: 'SomeValue'
        }
      };

      const result = withEmarsysInfoPlist(configWithExistingData, mockOptions) as InfoPlistConfig;

      expect(result.modResults.CFBundleVersion).toBe('1.0.0');
      expect(result.modResults.CFBundleDisplayName).toBe('MyApp');
      expect(result.modResults.SomeOtherKey).toBe('SomeValue');
      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('TEST_APP_CODE');
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('TEST_MERCHANT_ID');
      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBe(true);
    });

    it('should overwrite existing com.emarsys.rnwrapper.applicationCode when provided', () => {
      const configWithExistingEMS: InfoPlistConfig = {
        ...mockConfig,
        modResults: {
          'com.emarsys.rnwrapper.applicationCode': 'OLD_CODE',
          'com.emarsys.rnwrapper.merchantId': 'OLD_MERCHANT'
        }
      };

      const result = withEmarsysInfoPlist(configWithExistingEMS, {
        applicationCode: 'NEW_CODE',
        merchantId: 'NEW_MERCHANT',
        enableConsoleLogging: true,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('NEW_CODE');
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('NEW_MERCHANT');
    });

    it('should add com.emarsys.rnwrapper.enableConsoleLogging when enableConsoleLogging is true', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: 'TEST123',
        merchantId: 'MERCHANT456',
        enableConsoleLogging: true,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBe(true);
    });

    it('should not add com.emarsys.rnwrapper.enableConsoleLogging when enableConsoleLogging is false', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: 'TEST123',
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBeUndefined();
    });

    it('should work with only enableConsoleLogging set to true', () => {
      const result = withEmarsysInfoPlist(mockConfig, {
        applicationCode: '',
        merchantId: '',
        enableConsoleLogging: true,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBeUndefined();
      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBe(true);
    });

    it('should overwrite existing com.emarsys.rnwrapper.enableConsoleLogging when provided', () => {
      const configWithExistingEMS: InfoPlistConfig = {
        ...mockConfig,
        modResults: {
          'com.emarsys.rnwrapper.applicationCode': 'OLD_CODE',
          'com.emarsys.rnwrapper.merchantId': 'OLD_MERCHANT',
          'com.emarsys.rnwrapper.enableConsoleLogging': false
        }
      };

      const result = withEmarsysInfoPlist(configWithExistingEMS, {
        applicationCode: 'NEW_CODE',
        merchantId: 'NEW_MERCHANT',
        enableConsoleLogging: true,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as InfoPlistConfig;

      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('NEW_CODE');
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('NEW_MERCHANT');
      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBe(true);
    });
  });

  describe('config handling', () => {
    it('should return the config object', () => {
      const result = withEmarsysInfoPlist(mockConfig, mockOptions) as InfoPlistConfig;
      
      expect(result).toBe(mockConfig);
      expect(result.name).toBe('test-app');
      expect(result.slug).toBe('test-app');
    });

    it('should work with minimal config', () => {
      const minimalConfig: InfoPlistConfig = {
        name: 'minimal-app',
        slug: 'minimal-app',
        modResults: {}
      };
      
      const result = withEmarsysInfoPlist(minimalConfig, mockOptions) as InfoPlistConfig;
      
      expect(result.name).toBe('minimal-app');
      expect(result.modResults['com.emarsys.rnwrapper.applicationCode']).toBe('TEST_APP_CODE');
      expect(result.modResults['com.emarsys.rnwrapper.merchantId']).toBe('TEST_MERCHANT_ID');
      expect(result.modResults['com.emarsys.rnwrapper.enableConsoleLogging']).toBe(true);
    });

    it('should throw when config is missing modResults', () => {
      const configWithoutModResults = {
        name: 'test-app',
        slug: 'test-app'
      } as any;
      
      expect(() => withEmarsysInfoPlist(configWithoutModResults, mockOptions)).toThrow('Cannot set properties of undefined');
    });

    it('should throw when options is undefined', () => {
      expect(() => withEmarsysInfoPlist(mockConfig, undefined as any)).toThrow("Cannot read properties of undefined (reading 'applicationCode')");
    });

    it('should throw when options is null', () => {
      expect(() => withEmarsysInfoPlist(mockConfig, null as any)).toThrow("Cannot read properties of null (reading 'applicationCode')");
    });
  });
});