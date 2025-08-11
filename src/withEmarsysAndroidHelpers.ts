export function addMetaData(
  app: any,
  name: string,
  value: string
) {
  if (!app['meta-data']) {
    app['meta-data'] = [];
  }
  if (!app['meta-data'].some((item: any) => item.$ && item.$['android:name'] === name)) {
    app['meta-data'].push({
      $: {
        'android:name': name,
        'android:value': value,
      },
    });
  }
}

export function addEmarsysMessagingService(app: any) {
  const SERVICE_NAME = "com.emarsys.service.EmarsysFirebaseMessagingService";
  const MESSAGING_EVENT = "com.google.firebase.MESSAGING_EVENT";
  app.service = app.service || [];
  const hasEmarsysMessagingService = app.service.some(
    (srv: any) => srv.$['android:name'] === SERVICE_NAME
  );

  const hasMessagingEventIntentFilter = app.service.some(
    (srv: any) => srv['intent-filter'] &&
      srv['intent-filter'].some((filter: any) =>
        filter.action &&
        filter.action.some((action: any) =>
          action.$ && action.$['android:name'] === MESSAGING_EVENT
        )
      )
  );

  if (!hasEmarsysMessagingService && !hasMessagingEventIntentFilter) {
    app.service.push({
      $: {
        'android:name': SERVICE_NAME,
        'android:exported': 'false',
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': MESSAGING_EVENT,
              },
            },
          ],
        },
      ],
    });
  }
}
