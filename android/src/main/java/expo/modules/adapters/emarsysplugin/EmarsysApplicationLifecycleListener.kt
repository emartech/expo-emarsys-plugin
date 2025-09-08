package expo.modules.adapters.emarsysplugin

import android.app.Application
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.emarsys.Emarsys
import com.emarsys.config.EmarsysConfig
import com.emarsys.rnwrapper.RNEmarsysEventHandler

class EmarsysApplicationLifecycleListener(): ApplicationLifecycleListener {
  override fun onCreate(application: Application) {
    super.onCreate(application)
    val appInfo: ApplicationInfo = application.packageManager
      .getApplicationInfo(application.packageName, PackageManager.GET_META_DATA)
    val metaData: Bundle = appInfo.metaData
    val applicationCode: String? = metaData.getString("EMSApplicationCode")
    val merchantId: String? = metaData.getString("EMSMerchantId")

    val config = EmarsysConfig(
      application = application,
      applicationCode = applicationCode,
      merchantId = merchantId,
      verboseConsoleLoggingEnabled = true)
    Emarsys.setup(config)

    val eventHandler = RNEmarsysEventHandler.getInstance()
    eventHandler.setEventHandlers()
  }
}
