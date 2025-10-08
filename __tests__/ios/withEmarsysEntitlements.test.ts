import { ExpoConfig } from 'expo/config';
import { withEmarsysEntitlements } from '../../src/ios/withEmarsysEntitlements';
import { EMSOptions } from '../../src/types';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withEntitlementsPlist: jest.fn((config, modifyFunction) => {
    return modifyFunction(config);
  }),
}));

describe('withEmarsysEntitlements', () => {
  type EntitlementsConfig = ExpoConfig & {
    modResults: {
      [key: string]: any;
      'keychain-access-groups'?: string[];
    };
  };

  let mockConfig: EntitlementsConfig;
  let mockOptions: EMSOptions;

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
      modResults: {},
    } as EntitlementsConfig;
    
    mockOptions = {
      applicationCode: 'TEST_APP_CODE',
      merchantId: 'TEST_MERCHANT_ID',
      enableConsoleLogging: true,
      androidSharedPackageNames: [],
      androidSharedSecret: '',
      iosSharedKeychainAccessGroup: '4J5FXBB97U.com.ems.EmarsysShared'
    };

    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof withEmarsysEntitlements).toBe('function');
  });

  it('should accept config and options parameters', () => {
    expect(withEmarsysEntitlements.length).toBe(2);
  });

  describe('keychain access groups functionality', () => {
    it('should add keychain-access-groups when iosSharedKeychainAccessGroup is provided', () => {
      const result = withEmarsysEntitlements(mockConfig, mockOptions) as EntitlementsConfig;

      expect(result.modResults['keychain-access-groups']).toEqual(['4J5FXBB97U.com.ems.EmarsysShared']);
    });

    it('should not duplicate keychain access groups', () => {
      // Pre-populate with the same group
      mockConfig.modResults['keychain-access-groups'] = ['4J5FXBB97U.com.ems.EmarsysShared'];

      const result = withEmarsysEntitlements(mockConfig, mockOptions) as EntitlementsConfig;

      expect(result.modResults['keychain-access-groups']).toEqual(['4J5FXBB97U.com.ems.EmarsysShared']);
      expect(result.modResults['keychain-access-groups']).toHaveLength(1);
    });

    it('should add to existing keychain access groups', () => {
      // Pre-populate with a different group
      mockConfig.modResults['keychain-access-groups'] = ['existing.keychain.group'];

      const result = withEmarsysEntitlements(mockConfig, mockOptions) as EntitlementsConfig;

      expect(result.modResults['keychain-access-groups']).toEqual([
        'existing.keychain.group',
        '4J5FXBB97U.com.ems.EmarsysShared'
      ]);
      expect(result.modResults['keychain-access-groups']).toHaveLength(2);
    });

    it('should not add keychain-access-groups when iosSharedKeychainAccessGroup is not provided', () => {
      const optionsWithoutKeychain = {
        ...mockOptions,
        iosSharedKeychainAccessGroup: ''
      };

      const result = withEmarsysEntitlements(mockConfig, optionsWithoutKeychain) as EntitlementsConfig;

      expect(result.modResults['keychain-access-groups']).toBeUndefined();
    });

    it('should not add keychain-access-groups when iosSharedKeychainAccessGroup is empty string', () => {
      const optionsWithEmptyKeychain = {
        ...mockOptions,
        iosSharedKeychainAccessGroup: ''
      };

      const result = withEmarsysEntitlements(mockConfig, optionsWithEmptyKeychain) as EntitlementsConfig;

      expect(result.modResults['keychain-access-groups']).toBeUndefined();
    });

    it('should preserve other existing entitlements', () => {
      // Add some existing entitlements
      mockConfig.modResults['aps-environment'] = 'development';
      mockConfig.modResults['com.apple.developer.associated-domains'] = ['applinks:example.com'];

      const result = withEmarsysEntitlements(mockConfig, mockOptions) as EntitlementsConfig;

      expect(result.modResults['aps-environment']).toBe('development');
      expect(result.modResults['com.apple.developer.associated-domains']).toEqual(['applinks:example.com']);
      expect(result.modResults['keychain-access-groups']).toEqual(['4J5FXBB97U.com.ems.EmarsysShared']);
    });
  });
});