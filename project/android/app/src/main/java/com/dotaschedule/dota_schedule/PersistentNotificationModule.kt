package com.dotaschedule.dota_schedule

import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PersistentNotificationModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "PersistentNotification"

  @ReactMethod
  fun sync(matchesJson: String, leadMinutes: Int, promise: Promise) {
    try {
      val intent = Intent(reactApplicationContext, PersistentNotificationService::class.java)
      intent.putExtra(PersistentNotificationService.EXTRA_MATCHES, matchesJson)
      intent.putExtra(PersistentNotificationService.EXTRA_LEAD_MINUTES, leadMinutes)
      reactApplicationContext.startForegroundService(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("sync_error", e)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      val intent = Intent(reactApplicationContext, PersistentNotificationService::class.java)
      reactApplicationContext.stopService(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("stop_error", e)
    }
  }
}
