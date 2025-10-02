import { ExpoConfig } from 'expo/config';
import { withEmarsysPodfileConfig } from '../../src/ios/withEmarsysPodfileConfig';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withPodfileProperties: jest.fn((config, modifyFunction) => {
    return modifyFunction({
      modResults: config.modResults || {},
      ...config,
    });
  }),
}));

describe('withEmarsysPodfileConfig', () => {
  type PodfilePropertiesConfig = ExpoConfig & {
    modResults: {
      [key: string]: any;
      'ios.useFrameworks'?: string;
      'ios.deploymentTarget'?: string;
    };
  };

  let mockConfig: PodfilePropertiesConfig;

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
      modResults: {},
    } as PodfilePropertiesConfig;

    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof withEmarsysPodfileConfig).toBe('function');
  });

  it('should accept only one config parameter', () => {
    expect(withEmarsysPodfileConfig.length).toBe(1);
  });

  describe('Podfile properties modifications', () => {
    it('should set ios.useFrameworks to static', () => {
      const result = withEmarsysPodfileConfig(mockConfig) as PodfilePropertiesConfig;

      expect(result.modResults['ios.useFrameworks']).toBe('static');
    });

    it('should set ios.deploymentTarget to 15.1', () => {
      const result = withEmarsysPodfileConfig(mockConfig) as PodfilePropertiesConfig;

      expect(result.modResults['ios.deploymentTarget']).toBe('15.1');
    });

    it('should set both properties when config is processed', () => {
      const result = withEmarsysPodfileConfig(mockConfig) as PodfilePropertiesConfig;

      expect(result.modResults['ios.useFrameworks']).toBe('static');
      expect(result.modResults['ios.deploymentTarget']).toBe('15.1');
    });

    it('should preserve existing modResults properties', () => {
      const configWithExistingData: PodfilePropertiesConfig = {
        ...mockConfig,
        modResults: {
          'existing.property': 'existingValue',
          'another.setting': 'anotherValue'
        }
      };

      const result = withEmarsysPodfileConfig(configWithExistingData) as PodfilePropertiesConfig;

      expect(result.modResults['existing.property']).toBe('existingValue');
      expect(result.modResults['another.setting']).toBe('anotherValue');
      expect(result.modResults['ios.useFrameworks']).toBe('static');
      expect(result.modResults['ios.deploymentTarget']).toBe('15.1');
    });

    it('should overwrite existing ios.useFrameworks property', () => {
      const configWithExistingFrameworks: PodfilePropertiesConfig = {
        ...mockConfig,
        modResults: {
          'ios.useFrameworks': 'dynamic',
          'ios.deploymentTarget': '14.0'
        }
      };

      const result = withEmarsysPodfileConfig(configWithExistingFrameworks) as PodfilePropertiesConfig;

      expect(result.modResults['ios.useFrameworks']).toBe('static');
      expect(result.modResults['ios.deploymentTarget']).toBe('15.1');
    });

    it('should overwrite existing ios.deploymentTarget property', () => {
      const configWithExistingTarget: PodfilePropertiesConfig = {
        ...mockConfig,
        modResults: {
          'ios.deploymentTarget': '12.0',
          'some.other.property': 'value'
        }
      };

      const result = withEmarsysPodfileConfig(configWithExistingTarget) as PodfilePropertiesConfig;

      expect(result.modResults['ios.deploymentTarget']).toBe('15.1');
      expect(result.modResults['ios.useFrameworks']).toBe('static');
      expect(result.modResults['some.other.property']).toBe('value');
    });

    it('should work with empty modResults', () => {
      const configWithEmptyModResults: PodfilePropertiesConfig = {
        ...mockConfig,
        modResults: {}
      };

      const result = withEmarsysPodfileConfig(configWithEmptyModResults) as PodfilePropertiesConfig;

      expect(result.modResults['ios.useFrameworks']).toBe('static');
      expect(result.modResults['ios.deploymentTarget']).toBe('15.1');
    });

    it('should work with undefined modResults', () => {
      const configWithoutModResults = {
        name: 'test-app',
        slug: 'test-app'
      } as ExpoConfig;

      const result = withEmarsysPodfileConfig(configWithoutModResults) as PodfilePropertiesConfig;

      expect(result.modResults['ios.useFrameworks']).toBe('static');
      expect(result.modResults['ios.deploymentTarget']).toBe('15.1');
    });
  });

  describe('config handling', () => {
    it('should return the config object', () => {
      const result = withEmarsysPodfileConfig(mockConfig);
      
      expect(result.name).toBe('test-app');
      expect(result.slug).toBe('test-app');
    });

    it('should preserve all original config properties', () => {
      const complexConfig = {
        name: 'complex-app',
        slug: 'complex-app',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        },
        updates: {
          fallbackToCacheTimeout: 0
        },
        assetBundlePatterns: [
          '**/*'
        ],
        ios: {
          supportsTablet: true
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#FFFFFF'
          }
        },
        web: {
          favicon: './assets/favicon.png'
        },
        modResults: {
          'existing.property': 'value'
        }
      } as any;

      const result = withEmarsysPodfileConfig(complexConfig);

      expect(result.name).toBe('complex-app');
      expect(result.version).toBe('1.0.0');
      expect(result.orientation).toBe('portrait');
      expect(result.icon).toBe('./assets/icon.png');
      expect(result.splash).toEqual({
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      });
      expect(result.updates).toEqual({
        fallbackToCacheTimeout: 0
      });
      expect(result.assetBundlePatterns).toEqual(['**/*']);
      expect(result.ios).toEqual({
        supportsTablet: true
      });
      expect(result.android).toEqual({
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#FFFFFF'
        }
      });
      expect(result.web).toEqual({
        favicon: './assets/favicon.png'
      });
      expect((result as any).modResults['existing.property']).toBe('value');
      expect((result as any).modResults['ios.useFrameworks']).toBe('static');
      expect((result as any).modResults['ios.deploymentTarget']).toBe('15.1');
    });

    it('should work with minimal config', () => {
      const minimalConfig: ExpoConfig = {
        name: 'minimal-app',
        slug: 'minimal-app'
      };
      
      const result = withEmarsysPodfileConfig(minimalConfig);
      
      expect(result.name).toBe('minimal-app');
      expect(result.slug).toBe('minimal-app');
      expect((result as any).modResults['ios.useFrameworks']).toBe('static');
      expect((result as any).modResults['ios.deploymentTarget']).toBe('15.1');
    });
  });
});