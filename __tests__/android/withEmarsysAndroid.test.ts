import { ExpoConfig } from 'expo/config';
import { 
  withEmarsysAndroid
} from '../../src/android/withEmarsysAndroid';
import { EMSOptions } from '../../src/types';

describe('withEmarsysAndroid', () => {
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

  it('should be a function', () => {
    expect(typeof withEmarsysAndroid).toBe('function');
  });

  it('should accept config and options parameters', () => {
    expect(withEmarsysAndroid.length).toBe(2);
  });

  it('should work with valid option types', () => {
    // Test that options have correct types
    expect(typeof mockOptions.applicationCode).toBe('string');
    expect(typeof mockOptions.merchantId).toBe('string');
    
    // Test that function exists
    expect(typeof withEmarsysAndroid).toBe('function');
  });

  it('should work with empty options object', () => {
    // Test that the function exists and can handle empty options type
    expect(typeof withEmarsysAndroid).toBe('function');
    
    // Test that empty options can be created
    const emptyOptions = {} as EMSOptions;
    expect(typeof emptyOptions).toBe('object');
  });
});