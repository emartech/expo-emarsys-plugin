import Foundation
import RNEmarsysWrapper

public struct EmarsysOptions {
  let applicationCode: String?
  let merchantId: String?
  let enableConsoleLogging: Bool
  let sharedKeychainAccessGroup: String?
}

public class EmarsysUtils {
  
  private static let EMARSYS_WRAPPER_PREFIX = "com.emarsys.rnwrapper"
  
  public static func fetchStoredAttributes() -> EmarsysOptions {
    // Fetch applicationCode and merchantId using StorageUtil with Info.plist fallback
    let applicationCode = StorageUtil.string(forKey: "applicationCode", withInfoPListFallback: true)
    let merchantId = StorageUtil.string(forKey: "merchantId", withInfoPListFallback: true)
    
    let infoPlist = Bundle.main.infoDictionary
    let enableConsoleLogging = (infoPlist?["\(EMARSYS_WRAPPER_PREFIX).enableConsoleLogging"] as? Bool) ?? false
    let sharedKeychainAccessGroup = infoPlist?["\(EMARSYS_WRAPPER_PREFIX).sharedKeychainAccessGroup"] as? String
    
    return EmarsysOptions(
      applicationCode: (applicationCode?.isEmpty == false) ? applicationCode : nil,
      merchantId: (merchantId?.isEmpty == false) ? merchantId : nil,
      enableConsoleLogging: enableConsoleLogging,
      sharedKeychainAccessGroup: (sharedKeychainAccessGroup?.isEmpty == false) ? sharedKeychainAccessGroup : nil
    )
  }
}