// Reexport the native module. On web, it will be resolved to ExpoEmarsysPluginModule.web.ts
// and on native platforms to ExpoEmarsysPluginModule.ts
export { default } from './ExpoEmarsysPluginModule';
export { default as ExpoEmarsysPluginView } from './ExpoEmarsysPluginView';
export * from  './ExpoEmarsysPlugin.types';
