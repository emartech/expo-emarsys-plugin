import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoEmarsysPluginViewProps } from './ExpoEmarsysPlugin.types';

const NativeView: React.ComponentType<ExpoEmarsysPluginViewProps> =
  requireNativeView('ExpoEmarsysPlugin');

export default function ExpoEmarsysPluginView(props: ExpoEmarsysPluginViewProps) {
  return <NativeView {...props} />;
}
