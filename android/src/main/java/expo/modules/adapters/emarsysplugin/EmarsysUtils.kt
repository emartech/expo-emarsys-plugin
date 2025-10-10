package expo.modules.adapters.emarsysplugin

import android.app.Application
import android.content.pm.PackageManager
import android.os.Bundle
import com.emarsys.rnwrapper.StorageUtil

data class EmarsysOptions(
  val applicationCode: String?,
  val merchantId: String?,
  val enableConsoleLogging: Boolean,
  val sharedPackageNames: List<String>,
  val sharedSecret: String?
)

object EmarsysUtils {
  
  private const val EMARSYS_WRAPPER_PREFIX = "com.emarsys.rnwrapper"
  
  fun parseCommaSeparatedList(value: String?): List<String> {
    return value
      ?.split(",")
      ?.map { it.trim() }
      ?.filter { it.isNotEmpty() }
      ?: emptyList()
  }

  fun fetchStoredAttributes(application: Application): EmarsysOptions {
    val metaData: Bundle = application.packageManager
      .getApplicationInfo(application.packageName, PackageManager.GET_META_DATA).metaData

    // Fetch applicationCode and merchantId using StorageUtil with AndroidManifest fallback
    var applicationCode = StorageUtil.getStringWithApplicationMetaDataFallback(application, "applicationCode", true)
    applicationCode = if (applicationCode !== "") applicationCode else null
    var merchantId = StorageUtil.getStringWithApplicationMetaDataFallback(application, "merchantId", true)
    merchantId = if (merchantId !== "") merchantId else null

    val enableConsoleLogging: Boolean = metaData.getBoolean("${EMARSYS_WRAPPER_PREFIX}.enableConsoleLogging", false)
    val sharedPackageNamesString: String? = metaData.getString("${EMARSYS_WRAPPER_PREFIX}.sharedPackageNames")
    val sharedSecret: String? = metaData.getString("${EMARSYS_WRAPPER_PREFIX}.sharedSecret")
    val sharedPackageNames: List<String> = parseCommaSeparatedList(sharedPackageNamesString)

    return EmarsysOptions(
      applicationCode = applicationCode,
      merchantId = merchantId,
      enableConsoleLogging = enableConsoleLogging,
      sharedPackageNames = sharedPackageNames,
      sharedSecret = sharedSecret
    )
  }
}