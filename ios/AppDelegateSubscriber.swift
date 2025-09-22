import ExpoModulesCore
import EmarsysSDK
import RNEmarsysWrapper

public class AppDelegateSubscriber: ExpoAppDelegateSubscriber {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {

    let infoPList = Bundle.main.infoDictionary
    let config = EMSConfig.make { build in
      if let applicationCode = StorageUtil.string(forKey: "EMSApplicationCode", withInfoPListFallback: true), applicationCode != "" {
        build.setMobileEngageApplicationCode(applicationCode)
      }
      if let merchantId = infoPList?["EMSMerchantId"] as? String, merchantId != "" {
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
