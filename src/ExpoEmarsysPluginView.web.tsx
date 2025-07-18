import * as React from 'react';

import { ExpoEmarsysPluginViewProps } from './ExpoEmarsysPlugin.types';

export default function ExpoEmarsysPluginView(props: ExpoEmarsysPluginViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
