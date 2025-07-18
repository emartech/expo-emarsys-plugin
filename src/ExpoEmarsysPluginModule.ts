import { NativeModule, requireNativeModule } from 'expo';

import { ExpoEmarsysPluginModuleEvents } from './ExpoEmarsysPlugin.types';

declare class ExpoEmarsysPluginModule extends NativeModule<ExpoEmarsysPluginModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoEmarsysPluginModule>('ExpoEmarsysPlugin');
