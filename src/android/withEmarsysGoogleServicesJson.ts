import {
  ConfigPlugin,
  withDangerousMod
} from 'expo/config-plugins';


export const withEmarsysGoogleServicesJson: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const fs = require('fs');
      const path = require('path');
      const projectRoot = config.modRequest.projectRoot;
      const source = path.join(projectRoot, 'assets', 'google-services.json');
      const dest = path.join(projectRoot, 'android', 'app', 'google-services.json');

      if (!fs.existsSync(source)) {
        throw new Error(
          `google-services.json not found in assets. Please put your file at: ${source}`
        );
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });

      fs.copyFileSync(source, dest);
      console.log(`Copied google-services.json to ${dest}`);

      return config;
    },
  ]);
};
