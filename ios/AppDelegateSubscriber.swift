import ExpoModulesCore
import EmarsysSDK
// import RNEmarsysWrapper

public class AppDelegateSubscriber: ExpoAppDelegateSubscriber {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {

    let config = EMSConfig.make { builder in
          builder.setMobileEngageApplicationCode("EMSE7-A1D58")
          builder.setMerchantId("XXXXXXXXXXXXX")
      }
    Emarsys.setup(config: config)
    UNUserNotificationCenter.current().delegate = Emarsys.push
    // TODO: handle emarsys events
    // let rnEMSEventHandler = RNEmarsysEventHandler()
    // rnEMSEventHandler.setEventHandlers()

    return true
  }

  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Emarsys.push.setPushToken(deviceToken)
  }
}