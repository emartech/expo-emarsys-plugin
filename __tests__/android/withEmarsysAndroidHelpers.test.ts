import { addMetaData, addEmarsysMessagingService } from '../../src/android/withEmarsysAndroidHelpers';

describe('withEmarsysAndroidHelpers', () => {
  describe('addMetaData', () => {
    it('should add meta-data to empty application', () => {
      const app: any = {};
      
      addMetaData(app, 'TEST_NAME', 'TEST_VALUE');
      
      expect(app['meta-data']).toHaveLength(1);
      expect(app['meta-data'][0]).toEqual({
        $: {
          'android:name': 'TEST_NAME',
          'android:value': 'TEST_VALUE'
        }
      });
    });

    it('should add meta-data to existing meta-data array', () => {
      const app: any = {
        'meta-data': [
          {
            $: {
              'android:name': 'EXISTING_NAME',
              'android:value': 'EXISTING_VALUE'
            }
          }
        ]
      };
      
      addMetaData(app, 'NEW_NAME', 'NEW_VALUE');
      
      expect(app['meta-data']).toHaveLength(2);
      expect(app['meta-data'][1]).toEqual({
        $: {
          'android:name': 'NEW_NAME',
          'android:value': 'NEW_VALUE'
        }
      });
    });

    it('should not add duplicate meta-data entries', () => {
      const app: any = {
        'meta-data': [
          {
            $: {
              'android:name': 'EXISTING_NAME',
              'android:value': 'EXISTING_VALUE'
            }
          }
        ]
      };
      
      // Try to add the same name again
      addMetaData(app, 'EXISTING_NAME', 'NEW_VALUE');
      
      expect(app['meta-data']).toHaveLength(1);
      expect(app['meta-data'][0]).toEqual({
        $: {
          'android:name': 'EXISTING_NAME',
          'android:value': 'EXISTING_VALUE'
        }
      });
    });

    it('should handle malformed meta-data entries gracefully', () => {
      const app: any = {
        'meta-data': [
          { /* malformed entry without $ property */ },
          {
            $: {
              'android:name': 'VALID_NAME',
              'android:value': 'VALID_VALUE'
            }
          }
        ]
      };
      
      addMetaData(app, 'NEW_NAME', 'NEW_VALUE');
      
      expect(app['meta-data']).toHaveLength(3);
      expect(app['meta-data'][2]).toEqual({
        $: {
          'android:name': 'NEW_NAME',
          'android:value': 'NEW_VALUE'
        }
      });
    });

    it('should add EMSApplicationCode correctly', () => {
      const app: any = {};
      
      addMetaData(app, 'EMSApplicationCode', 'TEST123');
      
      expect(app['meta-data'][0].$['android:name']).toBe('EMSApplicationCode');
      expect(app['meta-data'][0].$['android:value']).toBe('TEST123');
    });

    it('should add EMSMerchantId correctly', () => {
      const app: any = {};
      
      addMetaData(app, 'EMSMerchantId', 'MERCHANT456');
      
      expect(app['meta-data'][0].$['android:name']).toBe('EMSMerchantId');
      expect(app['meta-data'][0].$['android:value']).toBe('MERCHANT456');
    });
  });

  describe('addEmarsysMessagingService', () => {
    it('should add Emarsys messaging service to empty application', () => {
      const app: any = {};
      
      addEmarsysMessagingService(app);
      
      expect(app.service).toHaveLength(1);
      expect(app.service[0]).toEqual({
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
      });
    });

    it('should add service to existing services array', () => {
      const app: any = {
        service: [
          {
            $: {
              'android:name': 'com.example.ExistingService',
              'android:exported': 'true'
            }
          }
        ]
      };
      
      addEmarsysMessagingService(app);
      
      expect(app.service).toHaveLength(2);
      expect(app.service[1].$['android:name']).toBe('com.emarsys.service.EmarsysFirebaseMessagingService');
    });

    it('should not add duplicate Emarsys messaging service', () => {
      const app: any = {
        service: [
          {
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
          }
        ]
      };
      
      addEmarsysMessagingService(app);
      
      expect(app.service).toHaveLength(1);
    });

    it('should not add service if MESSAGING_EVENT intent filter already exists', () => {
      const app: any = {
        service: [
          {
            $: {
              'android:name': 'com.example.SomeOtherService',
              'android:exported': 'true'
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
          }
        ]
      };
      
      addEmarsysMessagingService(app);
      
      expect(app.service).toHaveLength(1);
      expect(app.service[0].$['android:name']).toBe('com.example.SomeOtherService');
    });

    it('should handle services with malformed intent filters', () => {
      const app: any = {
        service: [
          {
            $: {
              'android:name': 'com.example.MalformedService',
              'android:exported': 'true'
            },
            'intent-filter': [
              {
                // Missing action array
              }
            ]
          }
        ]
      };
      
      addEmarsysMessagingService(app);
      
      expect(app.service).toHaveLength(2);
      expect(app.service[1].$['android:name']).toBe('com.emarsys.service.EmarsysFirebaseMessagingService');
    });

    it('should handle services with malformed actions', () => {
      const app: any = {
        service: [
          {
            $: {
              'android:name': 'com.example.MalformedService',
              'android:exported': 'true'
            },
            'intent-filter': [
              {
                action: [
                  {
                    // Missing $ property
                    'android:name': 'com.google.firebase.MESSAGING_EVENT'
                  }
                ]
              }
            ]
          }
        ]
      };
      
      addEmarsysMessagingService(app);
      
      expect(app.service).toHaveLength(2);
      expect(app.service[1].$['android:name']).toBe('com.emarsys.service.EmarsysFirebaseMessagingService');
    });

    it('should create service array if it does not exist', () => {
      const app: any = {};
      
      addEmarsysMessagingService(app);
      
      expect(Array.isArray(app.service)).toBe(true);
      expect(app.service).toHaveLength(1);
    });
  });
});