export type EMSOptions = {
  applicationCode: string;
  merchantId: string;
  enableConsoleLogging: boolean;
  androidSharedPackageNames: string[];
  androidSharedSecret: string;
  iosSharedKeychainAccessGroup: string;
};
