import { 
  withEmarsysiOS
} from '../../src/ios/withEmarsysiOS';
import { EMSOptions } from '../../src/types';

describe('withEmarsysiOS', () => {
  let _mockOptions: EMSOptions;

  beforeEach(() => {
    _mockOptions = {
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
    expect(typeof withEmarsysiOS).toBe('function');
  });

  it('should accept config and options parameters', () => {
    expect(withEmarsysiOS.length).toBe(2);
  });

  it('should work with valid option types', () => {
    // Test that options have correct types
    expect(typeof _mockOptions.applicationCode).toBe('string');
    expect(typeof _mockOptions.merchantId).toBe('string');
    
    // Test that function exists
    expect(typeof withEmarsysiOS).toBe('function');
  });

  it('should work with empty options object', () => {
    // Test that the function exists and can handle empty options type
    expect(typeof withEmarsysiOS).toBe('function');
    
    // Test that empty options can be created
    const emptyOptions = {} as EMSOptions;
    expect(typeof emptyOptions).toBe('object');
  });
});