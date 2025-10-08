import ExpoModulesCore
import EmarsysSDK
import RNEmarsysWrapper

public class AppDelegateSubscriber: ExpoAppDelegateSubscriber {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    let config = EMSConfig.make { build in
      if let applicationCode = StorageUtil.string(forKey: "applicationCode", withInfoPListFallback: true), applicationCode != "" {
        build.setMobileEngageApplicationCode(applicationCode)
      }
      if let merchantId = StorageUtil.string(forKey: "merchantId", withInfoPListFallback: true), merchantId != "" {
        build.setMerchantId(merchantId)
      }
      build.enableConsoleLogLevels([EMSLogLevel.basic, EMSLogLevel.error, EMSLogLevel.info, EMSLogLevel.debug])
    }
    Emarsys.setup(config: config)

    UNUserNotificationCenter.current().delegate = Emarsys.push
    let rnEmarsysEventHandler = RNEmarsysEventHandler()
    rnEmarsysEventHandler.setEventHandlers()

    return true
  }

  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Emarsys.push.setPushToken(deviceToken)
  }
}
