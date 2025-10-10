import ExpoModulesCore
import EmarsysSDK
import RNEmarsysWrapper

public class AppDelegateSubscriber: ExpoAppDelegateSubscriber {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    let options = EmarsysUtils.fetchStoredAttributes()
    
    let config: EMSConfig = EMSConfig.make { build in
      if let applicationCode = options.applicationCode {
        build.setMobileEngageApplicationCode(applicationCode)
      }
      if let merchantId = options.merchantId {
        build.setMerchantId(merchantId)
      }
      if options.enableConsoleLogging {
        build.enableConsoleLogLevels([EMSLogLevel.basic, EMSLogLevel.error, EMSLogLevel.info, EMSLogLevel.debug])
      }
      if let sharedKeychainAccessGroup = options.sharedKeychainAccessGroup {
        build.setSharedKeychainAccessGroup(sharedKeychainAccessGroup)
      }
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
