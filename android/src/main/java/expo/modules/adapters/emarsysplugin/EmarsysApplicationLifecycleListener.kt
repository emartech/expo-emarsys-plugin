package expo.modules.adapters.emarsysplugin

import android.app.Application
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.emarsys.Emarsys
import com.emarsys.config.EmarsysConfig
import com.emarsys.rnwrapper.RNEmarsysEventHandler
import com.emarsys.rnwrapper.StorageUtil

class EmarsysApplicationLifecycleListener(): ApplicationLifecycleListener {
  override fun onCreate(application: Application) {
    super.onCreate(application)

    val metaData: Bundle = application.packageManager
      .getApplicationInfo(application.packageName, PackageManager.GET_META_DATA).metaData

    var applicationCode = StorageUtil.getStringWithApplicationMetaDataFallback(application, "EMSApplicationCode", true)
    applicationCode = if (applicationCode !== "") applicationCode else null
    val merchantId: String? = metaData.getString("EMSMerchantId")
    val enableConsoleLogging: Boolean = metaData.getString("EMSEnableConsoleLogging")?.toBoolean() ?: false

    val config = EmarsysConfig(
      application = application,
      applicationCode = applicationCode,
      merchantId = merchantId,
      verboseConsoleLoggingEnabled = enableConsoleLogging)
    Emarsys.setup(config)

    val eventHandler = RNEmarsysEventHandler.getInstance()
    eventHandler.setEventHandlers()
  }
}
