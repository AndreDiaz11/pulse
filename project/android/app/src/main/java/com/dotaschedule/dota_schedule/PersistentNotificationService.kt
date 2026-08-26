package com.dotaschedule.dota_schedule

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import org.json.JSONObject

class PersistentNotificationService : Service() {

  companion object {
    const val CHANNEL_ID = "pulse_persistent"
    const val NOTIFICATION_ID = 4821
    const val EXTRA_MATCHES = "matchesJson"
    const val EXTRA_LEAD_MINUTES = "leadMinutes"
    const val PREFS_NAME = "pulse_persistent_notification"
    const val REFRESH_INTERVAL_MS = 60_000L
  }

  private val handler = Handler(Looper.getMainLooper())
  private var refreshRunnable: Runnable? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val matchesJson = intent?.getStringExtra(EXTRA_MATCHES)
    val leadMinutes = intent?.getIntExtra(EXTRA_LEAD_MINUTES, 30) ?: 30

    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (matchesJson != null) {
      prefs.edit().putString(EXTRA_MATCHES, matchesJson).putInt(EXTRA_LEAD_MINUTES, leadMinutes).apply()
    }

    ensureChannel()
    refresh()
    scheduleRefresh()

    return START_STICKY
  }

  private fun scheduleRefresh() {
    refreshRunnable?.let { handler.removeCallbacks(it) }
    val runnable = Runnable {
      refresh()
      scheduleRefresh()
    }
    refreshRunnable = runnable
    handler.postDelayed(runnable, REFRESH_INTERVAL_MS)
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java)
    val channel = NotificationChannel(CHANNEL_ID, "Próximo partido favorito", NotificationManager.IMPORTANCE_LOW)
    manager?.createNotificationChannel(channel)
  }

  private fun refresh() {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val matchesJson = prefs.getString(EXTRA_MATCHES, null)
    val leadMinutes = prefs.getInt(EXTRA_LEAD_MINUTES, 30)

    val next = findNextMatch(matchesJson)
    if (next == null) {
      // Android exige llamar a startForeground() dentro de los primeros
      // segundos de startForegroundService(), incluso si el servicio va a
      // detenerse de inmediato por no haber partidos favoritos todavia
      // (p. ej. instalacion nueva). No cumplir esto causa
      // ForegroundServiceDidNotStartInTimeException y tumba la app.
      startForeground(NOTIFICATION_ID, buildEmptyNotification())
      stopForeground(true)
      stopSelf()
      return
    }

    val notification = buildNotification(next, leadMinutes)
    startForeground(NOTIFICATION_ID, notification)
  }

  private fun buildEmptyNotification(): Notification {
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Pulse")
      .setContentText("Sin partidos favoritos próximos")
      .setSmallIcon(android.R.drawable.ic_menu_recent_history)
      .setOnlyAlertOnce(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }

  private fun findNextMatch(matchesJson: String?): JSONObject? {
    if (matchesJson.isNullOrEmpty()) return null
    val array = JSONArray(matchesJson)
    val now = System.currentTimeMillis()

    var live: JSONObject? = null
    var soonest: JSONObject? = null
    var soonestStart = Long.MAX_VALUE

    for (i in 0 until array.length()) {
      val match = array.getJSONObject(i)
      if (match.optBoolean("isLive", false)) {
        live = match
        continue
      }
      val start = match.optLong("startTimeMs", -1)
      if (start > now && start < soonestStart) {
        soonestStart = start
        soonest = match
      }
    }

    return live ?: soonest
  }

  private fun buildNotification(match: JSONObject, leadMinutes: Int): Notification {
    val teamA = match.optString("teamA", "TBD")
    val teamB = match.optString("teamB", "TBD")
    val tournament = match.optString("tournament", "")
    val isLive = match.optBoolean("isLive", false)
    val startMs = match.optLong("startTimeMs", 0)

    val body = if (isLive) {
      "EN VIVO · $tournament"
    } else {
      val minutesUntil = ((startMs - System.currentTimeMillis()) / 60000).coerceAtLeast(0)
      "En $minutesUntil min · $tournament"
    }

    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = PendingIntent.getActivity(
      this, 0, launchIntent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("$teamA vs $teamB")
      .setContentText(body)
      .setSmallIcon(android.R.drawable.ic_menu_recent_history)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setContentIntent(pendingIntent)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }

  override fun onDestroy() {
    refreshRunnable?.let { handler.removeCallbacks(it) }
    super.onDestroy()
  }
}
