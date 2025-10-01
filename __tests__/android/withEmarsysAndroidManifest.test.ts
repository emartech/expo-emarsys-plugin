import { ExpoConfig } from 'expo/config';
import { EMSOptions } from '../../src/types';
import { withEmarsysAndroidManifest } from '../../src/android/withEmarsysAndroidManifest';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withAndroidManifest: jest.fn((config, modifyFunction) => {
    return modifyFunction(config);
  }),
}));

describe('withEmarsysAndroidManifest', () => {
  let mockConfig: ExpoConfig;
  let mockOptions: EMSOptions;

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
    };
    mockOptions = {
      applicationCode: 'TEST_APP_CODE',
      merchantId: 'TEST_MERCHANT_ID',
    };
    jest.clearAllMocks();
  });

  type AndroidManifestConfig = ExpoConfig & {
    modResults: {
      manifest: {
        application: Array<{
          'meta-data'?: Array<{
            $: {
              'android:name': string;
              'android:value': string;
            };
          }>;
          service?: Array<{
            $: {
              'android:name': string;
              'android:exported': string;
            };
            'intent-filter'?: Array<{
              action: Array<{
                $: {
                  'android:name': string;
                };
              }>;
            }>;
          }>;
        }>;
      };
    };
  };

  it('should add applicationCode meta-data when provided', () => {
    const configWithManifest: AndroidManifestConfig = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: [{}]
        }
      }
    };

    const result = withEmarsysAndroidManifest(configWithManifest, {
      applicationCode: 'TEST123',
      merchantId: 'MERCHANT456'
    }) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    expect(app['meta-data']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'EMSApplicationCode',
            'android:value': 'TEST123'
          }
        })
      ])
    );
  });

  it('should add merchantId meta-data when provided', () => {
    const configWithManifest: AndroidManifestConfig = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: [{}]
        }
      }
    };

    const result = withEmarsysAndroidManifest(configWithManifest, {
      applicationCode: 'TEST123',
      merchantId: 'MERCHANT456'
    }) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    expect(app['meta-data']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'EMSMerchantId',
            'android:value': 'MERCHANT456'
          }
        })
      ])
    );
  });

  it('should add Emarsys messaging service', () => {
    const configWithManifest: AndroidManifestConfig = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: [{}]
        }
      }
    };

    const result = withEmarsysAndroidManifest(configWithManifest, mockOptions) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    expect(app.service).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'com.emarsys.service.EmarsysFirebaseMessagingService',
            'android:exported': 'false'
          },
          'intent-filter': [
            {
              action: [
                {
                  $: {
                    'android:name': 'com.google.firebase.MESSAGING_EVENT'
                  }
                }
              ]
            }
          ]
        })
      ])
    );
  });

  it('should handle empty options gracefully', () => {
    const configWithManifest: AndroidManifestConfig = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: [{}]
        }
      }
    };

    const result = withEmarsysAndroidManifest(configWithManifest, {} as EMSOptions) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    // Should still add the messaging service even with empty options
    expect(app.service).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'com.emarsys.service.EmarsysFirebaseMessagingService',
            'android:exported': 'false'
          }
        })
      ])
    );
  });

  it('should preserve existing manifest content', () => {
    const configWithManifest: AndroidManifestConfig = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: [{
            'meta-data': [{
              $: {
                'android:name': 'existing.meta.data',
                'android:value': 'existing-value'
              }
            }],
            service: [{
              $: {
                'android:name': 'com.existing.service.ExistingService',
                'android:exported': 'true'
              }
            }]
          }]
        }
      }
    };

    const result = withEmarsysAndroidManifest(configWithManifest, mockOptions) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    
    // Should preserve existing meta-data
    expect(app['meta-data']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'existing.meta.data',
            'android:value': 'existing-value'
          }
        })
      ])
    );

    // Should preserve existing services
    expect(app.service).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'com.existing.service.ExistingService',
            'android:exported': 'true'
          }
        })
      ])
    );
  });

  it('should throw error when no application element exists', () => {
    const configWithInvalidManifest = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: []
        }
      }
    };

    expect(() => {
      withEmarsysAndroidManifest(configWithInvalidManifest, mockOptions);
    }).toThrow('AndroidManifest.xml does not contain an <application> element.');
  });

  it('should throw error when application is not an array', () => {
    const configWithInvalidManifest = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: null
        }
      }
    };

    expect(() => {
      withEmarsysAndroidManifest(configWithInvalidManifest, mockOptions);
    }).toThrow('AndroidManifest.xml does not contain an <application> element.');
  });

  it('should not duplicate meta-data or services when already present', () => {
    const configWithManifest: AndroidManifestConfig = {
      ...mockConfig,
      modResults: {
        manifest: {
          application: [{
            'meta-data': [
              {
                $: {
                  'android:name': 'EMSApplicationCode',
                  'android:value': 'EXISTING123'
                }
              },
              {
                $: {
                  'android:name': 'EMSMerchantId',
                  'android:value': 'EXISTING456'
                }
              }
            ],
            service: [{
              $: {
                'android:name': 'com.emarsys.service.EmarsysFirebaseMessagingService',
                'android:exported': 'false'
              },
              'intent-filter': [{
                action: [{
                  $: {
                    'android:name': 'com.google.firebase.MESSAGING_EVENT'
                  }
                }]
              }]
            }]
          }]
        }
      }
    };

    const result = withEmarsysAndroidManifest(configWithManifest, {
      applicationCode: 'NEW123',
      merchantId: 'NEW456'
    }) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    
    // Should not duplicate existing meta-data
    const applicationCodeEntries = app['meta-data']?.filter(
      (meta: any) => meta.$['android:name'] === 'EMSApplicationCode'
    );
    const merchantIdEntries = app['meta-data']?.filter(
      (meta: any) => meta.$['android:name'] === 'EMSMerchantId'
    );
    
    expect(applicationCodeEntries).toHaveLength(1);
    expect(merchantIdEntries).toHaveLength(1);
    
    // Should not duplicate services
    const emarsysServices = app.service?.filter(
      (service: any) => service.$['android:name'] === 'com.emarsys.service.EmarsysFirebaseMessagingService'
    );
    expect(emarsysServices).toHaveLength(1);
  });
});