package expo.modules.adapters.emarsysplugin

object EmarsysUtils {
  
  fun parseCommaSeparatedList(value: String?): List<String> {
    return value
      ?.split(",")
      ?.map { it.trim() }
      ?.filter { it.isNotEmpty() }
      ?: emptyList()
  }
}