package expo.modules.adapters.emarsysplugin

import android.content.Context
import android.util.Log
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class EmarsysPackage: Package {
    override fun createApplicationLifecycleListeners(context: Context?): List<ApplicationLifecycleListener> {
        return listOf(EmarsysApplicationLifecycleListener())
    }

    override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
        return listOf(EmarsysReactActivityLifecycleListener())
    }
}