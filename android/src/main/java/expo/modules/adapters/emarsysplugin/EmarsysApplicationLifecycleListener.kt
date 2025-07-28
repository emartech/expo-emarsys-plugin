package expo.modules.adapters.emarsysplugin

import android.app.Application
import android.util.Log
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.emarsys.Emarsys
import com.emarsys.config.EmarsysConfig

class EmarsysApplicationLifecycleListener(): ApplicationLifecycleListener {
    override fun onCreate(application: Application) {
        super.onCreate(application)
        val config = EmarsysConfig(
          application = application,
          applicationCode = "EMSE7-A1D58",
          merchantId = "1DF86BF95CBE8F19",
          verboseConsoleLoggingEnabled = true)
        Emarsys.setup(config)

        Emarsys.trackCustomEvent("wrapper:init", mapOf())
    }
}
