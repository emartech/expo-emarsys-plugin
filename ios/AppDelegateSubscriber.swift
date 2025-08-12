import ExpoModulesCore
import EmarsysSDK

public class AppDelegateSubscriber: ExpoAppDelegateSubscriber {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {

    let infoPList = Bundle.main.infoDictionary
    let config = EMSConfig.make { build in
      if let applicationCode = infoPList?["EMSApplicationCode"] as? String, applicationCode != "" {
        build.setMobileEngageApplicationCode(applicationCode)
      }
      if let merchantId = infoPList?["EMSMerchantId"] as? String, merchantId != "" {
        build.setMerchantId(merchantId)
      }
    }
    Emarsys.setup(config: config)
    UNUserNotificationCenter.current().delegate = Emarsys.push

    return true
  }

  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Emarsys.push.setPushToken(deviceToken)
  }
}
