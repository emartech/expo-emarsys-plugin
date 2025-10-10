import { ExpoConfig } from 'expo/config';
import { withEmarsysGoogleServicesJson } from '../../src/android/withEmarsysGoogleServicesJson';

// Mock the expo/config-plugins module
jest.mock('expo/config-plugins', () => ({
  withDangerousMod: jest.fn((config, modConfig) => {
    // Execute the dangerous mod function for testing
    const [platform, modFunction] = modConfig;
    if (platform === 'android' && typeof modFunction === 'function') {
      return modFunction(config);
    }
    return config;
  }),
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

// Mock console.log to verify logging
const mockConsoleLog = jest.fn();
global.console = {
  ...global.console,
  log: mockConsoleLog,
};

// Type for config with modRequest
type ConfigWithModRequest = ExpoConfig & {
  modRequest: {
    projectRoot: string;
  };
};

describe('withGoogleServicesJson', () => {
  let mockConfig: ConfigWithModRequest;

  beforeEach(() => {
    mockConfig = {
      name: 'test-app',
      slug: 'test-app',
      modRequest: {
        projectRoot: '/test/project'
      }
    };
    jest.clearAllMocks();
    
    // Reset all mocks to default behavior
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.copyFileSync.mockImplementation(() => {});
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.dirname.mockImplementation((filePath) => filePath.split('/').slice(0, -1).join('/'));
  });

  it('should be a function', () => {
    expect(typeof withEmarsysGoogleServicesJson).toBe('function');
  });

  it('should accept only config parameter', () => {
    expect(withEmarsysGoogleServicesJson.length).toBe(1);
  });

  it('should copy google-services.json when source file exists', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockPath.join
      .mockReturnValueOnce('/test/project/assets/google-services.json') // source path
      .mockReturnValueOnce('/test/project/android/app/google-services.json'); // dest path
    mockPath.dirname.mockReturnValue('/test/project/android/app');

    const result = await withEmarsysGoogleServicesJson(mockConfig);

    expect(mockFs.existsSync).toHaveBeenCalledWith('/test/project/assets/google-services.json');
    expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/project/android/app', { recursive: true });
    expect(mockFs.copyFileSync).toHaveBeenCalledWith(
      '/test/project/assets/google-services.json',
      '/test/project/android/app/google-services.json'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith('Copied google-services.json to /test/project/android/app/google-services.json');
    expect(result).toBe(mockConfig);
  });

  it('should throw error when google-services.json does not exist in assets', async () => {
    mockFs.existsSync.mockReturnValue(false);
    mockPath.join.mockReturnValueOnce('/test/project/assets/google-services.json');

    await expect(async () => {
      await withEmarsysGoogleServicesJson(mockConfig);
    }).rejects.toThrow('google-services.json not found in assets. Please put your file at: /test/project/assets/google-services.json');

    expect(mockFs.existsSync).toHaveBeenCalledWith('/test/project/assets/google-services.json');
    expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    expect(mockFs.copyFileSync).not.toHaveBeenCalled();
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('should create destination directory recursively', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockPath.join
      .mockReturnValueOnce('/test/project/assets/google-services.json')
      .mockReturnValueOnce('/test/project/android/app/google-services.json');
    mockPath.dirname.mockReturnValue('/test/project/android/app');

    await withEmarsysGoogleServicesJson(mockConfig);

    expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/project/android/app', { recursive: true });
  });

  it('should handle different project root paths', async () => {
    const configWithDifferentRoot: ConfigWithModRequest = {
      ...mockConfig,
      modRequest: {
        projectRoot: '/different/project/path'
      }
    };

    mockFs.existsSync.mockReturnValue(true);
    mockPath.join
      .mockReturnValueOnce('/different/project/path/assets/google-services.json')
      .mockReturnValueOnce('/different/project/path/android/app/google-services.json');
    mockPath.dirname.mockReturnValue('/different/project/path/android/app');

    await withEmarsysGoogleServicesJson(configWithDifferentRoot);

    expect(mockPath.join).toHaveBeenCalledWith('/different/project/path', 'assets', 'google-services.json');
    expect(mockPath.join).toHaveBeenCalledWith('/different/project/path', 'android', 'app', 'google-services.json');
    expect(mockFs.copyFileSync).toHaveBeenCalledWith(
      '/different/project/path/assets/google-services.json',
      '/different/project/path/android/app/google-services.json'
    );
  });

  it('should use correct file paths', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockPath.join
      .mockReturnValueOnce('/test/project/assets/google-services.json')
      .mockReturnValueOnce('/test/project/android/app/google-services.json');

    await withEmarsysGoogleServicesJson(mockConfig);

    expect(mockPath.join).toHaveBeenCalledWith('/test/project', 'assets', 'google-services.json');
    expect(mockPath.join).toHaveBeenCalledWith('/test/project', 'android', 'app', 'google-services.json');
  });

  it('should return the same config object', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockPath.join
      .mockReturnValueOnce('/test/project/assets/google-services.json')
      .mockReturnValueOnce('/test/project/android/app/google-services.json');
    mockPath.dirname.mockReturnValue('/test/project/android/app');

    const result = await withEmarsysGoogleServicesJson(mockConfig);

    expect(result).toBe(mockConfig);
    expect(result.name).toBe('test-app');
    expect(result.slug).toBe('test-app');
  });

  it('should handle missing modRequest gracefully', async () => {
    const configWithoutModRequest = {
      name: 'test-app',
      slug: 'test-app'
    };

    // This should fail when trying to access config.modRequest.projectRoot
    await expect(async () => {
      await withEmarsysGoogleServicesJson(configWithoutModRequest);
    }).rejects.toThrow('Cannot read properties of undefined (reading \'projectRoot\')');
  });

  describe('Error scenarios', () => {
    it('should provide clear error message with exact file path', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockPath.join.mockReturnValueOnce('/custom/path/assets/google-services.json'); // First call for source path

      const customConfig: ConfigWithModRequest = {
        ...mockConfig,
        modRequest: {
          projectRoot: '/custom/path'
        }
      };

      await expect(async () => {
        await withEmarsysGoogleServicesJson(customConfig);
      }).rejects.toThrow('google-services.json not found in assets. Please put your file at: /custom/path/assets/google-services.json');
    });

    it('should handle file system errors during copy', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.copyFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/google-services.json')
        .mockReturnValueOnce('/test/project/android/app/google-services.json');
      mockPath.dirname.mockReturnValue('/test/project/android/app');

      await expect(async () => {
        await withEmarsysGoogleServicesJson(mockConfig);
      }).rejects.toThrow('Permission denied');
    });

    it('should handle file system errors during directory creation', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Cannot create directory');
      });
      mockPath.join
        .mockReturnValueOnce('/test/project/assets/google-services.json')
        .mockReturnValueOnce('/test/project/android/app/google-services.json');
      mockPath.dirname.mockReturnValue('/test/project/android/app');

      await expect(async () => {
        await withEmarsysGoogleServicesJson(mockConfig);
      }).rejects.toThrow('Cannot create directory');
    });
  });

  describe('Integration with withDangerousMod', () => {
    it('should call withDangerousMod with android platform', () => {
      const { withDangerousMod } = require('expo/config-plugins');
      
      withEmarsysGoogleServicesJson(mockConfig);

      expect(withDangerousMod).toHaveBeenCalledWith(mockConfig, ['android', expect.any(Function)]);
    });

    it('should be a ConfigPlugin', () => {
      // Test that it's a proper ConfigPlugin by checking its signature
      expect(typeof withEmarsysGoogleServicesJson).toBe('function');
      expect(withEmarsysGoogleServicesJson.length).toBe(1);
    });
  });
});