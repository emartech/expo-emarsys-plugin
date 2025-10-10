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
      enableConsoleLogging: true,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
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
      merchantId: 'MERCHANT456',
      enableConsoleLogging: false,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
    }) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    expect(app['meta-data']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'com.emarsys.rnwrapper.applicationCode',
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
      merchantId: 'MERCHANT456',
      enableConsoleLogging: false,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
    }) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    expect(app['meta-data']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:name': 'com.emarsys.rnwrapper.merchantId',
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

    const result = withEmarsysAndroidManifest(configWithManifest, {
      applicationCode: '',
      merchantId: '',
      enableConsoleLogging: false
    } as EMSOptions) as AndroidManifestConfig;

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
                  'android:name': 'com.emarsys.rnwrapper.applicationCode',
                  'android:value': 'EXISTING123'
                }
              },
              {
                $: {
                  'android:name': 'com.emarsys.rnwrapper.merchantId',
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
      merchantId: 'NEW456',
      enableConsoleLogging: false,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
    }) as AndroidManifestConfig;

    const app = result.modResults.manifest.application[0];
    
    // Should not duplicate existing meta-data
    const applicationCodeEntries = app['meta-data']?.filter(
      (meta: any) => meta.$['android:name'] === 'com.emarsys.rnwrapper.applicationCode'
    );
    const merchantIdEntries = app['meta-data']?.filter(
      (meta: any) => meta.$['android:name'] === 'com.emarsys.rnwrapper.merchantId'
    );
    
    expect(applicationCodeEntries).toHaveLength(1);
    expect(merchantIdEntries).toHaveLength(1);
    
    // Should not duplicate services
    const emarsysServices = app.service?.filter(
      (service: any) => service.$['android:name'] === 'com.emarsys.service.EmarsysFirebaseMessagingService'
    );
    expect(emarsysServices).toHaveLength(1);
  });

  describe('enableConsoleLogging functionality', () => {
    it('should add com.emarsys.rnwrapper.enableConsoleLogging meta-data when enableConsoleLogging is true', () => {
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
        merchantId: 'MERCHANT456',
        enableConsoleLogging: true,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
              'android:value': 'true'
            }
          })
        ])
      );
    });

    it('should not add com.emarsys.rnwrapper.enableConsoleLogging meta-data when enableConsoleLogging is false', () => {
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
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      const enableConsoleLoggingEntries = app['meta-data']?.filter(
        (meta: any) => meta.$['android:name'] === 'com.emarsys.rnwrapper.enableConsoleLogging'
      );
      expect(enableConsoleLoggingEntries || []).toHaveLength(0);
    });

    it('should add com.emarsys.rnwrapper.enableConsoleLogging with all other options', () => {
      const configWithManifest: AndroidManifestConfig = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: [{}]
          }
        }
      };

      const result = withEmarsysAndroidManifest(configWithManifest, {
        applicationCode: 'FULL_TEST',
        merchantId: 'FULL_MERCHANT',
        enableConsoleLogging: true,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.applicationCode',
              'android:value': 'FULL_TEST'
            }
          }),
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.merchantId',
              'android:value': 'FULL_MERCHANT'
            }
          }),
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
              'android:value': 'true'
            }
          })
        ])
      );
    });

    it('should work with only enableConsoleLogging set to true', () => {
      const configWithManifest: AndroidManifestConfig = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: [{}]
          }
        }
      };

      const result = withEmarsysAndroidManifest(configWithManifest, {
        applicationCode: '',
        merchantId: '',
        enableConsoleLogging: true,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual([
        expect.objectContaining({
          $: {
            'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
            'android:value': 'true'
          }
        })
      ]);
    });

    it('should not add any meta-data when all options are false/empty', () => {
      const configWithManifest: AndroidManifestConfig = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: [{}]
          }
        }
      };

      const result = withEmarsysAndroidManifest(configWithManifest, {
        applicationCode: '',
        merchantId: '',
        enableConsoleLogging: false,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      // Should only have the EmarsysFirebaseMessagingService, no meta-data
      expect(app['meta-data']).toBeUndefined();
      expect(app.service).toBeDefined();
    });

    it('should overwrite existing com.emarsys.rnwrapper.enableConsoleLogging when provided', () => {
      const configWithManifest: AndroidManifestConfig = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: [{
              'meta-data': [{
                $: {
                  'android:name': 'com.emarsys.rnwrapper.applicationCode',
                  'android:value': 'OLD_CODE'
                }
              }, {
                $: {
                  'android:name': 'com.emarsys.rnwrapper.merchantId',
                  'android:value': 'OLD_MERCHANT'
                }
              }, {
                $: {
                  'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
                  'android:value': 'false'
                }
              }]
            }]
          }
        }
      };

      const result = withEmarsysAndroidManifest(configWithManifest, {
        applicationCode: 'NEW_CODE',
        merchantId: 'NEW_MERCHANT',
        enableConsoleLogging: true,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.applicationCode',
              'android:value': 'NEW_CODE'
            }
          }),
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.merchantId',
              'android:value': 'NEW_MERCHANT'
            }
          }),
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
              'android:value': 'true'
            }
          })
        ])
      );
    });

    it('should preserve other existing meta-data when adding com.emarsys.rnwrapper.enableConsoleLogging', () => {
      const configWithManifest: AndroidManifestConfig = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: [{
              'meta-data': [{
                $: {
                  'android:name': 'SomeOtherMeta',
                  'android:value': 'SomeValue'
                }
              }]
            }]
          }
        }
      };

      const result = withEmarsysAndroidManifest(configWithManifest, {
        applicationCode: 'TEST_CODE',
        merchantId: 'TEST_MERCHANT',
        enableConsoleLogging: true,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'SomeOtherMeta',
              'android:value': 'SomeValue'
            }
          }),
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.applicationCode',
              'android:value': 'TEST_CODE'
            }
          }),
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.merchantId',
              'android:value': 'TEST_MERCHANT'
            }
          }),
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
              'android:value': 'true'
            }
          })
        ])
      );
    });

    it('should not duplicate com.emarsys.rnwrapper.enableConsoleLogging meta-data entries', () => {
      const configWithManifest: AndroidManifestConfig = {
        ...mockConfig,
        modResults: {
          manifest: {
            application: [{
              'meta-data': [{
                $: {
                  'android:name': 'com.emarsys.rnwrapper.applicationCode',
                  'android:value': 'OLD_CODE'
                }
              }, {
                $: {
                  'android:name': 'com.emarsys.rnwrapper.merchantId',
                  'android:value': 'OLD_MERCHANT'
                }
              }, {
                $: {
                  'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
                  'android:value': 'false'
                }
              }]
            }]
          }
        }
      };

      const result = withEmarsysAndroidManifest(configWithManifest, {
        applicationCode: 'NEW_CODE',
        merchantId: 'NEW_MERCHANT',
        enableConsoleLogging: true,
        iosSharedKeychainAccessGroup: '',
        androidSharedPackageNames: [],
        androidSharedSecret: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      const enableConsoleLoggingEntries = app['meta-data']?.filter(
        (meta: any) => meta.$['android:name'] === 'com.emarsys.rnwrapper.enableConsoleLogging'
      );
      
      // Should not duplicate - only one entry should exist
      expect(enableConsoleLoggingEntries).toHaveLength(1);
      expect(enableConsoleLoggingEntries![0]).toEqual({
        $: {
          'android:name': 'com.emarsys.rnwrapper.enableConsoleLogging',
          'android:value': 'true'
        }
      });
    });
  });

  describe('androidSharedPackageNames functionality', () => {
    it('should add com.emarsys.rnwrapper.sharedPackageNames meta-data when androidSharedPackageNames is provided', () => {
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
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        androidSharedPackageNames: ['com.example.app1', 'com.example.app2'],
        androidSharedSecret: 'secret123',
        iosSharedKeychainAccessGroup: 'group.example'
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.sharedPackageNames',
              'android:value': 'com.example.app1,com.example.app2'
            }
          })
        ])
      );
    });

    it('should add com.emarsys.rnwrapper.sharedSecret meta-data when androidSharedSecret is provided', () => {
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
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        androidSharedPackageNames: ['com.example.app'],
        androidSharedSecret: 'secret123',
        iosSharedKeychainAccessGroup: 'group.example'
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.sharedSecret',
              'android:value': 'secret123'
            }
          })
        ])
      );
    });

    it('should handle single package name in androidSharedPackageNames', () => {
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
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        androidSharedPackageNames: ['com.example.single'],
        androidSharedSecret: 'secret123',
        iosSharedKeychainAccessGroup: 'group.example'
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      expect(app['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'com.emarsys.rnwrapper.sharedPackageNames',
              'android:value': 'com.example.single'
            }
          })
        ])
      );
    });

    it('should not add androidSharedPackageNames meta-data when empty array provided', () => {
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
        merchantId: 'MERCHANT456',
        enableConsoleLogging: false,
        androidSharedPackageNames: [],
        androidSharedSecret: '',
        iosSharedKeychainAccessGroup: ''
      }) as AndroidManifestConfig;

      const app = result.modResults.manifest.application[0];
      const sharedPackageEntries = app['meta-data']?.filter(
        (meta: any) => meta.$['android:name'] === 'com.emarsys.rnwrapper.sharedPackageNames'
      );
      expect(sharedPackageEntries || []).toHaveLength(0);
    });
  });
});