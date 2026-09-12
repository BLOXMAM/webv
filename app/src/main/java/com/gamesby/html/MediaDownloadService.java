package com.gamesby.html;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.IBinder;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

public class MediaDownloadService extends Service {

    private static final String CHANNEL_ID = "media_download_channel";
    private static final int NOTIFICATION_ID = 5001;

    private NotificationManager notificationManager;
    private Notification.Builder builder;

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "تحميل الوسائط", NotificationManager.IMPORTANCE_LOW);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        final ArrayList<String> urls = intent.getStringArrayListExtra("urls");
        final long totalExpectedBytes = intent.getLongExtra("total_bytes", 0);
        final String pageUrl = intent.getStringExtra("page_url");

        if (urls == null || urls.isEmpty()) {
            stopSelf();
            return START_NOT_STICKY;
        }

        startForegroundNotification(urls.size(), totalExpectedBytes, pageUrl);
        runDownloads(urls, totalExpectedBytes, pageUrl);

        // === [تعديل] لو النظام قتل الخدمة (نقص ذاكرة، قيود بطارية...) يعيد Android تشغيلها بنفس الـ Intent تلقائياً
        return START_REDELIVER_INTENT;
    }

    private void startForegroundNotification(int totalFiles, long totalExpectedBytes, String pageUrl) {
        Intent tapIntent = new Intent(this, MainActivity.class); // ⚠️ تأكد إن اسم الكلاس MainActivity يطابق نشاطك الرئيسي
        tapIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        if (pageUrl != null) tapIntent.putExtra("target_page_url", pageUrl);

        int pendingIntentFlags = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            ? (PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE)
            : PendingIntent.FLAG_UPDATE_CURRENT;

        PendingIntent tapPendingIntent = PendingIntent.getActivity(this, NOTIFICATION_ID, tapIntent, pendingIntentFlags);

        builder = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);

        builder.setSmallIcon(android.R.drawable.stat_sys_download);
        builder.setOngoing(true);
        builder.setContentIntent(tapPendingIntent);
        builder.setContentTitle("جاري تحميل الوسائط 0/" + totalFiles);
        builder.setContentText("0% - 0 B / " + formatFileSize(totalExpectedBytes));
        builder.setProgress(100, 0, false);

        if (Build.VERSION.SDK_INT >= 34) {
            // Android 14+ يتطلب تحديد "نوع" الخدمة الأمامية صراحة (راجع ملاحظة الـ Manifest بالأسفل)
            startForeground(NOTIFICATION_ID, builder.build(), android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        } else {
            startForeground(NOTIFICATION_ID, builder.build());
        }
    }

    private void runDownloads(final ArrayList<String> urls, final long totalExpectedBytes, final String pageUrl) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                String baseLocalPath = getApplicationContext().getFilesDir().getAbsolutePath() + "/";
                int totalFiles = urls.size();
                int successCount = 0;
                // === [مُعدَّل] بدل عدّاد تراكمي كان يفقد التزامنه مع الملف الفعلي عند إعادة المحاولة،
                // نحسب التقدّم دائمًا من: (مجموع أحجام الملفات المكتملة فعليًا) + (حجم الملف الجزئي الحالي على القرص) ===
                long completedBytes = 0;

                for (int i = 0; i < urls.size(); i++) {
                    String mediaUrl = urls.get(i);

                    String lowerUrl = mediaUrl.toLowerCase();
                    String cleanUrlForExt = lowerUrl.split("\\?")[0].split("#")[0];

                    String ext = ".mp4";
                    if (cleanUrlForExt.endsWith(".webm")) ext = ".webm";
                    else if (cleanUrlForExt.endsWith(".ogg")) ext = ".ogg";
                    else if (cleanUrlForExt.endsWith(".mp3")) ext = ".mp3";
                    else if (cleanUrlForExt.endsWith(".wav")) ext = ".wav";
                    else if (cleanUrlForExt.endsWith(".mov")) ext = ".mov";
                    else if (cleanUrlForExt.endsWith(".avi")) ext = ".avi";
                    else if (cleanUrlForExt.endsWith(".mkv")) ext = ".mkv";
                    else if (cleanUrlForExt.endsWith(".m4a")) ext = ".m4a";

                    String cleanName = "media_" + Math.abs(mediaUrl.hashCode()) + ext;
                    File finalFile = new File(baseLocalPath + cleanName);
                    File partFile = new File(baseLocalPath + cleanName + ".part");

                    if (finalFile.exists() && finalFile.length() > 0) {
                        // محمّل مسبقاً بالكامل - تخطّه مباشرة
                        successCount++;
                        completedBytes += finalFile.length();
                        updateNotification(i + 1, totalFiles, completedBytes, totalExpectedBytes);
                        continue;
                    }

                    // === [جديد] حلقة إعادة المحاولة الخاصة بهذا الملف: لو انقطع الإنترنت أثناء التحميل،
                    // نوقف التحميل مؤقتاً (Pause) بدل اعتباره فاشلاً أو ملغياً، ونحتفظ بالملف الجزئي (.part)
                    // كما هو على القرص، وننتظر عودة الإنترنت لنكمل بطلب Range من نفس النقطة بدل البدء من الصفر.
                    // لو الخطأ مش بسبب انقطاع الشبكة (رابط تالف، 404...) نتخلى عن الملف مباشرة زي السابق ===
                    boolean fileDone = false;
                    boolean giveUpOnThisFile = false;

                    while (!fileDone && !giveUpOnThisFile) {
                        long resumeFrom = partFile.exists() ? partFile.length() : 0;
                        HttpURLConnection conn = null;

                        try {
                            URL u = new URL(mediaUrl);
                            conn = (HttpURLConnection) u.openConnection();
                            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36");
                            if (pageUrl != null) conn.setRequestProperty("Referer", pageUrl);
                            if (resumeFrom > 0) conn.setRequestProperty("Range", "bytes=" + resumeFrom + "-");
                            conn.setConnectTimeout(10000);
                            conn.setReadTimeout(20000);
                            conn.connect();

                            int responseCode = conn.getResponseCode();

                            // السيرفر لا يدعم الاستئناف (رجّع 200 كامل رغم طلب Range) - نبدأ هذا الملف من الصفر
                            if (resumeFrom > 0 && responseCode == HttpURLConnection.HTTP_OK) {
                                partFile.delete();
                                resumeFrom = 0;
                            }

                            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_PARTIAL) {
                                InputStream in = null;
                                FileOutputStream out = null;
                                long currentFileBytes = resumeFrom;

                                try {
                                    in = conn.getInputStream();
                                    out = new FileOutputStream(partFile, resumeFrom > 0); // append لو مكمّلين

                                    byte[] buffer = new byte[8192];
                                    int len;
                                    long lastNotifiedBytes = currentFileBytes;

                                    while ((len = in.read(buffer)) != -1) {
                                        out.write(buffer, 0, len);
                                        currentFileBytes += len;

                                        if (currentFileBytes - lastNotifiedBytes >= 262144) {
                                            lastNotifiedBytes = currentFileBytes;
                                            updateNotification(i + 1, totalFiles, completedBytes + currentFileBytes, totalExpectedBytes);
                                        }
                                    }
                                    out.flush();
                                } finally {
                                    if (out != null) try { out.close(); } catch (Exception ignored) {}
                                    if (in != null) try { in.close(); } catch (Exception ignored) {}
                                }

                                // نجح التحميل بالكامل - رينيم من .part للاسم النهائي
                                if (partFile.renameTo(finalFile)) {
                                    successCount++;
                                    completedBytes += finalFile.length();
                                    fileDone = true;
                                } else {
                                    // فشل الـ rename لسبب غير متعلق بالشبكة - نتخلى عن هذا الملف
                                    partFile.delete();
                                    giveUpOnThisFile = true;
                                }
                            } else {
                                // كود استجابة غير متوقع (404 مثلاً) - مش مشكلة شبكة، نتخلى عن الملف مباشرة
                                giveUpOnThisFile = true;
                            }
                        } catch (Exception e) {
                            e.printStackTrace();

                            if (isNetworkAvailable()) {
                                // الإنترنت متوفر لكن حصل خطأ آخر (رابط تالف، رفض من السيرفر...) - لا داعي بمحاولة أبدية
                                giveUpOnThisFile = true;
                            } else {
                                // === انقطاع فعلي بالإنترنت: أوقف التحميل مؤقتاً، احتفظ بالملف الجزئي كما هو،
                                // وانتظر حتى تعود الشبكة ليعاد المحاولة تلقائياً بنفس الملف من نفس النقطة ===
                                showPausedNotification(i + 1, totalFiles);
                                waitForNetwork();
                                // عند عودة الشبكة، حلقة while(!fileDone) تعيد المحاولة تلقائياً بقيمة resumeFrom جديدة
                            }
                        } finally {
                            if (conn != null) conn.disconnect();
                        }
                    }

                    if (giveUpOnThisFile && partFile.exists()) {
                        // تخلّينا عن هذا الملف تحديداً - ننظّف أي جزء متبقي عشان ما يُعتبر مكتملاً بالغلط لاحقاً
                        partFile.delete();
                    }

                    updateNotification(i + 1, totalFiles, completedBytes, totalExpectedBytes);
                }

                notificationManager.cancel(NOTIFICATION_ID);
                stopForeground(true);
                stopSelf();
            }
        }).start();
    }

    // === [جديد] فحص فعلي لتوفر اتصال بالإنترنت حاليًا (وليس مجرد استثناء عابر أثناء القراءة/الكتابة) ===
    // ملاحظة: يتطلب صلاحية android.permission.ACCESS_NETWORK_STATE في AndroidManifest.xml
    private boolean isNetworkAvailable() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        } catch (Exception e) {
            return false;
        }
    }

    // === [جديد] ينتظر بشكل غير مُستهلك للمعالج (فحص كل 3 ثواني) لحين عودة الإنترنت، بدل إلغاء التحميل ===
    private void waitForNetwork() {
        while (!isNetworkAvailable()) {
            try {
                Thread.sleep(3000);
            } catch (InterruptedException ignored) {}
        }
    }

    // === [جديد] إشعار مؤقت يوضح للمستخدم إن التحميل متوقف مؤقتاً بانتظار عودة الإنترنت ===
    private void showPausedNotification(int currentFileIndex, int totalFiles) {
        builder.setContentTitle("تم إيقاف التحميل مؤقتاً " + currentFileIndex + "/" + totalFiles);
        builder.setContentText("بانتظار عودة الإنترنت لإكمال التحميل...");
        builder.setProgress(0, 0, true); // شريط تقدم غير محدد أثناء الانتظار
        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }

    private void updateNotification(int currentFileIndex, int totalFiles, long downloadedBytes, long totalBytes) {
        int percent = totalBytes > 0 ? (int) ((downloadedBytes * 100L) / totalBytes) : 0;
        if (percent > 100) percent = 100;

        builder.setContentTitle("جاري تحميل الوسائط " + currentFileIndex + "/" + totalFiles);
        builder.setContentText(percent + "% - " + formatFileSize(downloadedBytes) + " / " + formatFileSize(totalBytes));
        builder.setProgress(100, percent, false);

        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format(java.util.Locale.US, "%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format(java.util.Locale.US, "%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format(java.util.Locale.US, "%.2f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // Started Service بس، مو Bound Service
    }
}
