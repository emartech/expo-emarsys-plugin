# Expo Emarsys Plugin

> **Important**  
> This plugin is in Pilot release. Please contact your Client Success Manager before starting the implementation.

The Expo Emarsys Plugin automatically integrates the **Emarsys SDK** into your Expo app’s native modules.  
It works **alongside the [React Native Emarsys Wrapper](https://github.com/emartech/react-native-emarsys-sdk/wiki)**, which provides the full API for interacting with Emarsys features.

---

## Installation

```bash
npm install "git+ssh://git@github.com/emartech/expo-emarsys-plugin.git#<version>" --save
```

---

## Configuration

1. Add the plugin to your `app.json` with your own values:

```json
{
  "expo": {
    ...
    "plugins": [
      [
        "expo-emarsys-plugin",
        {
          "applicationCode": <APPLICATION_CODE>,
          "merchantId": <MERCHANT_ID>
        }
      ]
    ]
    ...
  }
}
```

2. Add your `google-services.json` file into the app’s assets folder.
3. *(Optional)* Provide a custom Android **push notification icon**:  
   - Place an image named **`mobile_engage_logo_icon.jpg`** inside the app’s `assets` folder.  
   - During build, it will be copied into the correct Android resources directory (`res/drawable`).  

---

## Build

Run prebuild to apply the changes:

```bash
npx expo prebuild
```

## Next Steps

1. Install the **React Native Emarsys Wrapper** following the setup guide: [React Native Emarsys SDK – Setup](https://github.com/emartech/react-native-emarsys-sdk?tab=readme-ov-file#setup)

2. Continue with the wrapper’s [documentation](https://github.com/emartech/react-native-emarsys-sdk/wiki#2-set-contact).
