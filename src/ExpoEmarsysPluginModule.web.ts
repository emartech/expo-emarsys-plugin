import { registerWebModule, NativeModule } from 'expo';

import { ExpoEmarsysPluginModuleEvents } from './ExpoEmarsysPlugin.types';

class ExpoEmarsysPluginModule extends NativeModule<ExpoEmarsysPluginModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoEmarsysPluginModule, 'ExpoEmarsysPluginModule');
