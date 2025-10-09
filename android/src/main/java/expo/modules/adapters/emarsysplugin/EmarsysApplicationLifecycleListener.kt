package expo.modules.adapters.emarsysplugin

import android.app.Application
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.emarsys.Emarsys
import com.emarsys.config.EmarsysConfig
import com.emarsys.rnwrapper.RNEmarsysEventHandler

class EmarsysApplicationLifecycleListener(): ApplicationLifecycleListener {
  override fun onCreate(application: Application) {
    super.onCreate(application)

    val options = EmarsysUtils.fetchStoredAttributes(application)

    val config = EmarsysConfig(
      application = application,
      applicationCode = options.applicationCode,
      merchantId = options.merchantId,
      verboseConsoleLoggingEnabled = options.enableConsoleLogging,
      sharedPackageNames = options.sharedPackageNames,
      sharedSecret = options.sharedSecret)
    Emarsys.setup(config)

    val eventHandler = RNEmarsysEventHandler.getInstance()
    eventHandler.setEventHandlers()
  }
}
