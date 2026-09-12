package com.gamesby.html;

import com.gamesby.html.SplashActivity;
import android.animation.*;
import android.app.*;
import android.app.Activity;
import android.app.DialogFragment;
import android.app.Fragment;
import android.app.FragmentManager;
import android.content.*;
import android.content.res.*;
import android.graphics.*;
import android.graphics.drawable.*;
import android.media.*;
import android.net.*;
import android.os.*;
import android.text.*;
import android.text.style.*;
import android.util.*;
import android.view.*;
import android.view.View.*;
import android.view.animation.*;
import android.webkit.*;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.*;
import com.gamesby.html.databinding.*;
import com.scottyab.rootbeer.*;
import java.io.*;
import java.text.*;
import java.util.*;
import java.util.regex.*;
import org.json.*;

public class MainActivity extends Activity {
	
	private MainBinding binding;
	
	private RequestNetwork updater;
	private RequestNetwork.RequestListener _updater_request_listener;
	
	@Override
	protected void onCreate(Bundle _savedInstanceState) {
		super.onCreate(_savedInstanceState);
		binding = MainBinding.inflate(getLayoutInflater());
		setContentView(binding.getRoot());
		initialize(_savedInstanceState);
		initializeLogic();
	}
	
	private void initialize(Bundle _savedInstanceState) {
		updater = new RequestNetwork(this);
		
		binding.WebView1.setWebViewClient(new WebViewClient() {
			@Override
			public void onPageStarted(WebView _param1, String _param2, Bitmap _param3) {
				final String _url = _param2;
				
				super.onPageStarted(_param1, _param2, _param3);
			}
			
			@Override
			public void onPageFinished(WebView _param1, String _param2) {
				final String _url = _param2;
				
				super.onPageFinished(_param1, _param2);
			}
		});
		
		_updater_request_listener = new RequestNetwork.RequestListener() {
			@Override
			public void onResponse(String _param1, String _param2, HashMap<String, Object> _param3) {
				final String _tag = _param1;
				final String _response = _param2;
				final HashMap<String, Object> _responseHeaders = _param3;
				
			}
			
			@Override
			public void onErrorResponse(String _param1, String _param2) {
				final String _tag = _param1;
				final String _message = _param2;
				
			}
		};
	}
	
	private void initializeLogic() {
		// === [إعدادات الحساب والمستودع] ===
		final String GITHUB_USER = "BLOXMAM";
		final String GITHUB_REPO = "webv";
		
		// === [جديد] مسح سجل التصفح الذكي (Smart Back Stack) بداية كل فتحة للتطبيق، فيبدأ كل جلسة استخدام سجلاً جديداً فاضياً
		MainActivity.this.getSharedPreferences("smart_back_stack", android.content.Context.MODE_PRIVATE).edit().clear().apply();
		
		final String ASSET_BASE_HOST = "webv.hosaaam-753.workers.dev";
		final String ASSET_BASE_URL = ASSET_BASE_HOST.isEmpty()
		? ("https://raw.githubusercontent.com/" + GITHUB_USER + "/" + GITHUB_REPO + "/main/")
		: ("https://" + ASSET_BASE_HOST + "/");
		
		final String APP_PAGES_URL = ASSET_BASE_URL + "apppages.json";
		
		// =======================================================
		// 🚀 أولاً: نظام التحديث الإجباري للـ APK (تحديث التطبيق نفسه)
		// =======================================================
		int currentVersionCode = 0;
		try {
			android.content.pm.PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
			if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
				currentVersionCode = (int) pInfo.getLongVersionCode();
			} else {
				currentVersionCode = pInfo.versionCode;
			}
		} catch (android.content.pm.PackageManager.NameNotFoundException e) {
			e.printStackTrace();
		}
		
		final int installedCode = currentVersionCode;
		
		RequestNetwork apkUpdateChecker = new RequestNetwork(MainActivity.this);
		String apkVersionUrl = ASSET_BASE_URL + "apk_version.json";
		
		apkUpdateChecker.startRequestNetwork(RequestNetworkController.GET, apkVersionUrl, "apk_check", new RequestNetwork.RequestListener() {
			@Override
			public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
				if (response == null || response.isEmpty() || response.contains("404")) return;
				
				try {
					org.json.JSONObject json = new org.json.JSONObject(response);
					int latestVersionCode = json.optInt("version_code", 0);
					final String downloadUrl = json.optString("download_url", "");
					final String changeLog = json.optString("change_log", "يتوفر إصدار جديد من التطبيق، يرجى التحديث للمتابعة.");
					
					if (latestVersionCode > installedCode) {
						runOnUiThread(new Runnable() {
							@Override
							public void run() {
								android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(MainActivity.this);
								builder.setTitle("تحديث جديد متوفر 🚀");
								builder.setMessage(changeLog);
								builder.setCancelable(false);
								
								builder.setPositiveButton("تحديث الآن", new android.content.DialogInterface.OnClickListener() {
									@Override
									public void onClick(android.content.DialogInterface dialog, int which) {
										try {
											android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(downloadUrl));
											startActivity(intent);
										} catch (Exception e) {
											e.printStackTrace();
										}
										finish();
									}
								});
								
								builder.setOnKeyListener(new android.content.DialogInterface.OnKeyListener() {
									@Override
									public boolean onKey(android.content.DialogInterface dialog, int keyCode, android.view.KeyEvent event) {
										if (keyCode == android.view.KeyEvent.KEYCODE_BACK) {
											finish();
											return true;
										}
										return false;
									}
								});
								
								android.app.AlertDialog dialog = builder.create();
								dialog.setCanceledOnTouchOutside(false);
								dialog.show();
							}
						});
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
			
			@Override
			public void onErrorResponse(String tag, String message) {}
		});
		
		// =======================================================
		// 🌐 ثانياً: تهيئة الـ WebView
		// =======================================================
		final boolean[] hasShownMediaAlert = {false};
		final android.webkit.ValueCallback<android.net.Uri[]>[] mUploadMessage = new android.webkit.ValueCallback[1];
		
		final android.webkit.WebView dynamicWebView = new android.webkit.WebView(MainActivity.this);
		
		dynamicWebView.setId(99999); 
		
		// === [جديد] حاوية جذر تدعم عرض فيديو/عنصر بملء الشاشة (Fullscreen) فوق الـ WebView ===
		final android.widget.FrameLayout rootFullscreenContainer = new android.widget.FrameLayout(MainActivity.this);
		final android.view.View[] customFullscreenView = new android.view.View[1];
		final android.webkit.WebChromeClient.CustomViewCallback[] customFullscreenCallback = new android.webkit.WebChromeClient.CustomViewCallback[1];
		
		dynamicWebView.getSettings().setJavaScriptEnabled(true);
		dynamicWebView.getSettings().setAllowFileAccess(true);
		dynamicWebView.getSettings().setAllowFileAccessFromFileURLs(true);
		dynamicWebView.getSettings().setAllowUniversalAccessFromFileURLs(true);
		
		dynamicWebView.getSettings().setDomStorageEnabled(true);
		dynamicWebView.getSettings().setDatabaseEnabled(true);
		
		// === [إضافة جديدة] تفعيل دعم target="_blank" و window.open() ===
		dynamicWebView.getSettings().setSupportMultipleWindows(true);
		dynamicWebView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
		String databasePath = MainActivity.this.getApplicationContext().getDir("database", android.content.Context.MODE_PRIVATE).getPath();
		dynamicWebView.getSettings().setDatabasePath(databasePath);
		
		// === [إضافة جديدة] منع التكبير/التصغير (Zoom) بالكامل ===
		dynamicWebView.getSettings().setSupportZoom(false);
		dynamicWebView.getSettings().setBuiltInZoomControls(false);
		dynamicWebView.getSettings().setDisplayZoomControls(false);
		dynamicWebView.getSettings().setTextZoom(100);
		
		// 🔴 دالة عرض واجهة الصيانة أو الإغلاق التام بتصاميم تناسب JSON الخاص بك مع كافة الإضافات
		final Runnable displayAppStatusScreen = new Runnable() {
			@Override
			public void run() {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						try {
							String baseLocalPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
							java.io.File statusFile = new java.io.File(baseLocalPath + "app_status.json");
							if (!statusFile.exists() || statusFile.length() == 0) return;
							
							java.io.FileInputStream fis = new java.io.FileInputStream(statusFile);
							java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(fis, "UTF-8"));
							StringBuilder sb = new StringBuilder();
							String line;
							while ((line = reader.readLine()) != null) sb.append(line);
							reader.close();
							fis.close();
							
							org.json.JSONObject json = new org.json.JSONObject(sb.toString());
							boolean isClosed = json.optBoolean("is_closed", false);
							boolean isMaintenance = json.optBoolean("is_maintenance", false);
							
							java.io.File closedFile = new java.io.File(baseLocalPath + "Closed.html");
							java.io.File maintenanceFile = new java.io.File(baseLocalPath + "Maintenance.html");
							
							if (isClosed) {
								if (closedFile.exists() && closedFile.length() > 0) {
									dynamicWebView.loadUrl("file://" + closedFile.getAbsolutePath());
								} else {
									// --- استقبال البيانات الإضافية للحالة: مغلق ---
									String icon = "🚫";
									String statusLabel = "التطبيق مغلق";
									String badgeBg = "#ef4444";
									String title = json.optString("close_title", "التطبيق متوقف حالياً");
									String message = json.optString("close_message", "تم إغلاق التطبيق.");
									
									// الإضافات المخصصة
									String logoUrl = json.optString("logo_url", "");
									String btnText = json.optString("btn_text", "");
									String btnUrl = json.optString("btn_url", "");
									String endTime = json.optString("end_time", "");
									
									String htmlContent = buildStatusPageHtml(icon, statusLabel, badgeBg, title, message, logoUrl, btnText, btnUrl, endTime);
									dynamicWebView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null);
								}
							} else if (isMaintenance) {
								if (maintenanceFile.exists() && maintenanceFile.length() > 0) {
									dynamicWebView.loadUrl("file://" + maintenanceFile.getAbsolutePath());
								} else {
									// --- استقبال البيانات الإضافية للحالة: صيانة ---
									String icon = "🛠️";
									String statusLabel = "وضع الصيانة";
									String badgeBg = "#f59e0b";
									String title = json.optString("maintenance_title", "تطبيق تحت الصيانة");
									String message = json.optString("maintenance_message", "سنعود قريباً!");
									
									// الإضافات المخصصة
									String logoUrl = json.optString("logo_url", "");
									String btnText = json.optString("btn_text", "");
									String btnUrl = json.optString("btn_url", "");
									String endTime = json.optString("end_time", "");
									
									String htmlContent = buildStatusPageHtml(icon, statusLabel, badgeBg, title, message, logoUrl, btnText, btnUrl, endTime);
									dynamicWebView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null);
								}
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				});
			}
			
			// دالة مساعدة لبناء واجهة innerHTML الشاملة لجميع البيانات المخصصة
			private String buildStatusPageHtml(String icon, String badgeText, String badgeBg, String title, String message, String logoUrl, String btnText, String btnUrl, String endTime) {
				
				String logoHtml = "";
				if (logoUrl != null && !logoUrl.trim().isEmpty()) {
					logoHtml = "<img src='" + logoUrl.trim() + "' class='app-logo' alt='Logo' />";
				}
				
				String btnHtml = "";
				if (btnText != null && !btnText.trim().isEmpty() && btnUrl != null && !btnUrl.trim().isEmpty()) {
					btnHtml = "<a href='" + btnUrl.trim() + "' class='action-btn'>" + btnText.trim() + "</a>";
				}
				
				String timerHtml = "";
				String timerScript = "";
				if (endTime != null && !endTime.trim().isEmpty()) {
					timerHtml = "<div id='timer-container' class='timer-box'>"
					+ "  <div class='time-unit'><span id='days'>00</span><label>يوم</label></div>"
					+ "  <div class='time-unit'><span id='hours'>00</span><label>ساعة</label></div>"
					+ "  <div class='time-unit'><span id='minutes'>00</span><label>دقيقة</label></div>"
					+ "  <div class='time-unit'><span id='seconds'>00</span><label>ثانية</label></div>"
					+ "</div>";
					
					timerScript = "<script>"
					+ "  var targetDate = new Date('" + endTime.trim() + "').getTime();"
					+ "  if(!isNaN(targetDate)){"
					+ "    var x = setInterval(function() {"
					+ "      var now = new Date().getTime();"
					+ "      var distance = targetDate - now;"
					+ "      if (distance < 0) {"
					+ "        clearInterval(x);"
					+ "        document.getElementById('timer-container').innerHTML = '<div style=\"color:#10b981;font-weight:bold;\">انتهت المدة المحددة!</div>';"
					+ "        return;"
					+ "      }"
					+ "      document.getElementById('days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));"
					+ "      document.getElementById('hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));"
					+ "      document.getElementById('minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));"
					+ "      document.getElementById('seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000);"
					+ "    }, 1000);"
					+ "  }"
					+ "</script>";
				}
				
				return "<!DOCTYPE html><html dir='rtl' lang='ar'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>"
				+ "<style>"
				+ "body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #0f172a; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; text-align: center; box-sizing: border-box; }"
				+ ".card { background: #1e293b; padding: 30px 20px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); width: 100%; max-width: 400px; border: 1px solid #334155; display: flex; flex-direction: column; align-items: center; }"
				+ ".app-logo { max-width: 90px; max-height: 90px; margin-bottom: 15px; border-radius: 16px; object-fit: contain; }"
				+ ".icon { font-size: 50px; margin-bottom: 12px; }"
				+ ".badge { display: inline-block; background-color: " + badgeBg + "; color: #ffffff; font-size: 13px; font-weight: bold; padding: 5px 14px; border-radius: 50px; margin-bottom: 15px; }"
				+ "h2 { margin: 0 0 10px 0; font-size: 20px; color: #ffffff; font-weight: 700; }"
				+ "p { margin: 0 0 15px 0; font-size: 14px; color: #94a3b8; line-height: 1.6; word-wrap: break-word; }"
				+ ".action-btn { display: inline-block; width: 80%; margin-top: 15px; padding: 12px 20px; background-color: #3b82f6; color: #ffffff; font-weight: bold; font-size: 15px; text-decoration: none; border-radius: 12px; transition: background 0.3s; }"
				+ ".timer-box { display: flex; justify-content: center; gap: 8px; margin-top: 15px; width: 100%; }"
				+ ".time-unit { background: #0f172a; padding: 8px; border-radius: 10px; border: 1px solid #334155; min-width: 55px; }"
				+ ".time-unit span { display: block; font-size: 18px; font-weight: bold; color: #38bdf8; }"
				+ ".time-unit label { font-size: 10px; color: #64748b; }"
				+ "</style></head><body>"
				+ "<div class='card'>"
				+ logoHtml
				+ (logoHtml.isEmpty() ? "<div class='icon'>" + icon + "</div>" : "")
				+ "<div class='badge'>" + badgeText + "</div>"
				+ "<h2>" + title + "</h2>"
				+ "<p>" + message + "</p>"
				+ timerHtml
				+ btnHtml
				+ "</div>"
				+ timerScript
				+ "</body></html>";
			}
		};
		
		// 🔴 نسخة افتراضية مضمّنة من صفحة 404 (تُستخدم فقط إذا لم يوجد 404.html في filesDir - لا علاقة لها بـ assets إطلاقاً)
		final String default404Html =
		"<!DOCTYPE html>"
		+ "<html lang=\"ar\" dir=\"rtl\">"
		+ "<head>"
		+ "<meta charset=\"UTF-8\">"
		+ "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0\">"
		+ "<title>الصفحة غير موجودة</title>"
		+ "<style>"
		+ ":root{--bg-color:#f8f9fa;--text-main:#1f2937;--text-sub:#6b7280;--primary:#2563eb;--primary-hover:#1d4ed8;--card-bg:#ffffff;--icon-bg:#eff6ff;}"
		+ "@media (prefers-color-scheme: dark){:root{--bg-color:#0f172a;--text-main:#f8fafc;--text-sub:#94a3b8;--primary:#3b82f6;--primary-hover:#60a5fa;--card-bg:#1e293b;--icon-bg:#1e3a8a;}}"
		+ "*{box-sizing:border-box;margin:0;padding:0;user-select:none;-webkit-tap-highlight-color:transparent;}"
		+ "body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:var(--bg-color);color:var(--text-main);height:100vh;display:flex;justify-content:center;align-items:center;padding:20px;overflow:hidden;}"
		+ ".container{text-align:center;max-width:360px;width:100%;background-color:var(--card-bg);padding:32px 24px;border-radius:24px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);animation:fadeIn 0.4s ease-out;}"
		+ ".icon-box{width:90px;height:90px;background-color:var(--icon-bg);border-radius:50%;display:flex;justify-content:center;align-items:center;margin:0 auto 20px;}"
		+ ".icon-box svg{width:48px;height:48px;fill:var(--primary);}"
		+ ".error-code{font-size:14px;font-weight:700;color:var(--primary);letter-spacing:1px;margin-bottom:8px;text-transform:uppercase;}"
		+ "h1{font-size:20px;font-weight:700;margin-bottom:8px;}"
		+ "p{font-size:14px;color:var(--text-sub);line-height:1.5;margin-bottom:24px;}"
		+ ".btn-group{display:flex;flex-direction:column;gap:10px;}"
		+ ".btn{width:100%;padding:12px 16px;border-radius:12px;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:background-color 0.2s, transform 0.1s;}"
		+ ".btn:active{transform:scale(0.98);}"
		+ ".btn-primary{background-color:var(--primary);color:#ffffff;}"
		+ ".btn-secondary{background-color:transparent;color:var(--text-sub);}"
		+ ".btn-gray{background-color:#e5e7eb;color:#374151;}"
		+ "@media (prefers-color-scheme: dark){.btn-gray{background-color:#334155;color:#e2e8f0;}}"
		+ ".info-box{max-height:0;overflow:hidden;opacity:0;margin-top:0;border-radius:12px;transition:max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease, padding 0.3s ease;text-align:right;}"
		+ ".info-box.show{max-height:220px;opacity:1;margin-top:12px;padding:14px 16px;background-color:var(--icon-bg);}"
		+ ".info-box p{font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:0;}"
		+ "@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}"
		+ "</style>"
		+ "</head>"
		+ "<body>"
		+ "<div class=\"container\">"
		+ "<div class=\"icon-box\">"
		+ "<svg viewBox=\"0 0 24 24\"><path d=\"M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"
		+ "</div>"
		+ "<div class=\"error-code\">خطأ 404</div>"
		+ "<h1>الصفحة غير موجودة</h1>"
		+ "<p>الصفحة التي تحاول الوصول إليها غير متوفرة حالياً.</p>"
		+ "<div class=\"btn-group\">"
		+ "<button class=\"btn btn-primary\" onclick=\"goHome()\">الرجوع للرئيسية</button>"
		+ "<button class=\"btn btn-gray\" onclick=\"toggleInfo()\">معلومات أكثر</button>"
		+ "</div>"
		+ "<div class=\"info-box\" id=\"infoBox\">"
		+ "<p>هذه المشكلة قد تحدث لعدة أسباب: هذه الصفحة تمت إزالتها أو استبدالها في نسخة أحدث من التطبيق، أو أن الملف الذي يحاول التطبيق فتحه تالف أو غير مكتمل. من الممكن أيضاً أن يكون لديك نسخة قديمة من بيانات التطبيق محفوظة على جهازك ولم تُحدَّث بشكل صحيح. إذا استمرت المشكلة معك، جرّب حذف بيانات التطبيق من إعدادات جهازك ثم افتحه من جديد.</p>"
		+ "</div>"
		+ "</div>"
		+ "<script>"
		+ "function goHome(){"
		+ "  try{"
		+ "    if (typeof Android !== 'undefined' && Android.openLocalPage) {"
		+ "      Android.openLocalPage('home.html');"
		+ "    } else {"
		+ "      window.location.href = 'home.html';"
		+ "    }"
		+ "  } catch(e) {}"
		+ "}"
		+ "function toggleInfo(){ document.getElementById('infoBox').classList.toggle('show'); }"
		+ "</script>"
		+ "</body></html>";
		
		// 🔴 دالة التوجيه لصفحة 404
		// === [مُعدَّل] تبحث فقط داخل filesDir، وإن لم توجد هناك تعرض النسخة الافتراضية المضمّنة أعلاه
		// لم تعد تستدعي 404.html من assets نهائياً بأي شكل ===
		final Runnable load404Page = new Runnable() {
			@Override
			public void run() {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						String baseLocalPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
						java.io.File file404 = new java.io.File(baseLocalPath + "404.html");
						
						if (file404.exists() && file404.length() > 0) {
							dynamicWebView.loadUrl("file://" + baseLocalPath + "404.html");
						} else {
							dynamicWebView.loadDataWithBaseURL(null, default404Html, "text/html", "UTF-8", null);
						}
					}
				});
			}
		};
		
		dynamicWebView.addJavascriptInterface(new Object() {
			@android.webkit.JavascriptInterface
			public String readLocalFile(final String fileName) {
				if (fileName == null) return "";
				try {
					String baseLocalPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
					java.io.File file = new java.io.File(baseLocalPath + fileName.trim());
					if (file.exists() && file.length() > 0) {
						java.io.FileInputStream fis = new java.io.FileInputStream(file);
						java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(fis, "UTF-8"));
						java.lang.StringBuilder sb = new java.lang.StringBuilder();
						String line;
						while ((line = reader.readLine()) != null) {
							sb.append(line).append("\n");
						}
						reader.close();
						fis.close();
						return sb.toString();
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
				return "";
			}
			
			// === [جديد] بدل تشغيل الفيديو/الصوت عبر اعتراض يدوي للطلبات (shouldInterceptRequest + Range يدوي)
			// نرجّع مسار file:// حقيقي للملف المحلي لو موجود، عشان الـ <video>/<audio> tag يشتغل بمشغّل النظام
			// الطبيعي مباشرة (نفس ما لو كان ملف محلي 100% من الأساس) - ده بيدّي seek/range دعم كامل تلقائياً
			// من نظام أندرويد نفسه، بدل الاعتماد على منطق Range مكتوب يدوياً ومعرّض للأخطاء ===
			@android.webkit.JavascriptInterface
			public String getLocalMediaFileUri(final String remoteUrl) {
				try {
					if (remoteUrl == null || remoteUrl.trim().isEmpty()) return "";
					// أصلاً محلي أو data: - مفيش داعي للتحويل
					if (remoteUrl.startsWith("file://") || remoteUrl.startsWith("data:") || remoteUrl.startsWith("blob:")) return "";
					
					String lowerUrl = remoteUrl.toLowerCase();
					String cleanUrlForExt = lowerUrl.split("\\?")[0].split("#")[0];
					
					String ext = null;
					if (cleanUrlForExt.endsWith(".mp4")) ext = ".mp4";
					else if (cleanUrlForExt.endsWith(".webm")) ext = ".webm";
					else if (cleanUrlForExt.endsWith(".ogg")) ext = ".ogg";
					else if (cleanUrlForExt.endsWith(".mp3")) ext = ".mp3";
					else if (cleanUrlForExt.endsWith(".wav")) ext = ".wav";
					else if (cleanUrlForExt.endsWith(".mov")) ext = ".mov";
					else if (cleanUrlForExt.endsWith(".avi")) ext = ".avi";
					else if (cleanUrlForExt.endsWith(".mkv")) ext = ".mkv";
					else if (cleanUrlForExt.endsWith(".m4a")) ext = ".m4a";
					if (ext == null) return "";
					
					// === [مُعدَّل] نفس آلية تسمية الصور/الملفات الثابتة تمامًا: اسم مبني على hash الرابط الكامل
					// بدل اسم الملف الأصلي - يتفادى تصادم الأسماء، ولازم يطابق نفس اسم الحفظ في خدمة التحميل ===
					String fileName = "media_" + Math.abs(remoteUrl.hashCode()) + ext;
					
					String baseLocalPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
					java.io.File localFile = new java.io.File(baseLocalPath + fileName);
					
					if (localFile.exists() && localFile.length() > 0) {
						return "file://" + localFile.getAbsolutePath();
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
				return "";
			}
			
			@android.webkit.JavascriptInterface
			public void callAndroidBlock(final String message) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						if (message != null) {
							String trimmed = message.trim();
							if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.contains("students") || trimmed.startsWith("data:")) {
								return;
							}
							SketchwareUtil.showMessage(getApplicationContext(), message);
						}
					}
				});
			}
			
			@android.webkit.JavascriptInterface
			public void openLocalPage(final String fileName) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						if (fileName != null) {
							String cleanName = fileName.trim();
							String baseLocalPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
							java.io.File targetFile = new java.io.File(baseLocalPath + cleanName);
							
							if (targetFile.exists() && targetFile.length() > 0) {
								dynamicWebView.loadUrl("file://" + baseLocalPath + cleanName);
							} else {
								copyAssetToLocal(cleanName, baseLocalPath + cleanName);
								java.io.File copiedFile = new java.io.File(baseLocalPath + cleanName);
								if (copiedFile.exists() && copiedFile.length() > 0) {
									dynamicWebView.loadUrl("file://" + baseLocalPath + cleanName);
								} else {
									load404Page.run();
								}
							}
						}
					}
				});
			}
			
			// === [إضافة] تحميل ملف من مجلد assets ونسخه فعلياً إلى مجلد Downloads ===
			@android.webkit.JavascriptInterface
			public void downloadAssetFile(final String fileName) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						try {
							java.io.InputStream inputStream = MainActivity.this.getAssets().open(fileName);
							
							String assetMimeType = "application/octet-stream";
							if (fileName.endsWith(".apk")) assetMimeType = "application/vnd.android.package-archive";
							else if (fileName.endsWith(".zip") || fileName.endsWith(".swb")) assetMimeType = "application/zip";
							
							if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
								android.content.ContentValues values = new android.content.ContentValues();
								values.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, fileName);
								values.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, assetMimeType);
								values.put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, android.os.Environment.DIRECTORY_DOWNLOADS);
								
								android.net.Uri externalUri = android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI;
								android.net.Uri fileUri = MainActivity.this.getContentResolver().insert(externalUri, values);
								
								if (fileUri != null) {
									java.io.OutputStream outputStream = MainActivity.this.getContentResolver().openOutputStream(fileUri);
									byte[] buffer = new byte[4096];
									int length;
									while ((length = inputStream.read(buffer)) > 0) {
										outputStream.write(buffer, 0, length);
									}
									outputStream.flush();
									outputStream.close();
									SketchwareUtil.showMessage(getApplicationContext(), "✅ تم حفظ الملف بنجاح في مجلد Downloads: " + fileName);
								}
							} else {
								java.io.File downloadsFolder = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS);
								java.io.File outFile = new java.io.File(downloadsFolder, fileName);
								java.io.FileOutputStream outputStream = new java.io.FileOutputStream(outFile);
								byte[] buffer = new byte[4096];
								int length;
								while ((length = inputStream.read(buffer)) > 0) {
									outputStream.write(buffer, 0, length);
								}
								outputStream.flush();
								outputStream.close();
								SketchwareUtil.showMessage(getApplicationContext(), "✅ تم حفظ الملف بنجاح في مجلد Downloads: " + fileName);
							}
							inputStream.close();
						} catch (Exception e) {
							SketchwareUtil.showMessage(getApplicationContext(), "❌ خطأ أثناء تحميل الملف: " + e.getMessage());
						}
					}
				});
			}
			
			// === [إضافة جديدة] استقبال روابط الفيديو/الصوت المكتشفة بالصفحة، وعرض نافذة تحميل جماعي بالحجم الكلي ===
			@android.webkit.JavascriptInterface
			public void reportMediaFiles(final String jsonArray, final String pageUrl) {
				if (jsonArray == null || jsonArray.trim().isEmpty()) return;
				if (hasShownMediaAlert[0]) return; // مرة وحدة بس لكل صفحة (يُعاد ضبطها بـ onPageStarted)
				hasShownMediaAlert[0] = true;
				
				// === [إضافة جديدة] احترام خيار "لا تظهر لمدة 30 يوم" لو المستخدم فعّله سابقاً
				android.content.SharedPreferences mediaDialogPrefs = MainActivity.this.getSharedPreferences("media_dialog_pref", android.content.Context.MODE_PRIVATE);
				long snoozeUntil = mediaDialogPrefs.getLong("snooze_until", 0);
				if (System.currentTimeMillis() < snoozeUntil) return;
				
				new Thread(new Runnable() {
					@Override
					public void run() {
						final java.util.ArrayList<String> mediaUrls = new java.util.ArrayList<>();
						try {
							String trimmed = jsonArray.trim();
							if (trimmed.startsWith("[")) trimmed = trimmed.substring(1);
							if (trimmed.endsWith("]")) trimmed = trimmed.substring(0, trimmed.length() - 1);
							String[] parts = trimmed.split(",");
							for (String part : parts) {
								String cleaned = part.trim();
								if (cleaned.startsWith("\"") && cleaned.endsWith("\"") && cleaned.length() >= 2) {
									cleaned = cleaned.substring(1, cleaned.length() - 1);
								}
								cleaned = cleaned.replace("\\/", "/");
								if (!cleaned.isEmpty()) mediaUrls.add(cleaned);
							}
						} catch (Exception e) { e.printStackTrace(); }
						
						if (mediaUrls.isEmpty()) return;
						
						// === [إضافة جديدة] استبعاد أي ملف محمّل مسبقاً بالتخزين المحلي (filesDir) - نفس منطق تسمية الملفات المستخدم بالتحميل
						final String baseLocalPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
						final java.util.ArrayList<String> missingUrls = new java.util.ArrayList<>();
						
						for (String mediaUrl : mediaUrls) {
							// === [مُعدَّل] نفس اسم hash المستخدم في getLocalMediaFileUri وshouldInterceptRequest بالأسفل ===
							String lowerMediaUrl = mediaUrl.toLowerCase();
							String cleanUrlForExt = lowerMediaUrl.split("\\?")[0].split("#")[0];
							
							String ext = null;
							if (cleanUrlForExt.endsWith(".mp4")) ext = ".mp4";
							else if (cleanUrlForExt.endsWith(".webm")) ext = ".webm";
							else if (cleanUrlForExt.endsWith(".ogg")) ext = ".ogg";
							else if (cleanUrlForExt.endsWith(".mp3")) ext = ".mp3";
							else if (cleanUrlForExt.endsWith(".wav")) ext = ".wav";
							else if (cleanUrlForExt.endsWith(".mov")) ext = ".mov";
							else if (cleanUrlForExt.endsWith(".avi")) ext = ".avi";
							else if (cleanUrlForExt.endsWith(".mkv")) ext = ".mkv";
							else if (cleanUrlForExt.endsWith(".m4a")) ext = ".m4a";
							
							if (ext == null) {
								missingUrls.add(mediaUrl); // امتداد غير معروف - يمر للفحص العادي (HEAD) بالأسفل
								continue;
							}
							
							String fileName = "media_" + Math.abs(mediaUrl.hashCode()) + ext;
							java.io.File existingFile = new java.io.File(baseLocalPath + fileName);
							if (!existingFile.exists() || existingFile.length() <= 0) {
								missingUrls.add(mediaUrl);
							}
						}
						
						if (missingUrls.isEmpty()) return; // كل الملفات محمّلة مسبقاً - لا داعي لإزعاج المستخدم بنفس النافذة مرة ثانية
						
						final java.util.ArrayList<String> validUrls = new java.util.ArrayList<>();
						final java.util.ArrayList<Long> sizes = new java.util.ArrayList<>();
						long totalBytes = 0;
						
						for (String mediaUrl : missingUrls) {
							try {
								java.net.URL u = new java.net.URL(mediaUrl);
								java.net.HttpURLConnection conn = (java.net.HttpURLConnection) u.openConnection();
								conn.setRequestMethod("HEAD");
								conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36");
								if (pageUrl != null) conn.setRequestProperty("Referer", pageUrl);
								conn.setConnectTimeout(5000);
								conn.setReadTimeout(5000);
								conn.connect();
								
								long len = conn.getContentLengthLong();
								conn.disconnect();
								
								if (len > 0) {
									validUrls.add(mediaUrl);
									sizes.add(len);
									totalBytes += len;
								}
							} catch (Exception e) { e.printStackTrace(); }
						}
						
						if (validUrls.isEmpty()) return;
						
						final long finalTotalBytes = totalBytes;
						runOnUiThread(new Runnable() {
							@Override
							public void run() {
								// === [إصلاح كراش] لو المستخدم غادر/أغلق الشاشة قبل ما ينتهي فحص الملفات (اللي يصير بخيط منفصل ومهلته قد تطول)،
								// لا تحاول تعرض أي نافذة، لأن نافذة الـ Activity تكون غير صالحة فيصير كراش BadTokenException
								boolean activityStillValid = !MainActivity.this.isFinishing();
								if (activityStillValid && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1) {
									activityStillValid = !MainActivity.this.isDestroyed();
								}
								if (!activityStillValid) return;
								
								showMediaDownloadDialog(validUrls, sizes, finalTotalBytes, pageUrl);
							}
						});
					}
				}).start();
			}
			
			private String formatFileSize(long bytes) {
				if (bytes < 1024) return bytes + " B";
				if (bytes < 1024 * 1024) return String.format(java.util.Locale.US, "%.1f KB", bytes / 1024.0);
				if (bytes < 1024 * 1024 * 1024) return String.format(java.util.Locale.US, "%.1f MB", bytes / (1024.0 * 1024.0));
				return String.format(java.util.Locale.US, "%.2f GB", bytes / (1024.0 * 1024.0 * 1024.0));
			}
			
			private void showMediaDownloadDialog(final java.util.ArrayList<String> urls, final java.util.ArrayList<Long> sizes, final long totalBytes, final String pageUrl) {
				// === [إصلاح كراش] فحص إضافي أخير قبل البناء والعرض مباشرة، كخط دفاع ثانٍ ضد أي تسابق توقيت (race condition)
				boolean activityStillValid = !MainActivity.this.isFinishing();
				if (activityStillValid && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1) {
					activityStillValid = !MainActivity.this.isDestroyed();
				}
				if (!activityStillValid) return;
				
				StringBuilder message = new StringBuilder();
				message.append("تحتوي هذه الصفحة على ").append(urls.size()).append(urls.size() == 1 ? " ملف وسائط (فيديو/صوت)" : " ملفات وسائط (فيديو/صوت)");
				message.append("\nالحجم الكلي: ").append(formatFileSize(totalBytes));
				message.append("\n\nلتشغيلها بدون اتصال بالإنترنت لاحقاً، يجب تحميلها الآن.");
				
				try {
					new android.app.AlertDialog.Builder(MainActivity.this)
					.setTitle("تحميل الوسائط")
					.setMessage(message.toString())
					.setCancelable(true)
					.setPositiveButton("تحميل", new android.content.DialogInterface.OnClickListener() {
						@Override
						public void onClick(android.content.DialogInterface dialog, int which) {
							downloadMediaGroup(urls, sizes, totalBytes, pageUrl);
						}
					})
					.setNegativeButton("لا شكراً", null)
					.setNeutralButton("لا تظهر لمدة 30 يوم", new android.content.DialogInterface.OnClickListener() {
						@Override
						public void onClick(android.content.DialogInterface dialog, int which) {
							android.content.SharedPreferences mediaDialogPrefs = MainActivity.this.getSharedPreferences("media_dialog_pref", android.content.Context.MODE_PRIVATE);
							long snoozeUntil = System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000);
							mediaDialogPrefs.edit().putLong("snooze_until", snoozeUntil).apply();
						}
					})
					.show();
				} catch (Exception e) {
					// لو صار أي تسابق توقيت نادر رغم الفحص أعلاه (مثلاً الشاشة أُغلقت بنفس اللحظة)، نتجاهله بدل ما يكرش التطبيق
					e.printStackTrace();
				}
			}
			
			/* يحمّل كل روابط الميديا فعلياً كـ bytes خام إلى تخزين التطبيق الخاص (filesDir) - نفس مكان بقية أصول التطبيق،
       وليس مجلد Downloads العام - عشان الـ WebView يقدر يشغّلها لاحقاً بدون إنترنت عبر file:// */
			/* === تعديل: الآن تبدأ Foreground Service بدل تشغيل Thread داخل النشاط ===
       الفرق المهم: هذا الـ Thread القديم كان ينتهي فوراً لو أغلق المستخدم التطبيق (Swipe Away)،
       بينما الـ Service الجديد (MediaDownloadService) يستمر بالخلفية حتى لو أُغلق التطبيق بالكامل */
			private void downloadMediaGroup(final java.util.ArrayList<String> urls, final java.util.ArrayList<Long> expectedSizes, final long totalExpectedBytes, final String pageUrl) {
				android.content.Intent serviceIntent = new android.content.Intent(MainActivity.this, MediaDownloadService.class);
				serviceIntent.putStringArrayListExtra("urls", urls);
				serviceIntent.putExtra("total_bytes", totalExpectedBytes);
				serviceIntent.putExtra("page_url", pageUrl);
				
				if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
					MainActivity.this.startForegroundService(serviceIntent);
				} else {
					MainActivity.this.startService(serviceIntent);
				}
			}
			
			private void copyAssetToLocal(String assetName, String localPath) {
				try {
					java.io.InputStream in = MainActivity.this.getAssets().open(assetName);
					java.io.File outFile = new java.io.File(localPath);
					java.io.FileOutputStream out = new java.io.FileOutputStream(outFile);
					byte[] buffer = new byte[1024];
					int read;
					while ((read = in.read(buffer)) != -1) {
						out.write(buffer, 0, read);
					}
					in.close();
					out.flush();
					out.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}, "Android");
		
		MainActivity.this.getWindow().getDecorView().setTag(mUploadMessage);
		
		dynamicWebView.setWebViewClient(new android.webkit.WebViewClient() {
			
			// === [إضافة جديدة] توجيه أي رابط خارج نطاق المشروع إلى المتصفح الحقيقي للمستخدم ===
			// يبقى داخل التطبيق فقط: ملفات file:// المحلية، ونطاق raw.githubusercontent.com أو نطاق Cloudflare Worker (محتوى المشروع)
			@Override
			public boolean shouldOverrideUrlLoading(android.webkit.WebView view, android.webkit.WebResourceRequest request) {
				String scheme = request.getUrl().getScheme();
				String host = request.getUrl().getHost();
				
				if ("file".equals(scheme)) {
					return false;
				}
				
				if (host != null && (host.equalsIgnoreCase("raw.githubusercontent.com") || (!ASSET_BASE_HOST.isEmpty() && host.equalsIgnoreCase(ASSET_BASE_HOST)))) {
					return false;
				}
				
				try {
					android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, request.getUrl());
					MainActivity.this.startActivity(intent);
				} catch (Exception e) {
					e.printStackTrace();
					SketchwareUtil.showMessage(getApplicationContext(), "تعذر فتح الرابط");
				}
				return true;
			}
			
			@Override
			public void onPageStarted(android.webkit.WebView view, String url, android.graphics.Bitmap favicon) {
				super.onPageStarted(view, url, favicon);
				hasShownMediaAlert[0] = false; // نسمح بعرض نافذة تحميل الوسائط مرة وحدة لكل صفحة جديدة
			}
			
			@Override
			public void onPageFinished(android.webkit.WebView view, String url) {
				super.onPageFinished(view, url);
				
				// === [جديد] تتبع سجل تصفح ذكي (Smart Back Stack) لتفادي إعادة التنقل بشكل مزعج بين
				// نفس الصفحات المتكررة عند الرجوع للخلف (مثال: home -> z -> home -> search -> view -> home...)
				// نخزّنه في SharedPreferences عشان يبقى متاح لكود onBackPressed المنفصل بنفس الـ Activity
				try {
					// === [جديد] استبعاد splash.html نهائياً من السجل، حتى ما يصير فيه احتمال الرجوع لها إطلاقاً عبر onBackPressed
					boolean isSplashPage = url != null && url.toLowerCase().endsWith("/splash.html");
					
					if (url != null && !url.trim().isEmpty() && !url.equalsIgnoreCase("about:blank") && !isSplashPage) {
						android.content.SharedPreferences backStackPrefs = MainActivity.this.getSharedPreferences("smart_back_stack", android.content.Context.MODE_PRIVATE);
						org.json.JSONArray backStackArray = new org.json.JSONArray(backStackPrefs.getString("stack", "[]"));
						
						String lastUrlInStack = backStackArray.length() > 0 ? backStackArray.optString(backStackArray.length() - 1, "") : "";
						
						// لو نفس الصفحة الحالية بالضبط (تحديث/إعادة تحميل)، لا تكرّرها بالسجل
						if (!url.equals(lastUrlInStack)) {
							// لو الصفحة موجودة مسبقاً بأي مكان بالسجل، معناها المستخدم رجع لصفحة زارها من قبل
							// ضمن نفس الجلسة -> نقصّ كل اللي بعدها بدل ما نكدّسها من جديد، فتنحل الحلقة المتكررة تلقائياً
							int existingIndex = -1;
							for (int i = 0; i < backStackArray.length(); i++) {
								if (url.equals(backStackArray.optString(i, ""))) {
									existingIndex = i;
									break;
								}
							}
							
							org.json.JSONArray updatedStack = new org.json.JSONArray();
							if (existingIndex >= 0) {
								for (int i = 0; i <= existingIndex; i++) {
									updatedStack.put(backStackArray.optString(i, ""));
								}
							} else {
								for (int i = 0; i < backStackArray.length(); i++) {
									updatedStack.put(backStackArray.optString(i, ""));
								}
								updatedStack.put(url);
							}
							
							backStackPrefs.edit().putString("stack", updatedStack.toString()).apply();
						}
					}
				} catch (Exception e) { e.printStackTrace(); }
				
				view.evaluateJavascript(
				"(function(){"
				+ "var meta = document.querySelector('meta[name=viewport]');"
				+ "if(!meta){meta=document.createElement('meta');meta.name='viewport';document.getElementsByTagName('head')[0].appendChild(meta);}"
				+ "meta.setAttribute('content','width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');"
				+ "})();",
				null
				);
				
				// === [إضافة جديدة] فحص الصفحة بحثاً عن فيديو/صوت وإرسال روابطها لجافا لعرض نافذة التحميل الجماعي
				view.evaluateJavascript(
				"(function(){"
				+ "try{"
				+ "var mediaUrls=[];"
				+ "var addUrl=function(src){ if(src && src.indexOf('file://')!==0 && mediaUrls.indexOf(src)===-1){ mediaUrls.push(src); } };"
				+ "var videos=document.querySelectorAll('video');"
				+ "for(var i=0;i<videos.length;i++){"
				+ "  if(videos[i].currentSrc){addUrl(videos[i].currentSrc);} else if(videos[i].src){addUrl(videos[i].src);}"
				+ "  var vs=videos[i].querySelectorAll('source');"
				+ "  for(var j=0;j<vs.length;j++){ if(vs[j].src){addUrl(vs[j].src);} }"
				+ "}"
				+ "var audios=document.querySelectorAll('audio');"
				+ "for(var i=0;i<audios.length;i++){"
				+ "  if(audios[i].currentSrc){addUrl(audios[i].currentSrc);} else if(audios[i].src){addUrl(audios[i].src);}"
				+ "  var as=audios[i].querySelectorAll('source');"
				+ "  for(var j=0;j<as.length;j++){ if(as[j].src){addUrl(as[j].src);} }"
				+ "}"
				+ "if(mediaUrls.length>0 && window.Android && Android.reportMediaFiles){"
				+ "  Android.reportMediaFiles(JSON.stringify(mediaUrls), location.href);"
				+ "}"
				+ "}catch(e){}"
				+ "})();",
				null
				);
				
				// === [جديد] لو الفيديو/الصوت متوفر محلياً بالفعل (filesDir)، نستبدل الـ src بمسار file:// حقيقي
				// فيشتغل بمشغّل النظام الطبيعي بدعم seekbar/range كامل من نظام أندرويد نفسه، بدل الاعتماد
				// على اعتراض الطلبات يدوياً (اللي كان يقطع التشغيل بعد ثانية واحدة بسبب أخطاء Range اليدوية) ===
				view.evaluateJavascript(
				"(function(){"
				+ "try{"
				+ "function tryLocalize(el){"
				+ "  if(!el || !el.getAttribute) return;"
				+ "  var src = el.currentSrc || el.getAttribute('src');"
				+ "  if(src && window.Android && Android.getLocalMediaFileUri){"
				+ "    var localUri = Android.getLocalMediaFileUri(src);"
				+ "    if(localUri && localUri!=='' && el.src!==localUri){"
				+ "      var wasPlaying = !el.paused;"
				+ "      var savedTime = el.currentTime || 0;"
				+ "      el.src = localUri;"
				+ "      el.load();"
				+ "      el.addEventListener('loadedmetadata', function onMeta(){"
				+ "        el.removeEventListener('loadedmetadata', onMeta);"
				+ "        try{ el.currentTime = savedTime; }catch(e2){}"
				+ "        if(wasPlaying){ var p = el.play(); if(p && p.catch){ p.catch(function(){}); } }"
				+ "      });"
				+ "    }"
				+ "  }"
				+ "  var sources = el.querySelectorAll ? el.querySelectorAll('source') : [];"
				+ "  for(var i=0;i<sources.length;i++){"
				+ "    var ssrc = sources[i].getAttribute('src');"
				+ "    if(ssrc && window.Android && Android.getLocalMediaFileUri){"
				+ "      var localSrcUri = Android.getLocalMediaFileUri(ssrc);"
				+ "      if(localSrcUri && localSrcUri!==''){ sources[i].setAttribute('src', localSrcUri); }"
				+ "    }"
				+ "  }"
				+ "}"
				+ "function scanAll(){"
				+ "  var mediaEls = document.querySelectorAll('video, audio');"
				+ "  for(var i=0;i<mediaEls.length;i++){ tryLocalize(mediaEls[i]); }"
				+ "}"
				+ "scanAll();"
				+ "if(window.MutationObserver && document.body){"
				+ "  var observer = new MutationObserver(function(mutations){"
				+ "    for(var m=0;m<mutations.length;m++){"
				+ "      var added = mutations[m].addedNodes;"
				+ "      for(var n=0;n<added.length;n++){"
				+ "        var node = added[n];"
				+ "        if(!node || node.nodeType!==1) continue;"
				+ "        if(node.tagName==='VIDEO' || node.tagName==='AUDIO'){ tryLocalize(node); }"
				+ "        var nested = node.querySelectorAll ? node.querySelectorAll('video, audio') : [];"
				+ "        for(var k=0;k<nested.length;k++){ tryLocalize(nested[k]); }"
				+ "      }"
				+ "    }"
				+ "  });"
				+ "  observer.observe(document.body, {childList:true, subtree:true});"
				+ "}"
				+ "}catch(e){}"
				+ "})();",
				null
				);
			}
			
			@Override
			public void onReceivedError(android.webkit.WebView view, int errorCode, String description, String failingUrl) {
				super.onReceivedError(view, errorCode, description, failingUrl);
				if (failingUrl != null && !failingUrl.endsWith("404.html")) {
					load404Page.run();
				}
			}
			
			@Override
			public void onReceivedHttpError(android.webkit.WebView view, android.webkit.WebResourceRequest request, android.webkit.WebResourceResponse errorResponse) {
				super.onReceivedHttpError(view, request, errorResponse);
				if (request.isForMainFrame() && errorResponse.getStatusCode() == 404) {
					load404Page.run();
				}
			}
			
			@Override
			public android.webkit.WebResourceResponse shouldInterceptRequest(android.webkit.WebView view, android.webkit.WebResourceRequest request) {
				String url = request.getUrl().toString();
				String lowerUrl = url.toLowerCase();
				String cleanUrlForExt = lowerUrl.split("\\?")[0].split("#")[0];
				
				// 1. فحص الميديا - لو الملف محمّل مسبقاً بالتخزين المحلي (filesDir)، قدّمه من هناك مباشرة بدل الإنترنت
				// === [إصلاح] أُضيفت .mov/.avi/.mkv/.m4a هنا لأن منطق تحديد الـ mimeType بالأسفل كان يدعمها بالفعل
				//     لكن هذا الشرط الخارجي كان يستثنيها فعلياً فلا يصل الكود لها إطلاقاً ===
				if (cleanUrlForExt.endsWith(".mp4") || cleanUrlForExt.endsWith(".webm") || cleanUrlForExt.endsWith(".ogg") 
				|| cleanUrlForExt.endsWith(".mp3") || cleanUrlForExt.endsWith(".wav") || cleanUrlForExt.endsWith(".mov")
				|| cleanUrlForExt.endsWith(".avi") || cleanUrlForExt.endsWith(".mkv") || cleanUrlForExt.endsWith(".m4a")
				|| lowerUrl.contains("/video") || lowerUrl.contains("/audio") || lowerUrl.contains("stream")) {
					
					try {
						// === [مُعدَّل] اسم الملف المحلي الآن مبني على hash الرابط الكامل (نفس آلية تسمية الصور/CSS/JS)
						// بدل اسم الملف الأصلي - لضمان اسم فريد دائمًا ومطابقة اسم الحفظ في خدمة التحميل ===
						String ext = ".mp4";
						if (cleanUrlForExt.endsWith(".webm")) ext = ".webm";
						else if (cleanUrlForExt.endsWith(".ogg")) ext = ".ogg";
						else if (cleanUrlForExt.endsWith(".mp3")) ext = ".mp3";
						else if (cleanUrlForExt.endsWith(".wav")) ext = ".wav";
						else if (cleanUrlForExt.endsWith(".mov")) ext = ".mov";
						else if (cleanUrlForExt.endsWith(".avi")) ext = ".avi";
						else if (cleanUrlForExt.endsWith(".mkv")) ext = ".mkv";
						else if (cleanUrlForExt.endsWith(".m4a")) ext = ".m4a";
						
						String cleanName = "media_" + Math.abs(url.hashCode()) + ext;
						
						String localBase = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
						java.io.File localMediaFile = new java.io.File(localBase + cleanName);
						
						if (localMediaFile.exists() && localMediaFile.length() > 0) {
							String lowerName = cleanName.toLowerCase();
							String mimeType = "video/mp4";
							if (lowerName.endsWith(".webm")) mimeType = "video/webm";
							else if (lowerName.endsWith(".ogg")) mimeType = "video/ogg";
							else if (lowerName.endsWith(".mp3")) mimeType = "audio/mpeg";
							else if (lowerName.endsWith(".wav")) mimeType = "audio/wav";
							else if (lowerName.endsWith(".mov")) mimeType = "video/quicktime";
							else if (lowerName.endsWith(".avi")) mimeType = "video/x-msvideo";
							else if (lowerName.endsWith(".mkv")) mimeType = "video/x-matroska";
							else if (lowerName.endsWith(".m4a")) mimeType = "audio/mp4";
							
							long fileLength = localMediaFile.length();
							String rangeHeader = request.getRequestHeaders().get("Range");
							
							// === [إصلاح شامل] دعم Range Requests (206 Partial Content) بصيغه الثلاث:
							//     bytes=start-end | bytes=start- | bytes=-suffixLength (آخر N بايت، كانت تفشل بصمت قبل كده)
							//     + رفض الـ Range غير المنطقي بـ 416 بدل تجاهله بصمت ===
							if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
								try {
									String rangeValue = rangeHeader.substring("bytes=".length()).trim();
									
									// نتعامل مع أول range بس لو المشغّل طلب أكتر من واحد بفاصلة (نادر جداً مع الفيديو)
									int commaIdx = rangeValue.indexOf(',');
									if (commaIdx != -1) rangeValue = rangeValue.substring(0, commaIdx).trim();
									
									long startByte;
									long endByteTemp;
									
									if (rangeValue.startsWith("-")) {
										// === [إصلاح] صيغة "آخر N بايت" (bytes=-N) - يستخدمها بعض المشغّلات لقراءة
										//     الـ metadata من نهاية ملف الـ MP4 عند فتحه لأول مرة ===
										long suffixLength = Long.parseLong(rangeValue.substring(1).trim());
										if (suffixLength <= 0) throw new NumberFormatException("suffix length invalid");
										if (suffixLength > fileLength) suffixLength = fileLength;
										startByte = fileLength - suffixLength;
										endByteTemp = fileLength - 1;
									} else {
										String[] rangeParts = rangeValue.split("-", 2);
										startByte = Long.parseLong(rangeParts[0].trim());
										endByteTemp = (rangeParts.length > 1 && !rangeParts[1].trim().isEmpty())
										? Long.parseLong(rangeParts[1].trim())
										: (fileLength - 1);
									}
									
									if (startByte < 0) startByte = 0;
									if (endByteTemp >= fileLength) endByteTemp = fileLength - 1;
									
									// === [إصلاح] Range غير منطقي (خارج حدود الملف) -> نرجّع 416 صراحة بدل ما نكسر
									//     التشغيل بإرجاع الملف كامل أو استثناء غير متوقع ===
									if (fileLength <= 0 || startByte > endByteTemp || startByte >= fileLength) {
										java.util.Map<String, String> invalidRangeHeaders = new java.util.HashMap<>();
										invalidRangeHeaders.put("Content-Range", "bytes */" + fileLength);
										return new android.webkit.WebResourceResponse(mimeType, null, 416, "Range Not Satisfiable", invalidRangeHeaders, null);
									}
									
									final long finalStartByte = startByte;
									final long finalEndByte = endByteTemp;
									final long contentLength = finalEndByte - finalStartByte + 1;
									
									final java.io.RandomAccessFile randomAccessFile = new java.io.RandomAccessFile(localMediaFile, "r");
									randomAccessFile.seek(finalStartByte);
									
									java.io.InputStream partialStream = new java.io.InputStream() {
										long remaining = contentLength;
										
										@Override
										public int read() throws java.io.IOException {
											if (remaining <= 0) return -1;
											int b = randomAccessFile.read();
											if (b != -1) remaining--;
											return b;
										}
										
										@Override
										public int read(byte[] buffer, int offset, int length) throws java.io.IOException {
											if (remaining <= 0) return -1;
											int toRead = (int) Math.min(length, remaining);
											int actuallyRead = randomAccessFile.read(buffer, offset, toRead);
											if (actuallyRead != -1) remaining -= actuallyRead;
											return actuallyRead;
										}
										
										@Override
										public void close() throws java.io.IOException {
											randomAccessFile.close();
										}
									};
									
									java.util.Map<String, String> responseHeaders = new java.util.HashMap<>();
									responseHeaders.put("Accept-Ranges", "bytes");
									responseHeaders.put("Content-Range", "bytes " + finalStartByte + "-" + finalEndByte + "/" + fileLength);
									responseHeaders.put("Content-Length", String.valueOf(contentLength));
									
									return new android.webkit.WebResourceResponse(mimeType, null, 206, "Partial Content", responseHeaders, partialStream);
								} catch (Exception rangeEx) {
									rangeEx.printStackTrace();
									// فشل تحليل الـ Range لأي سبب - نكمل بالطريقة العادية (الملف كاملاً) بدل ما نفشل تماماً
								}
							}
							
							java.util.Map<String, String> fullHeaders = new java.util.HashMap<>();
							fullHeaders.put("Accept-Ranges", "bytes");
							fullHeaders.put("Content-Length", String.valueOf(fileLength));
							
							java.io.FileInputStream localMediaStream = new java.io.FileInputStream(localMediaFile);
							return new android.webkit.WebResourceResponse(mimeType, null, 200, "OK", fullHeaders, localMediaStream);
						}
					} catch (Exception e) { e.printStackTrace(); }
					
					return null; // ما فيه نسخة محلية - يبث من الإنترنت زي العادة (Referer الأصلي يصل عادي للـ WebView نفسه)
				}
				
				// 2. معالجة HTML من GitHub أو Cloudflare Worker
				if ((lowerUrl.contains("raw.githubusercontent.com") || (!ASSET_BASE_HOST.isEmpty() && lowerUrl.contains(ASSET_BASE_HOST.toLowerCase()))) && (cleanUrlForExt.endsWith(".html"))) {
					try {
						java.net.URL rawUrl = new java.net.URL(url);
						java.net.HttpURLConnection connection = (java.net.HttpURLConnection) rawUrl.openConnection();
						connection.setConnectTimeout(5000);
						connection.setReadTimeout(5000);
						connection.connect();
						
						if (connection.getResponseCode() == java.net.HttpURLConnection.HTTP_OK) {
							java.io.InputStream in = connection.getInputStream();
							return new android.webkit.WebResourceResponse("text/html", "UTF-8", in);
						} else {
							return null;
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
				
				// 3. معالجة كافة الصور والـ GIFs
				if (cleanUrlForExt.endsWith(".jpg") || cleanUrlForExt.endsWith(".jpeg") || cleanUrlForExt.endsWith(".png") 
				|| cleanUrlForExt.endsWith(".webp") || cleanUrlForExt.endsWith(".gif") || cleanUrlForExt.endsWith(".svg")
				|| lowerUrl.contains("/image") || lowerUrl.contains("/images") || lowerUrl.contains("giphy")
				|| lowerUrl.contains("unsplash") || lowerUrl.contains("picsum") || lowerUrl.contains("pexels") 
				|| lowerUrl.contains("pixabay") || lowerUrl.contains("pxhere") || lowerUrl.contains("cloudinary")) {
					
					try {
						String fileName = "img_secured_" + Math.abs(url.hashCode());
						final String localImgPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/" + fileName;
						java.io.File file = new java.io.File(localImgPath);
						
						android.content.SharedPreferences mimePrefs = MainActivity.this.getSharedPreferences("secured_images_mime", android.content.Context.MODE_PRIVATE);
						// [جديد] خريطة تربط كل ملف مخزّن مؤقتاً برابطه الأصلي، تُستخدم لاحقاً لإبطال ذاكرة لوجو التطبيق تحديداً عند صدور نسخة أحدث
						android.content.SharedPreferences urlMapPrefs = MainActivity.this.getSharedPreferences("secured_images_url_map", android.content.Context.MODE_PRIVATE);
						if (file.exists() && file.length() > 0) {
							String savedMimeType = mimePrefs.getString(fileName, "image/jpeg");
							java.io.FileInputStream inputStream = new java.io.FileInputStream(file);
							return new android.webkit.WebResourceResponse(savedMimeType, "UTF-8", inputStream);
						}
						
						java.net.URL imgUrl = new java.net.URL(url);
						java.net.HttpURLConnection connection = (java.net.HttpURLConnection) imgUrl.openConnection();
						connection.setConnectTimeout(10000); 
						connection.setReadTimeout(10000);
						connection.connect();
						
						if (connection.getResponseCode() == java.net.HttpURLConnection.HTTP_OK) {
							String contentType = connection.getContentType();
							if (contentType == null || !contentType.contains("/")) {
								contentType = "image/jpeg";
								if (cleanUrlForExt.endsWith(".png")) contentType = "image/png";
								else if (cleanUrlForExt.endsWith(".gif") || lowerUrl.contains(".gif")) contentType = "image/gif";
								else if (cleanUrlForExt.endsWith(".webp")) contentType = "image/webp";
								else if (cleanUrlForExt.endsWith(".svg")) contentType = "image/svg+xml";
							}
							
							mimePrefs.edit().putString(fileName, contentType).apply();
							urlMapPrefs.edit().putString(fileName, url).apply();
							java.io.InputStream in = connection.getInputStream();
							java.io.FileOutputStream out = new java.io.FileOutputStream(file);
							byte[] buffer = new byte[4096];
							int read;
							while ((read = in.read(buffer)) != -1) {
								out.write(buffer, 0, read);
							}
							in.close();
							out.close();
							
							return new android.webkit.WebResourceResponse(contentType, "UTF-8", new java.io.FileInputStream(file));
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
				
				// 4. الاعتراض الشامل لجميع المكاتب والخطوط والـ CDN
				if (cleanUrlForExt.endsWith(".ttf") || cleanUrlForExt.endsWith(".woff") || cleanUrlForExt.endsWith(".woff2") 
				|| cleanUrlForExt.endsWith(".js") || cleanUrlForExt.endsWith(".css") || cleanUrlForExt.endsWith(".eot")
				|| lowerUrl.contains("font") || lowerUrl.contains("cdn") || lowerUrl.contains("unpkg") 
				|| lowerUrl.contains("jsdelivr") || lowerUrl.contains("cdnjs") || lowerUrl.contains("bootstrap")
				|| lowerUrl.contains("lucide") || lowerUrl.contains("fontawesome")) {
					try {
						String extension = ".css";
						String mimeType = "text/css";
						
						if (cleanUrlForExt.endsWith(".woff2") || lowerUrl.contains(".woff2") || lowerUrl.contains("woff2")) { 
							extension = ".woff2"; mimeType = "font/woff2"; 
						} else if (cleanUrlForExt.endsWith(".woff") || lowerUrl.contains(".woff") || lowerUrl.contains("woff")) { 
							extension = ".woff"; mimeType = "font/woff"; 
						} else if (cleanUrlForExt.endsWith(".ttf") || lowerUrl.contains(".ttf")) { 
							extension = ".ttf"; mimeType = "font/ttf"; 
						} else if (cleanUrlForExt.endsWith(".eot") || lowerUrl.contains(".eot")) { 
							extension = ".eot"; mimeType = "application/vnd.ms-fontobject"; 
						} else if (cleanUrlForExt.endsWith(".js") || lowerUrl.contains(".js") || lowerUrl.contains("lucide")) { 
							extension = ".js"; mimeType = "application/javascript"; 
						} else if (cleanUrlForExt.endsWith(".css") || lowerUrl.contains(".css") || lowerUrl.contains("bootstrap")) { 
							extension = ".css"; mimeType = "text/css"; 
						}
						
						String fileName = "static_" + Math.abs(url.hashCode()) + extension;
						final String localStaticPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/" + fileName;
						java.io.File file = new java.io.File(localStaticPath);
						
						if (file.exists() && file.length() > 0) {
							java.io.FileInputStream inputStream = new java.io.FileInputStream(file);
							java.util.Map<String, String> responseHeaders = new java.util.HashMap<>();
							responseHeaders.put("Access-Control-Allow-Origin", "*");
							return new android.webkit.WebResourceResponse(mimeType, "UTF-8", 200, "OK", responseHeaders, inputStream);
						}
						
						java.net.URL staticUrl = new java.net.URL(url);
						java.net.HttpURLConnection connection = (java.net.HttpURLConnection) staticUrl.openConnection();
						connection.setConnectTimeout(8000);
						connection.setReadTimeout(8000);
						connection.connect();
						
						if (connection.getResponseCode() == java.net.HttpURLConnection.HTTP_OK) {
							java.io.InputStream in = connection.getInputStream();
							java.io.FileOutputStream out = new java.io.FileOutputStream(file);
							byte[] buffer = new byte[4096];
							int read;
							while ((read = in.read(buffer)) != -1) {
								out.write(buffer, 0, read);
							}
							in.close();
							out.close();
							
							java.io.FileInputStream inputStream = new java.io.FileInputStream(file);
							java.util.Map<String, String> responseHeaders = new java.util.HashMap<>();
							responseHeaders.put("Access-Control-Allow-Origin", "*");
							return new android.webkit.WebResourceResponse(mimeType, "UTF-8", 200, "OK", responseHeaders, inputStream);
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
				return super.shouldInterceptRequest(view, request);
			}
		});
		
		dynamicWebView.setWebChromeClient(new android.webkit.WebChromeClient() {
			
			// === [إضافة جديدة] دعم ملء الشاشة (Fullscreen) لفيديوهات HTML5 وعنصر JavaScript's requestFullscreen() ===
			@Override
			public void onShowCustomView(android.view.View view, android.webkit.WebChromeClient.CustomViewCallback callback) {
				if (customFullscreenView[0] != null) {
					callback.onCustomViewHidden();
					return;
				}
				
				customFullscreenView[0] = view;
				customFullscreenCallback[0] = callback;
				view.setTag(callback); // يسمح لدالة onBackPressed المنفصلة بالوصول لنفس الـ callback لاحقاً
				
				dynamicWebView.setVisibility(android.view.View.GONE);
				rootFullscreenContainer.addView(view, new android.widget.FrameLayout.LayoutParams(
				android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
				android.widget.FrameLayout.LayoutParams.MATCH_PARENT
				));
				
				// إخفاء أشرطة النظام (شريط الحالة والتنقل) لملء شاشة حقيقي
				MainActivity.this.getWindow().getDecorView().setSystemUiVisibility(
				android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
				| android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
				| android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
				| android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
				| android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
				| android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
				);
				
				MainActivity.this.getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
			}
			
			@Override
			public void onHideCustomView() {
				if (customFullscreenView[0] == null) return;
				
				rootFullscreenContainer.removeView(customFullscreenView[0]);
				dynamicWebView.setVisibility(android.view.View.VISIBLE);
				
				// استرجاع أشرطة النظام لوضعها الطبيعي
				MainActivity.this.getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
				MainActivity.this.getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
				
				if (customFullscreenCallback[0] != null) {
					customFullscreenCallback[0].onCustomViewHidden();
				}
				
				customFullscreenView[0] = null;
				customFullscreenCallback[0] = null;
			}
			
			// === [إضافة جديدة] معالجة target="_blank" و window.open() بتوجيهها للمتصفح الخارجي
			// بدل ما تبقى "ميتة" بلا استجابة، بنفس منطق shouldOverrideUrlLoading تمامًا
			@Override
			public boolean onCreateWindow(android.webkit.WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
				final android.webkit.WebView tempWebView = new android.webkit.WebView(MainActivity.this);
				
				tempWebView.setWebViewClient(new android.webkit.WebViewClient() {
					@Override
					public boolean shouldOverrideUrlLoading(android.webkit.WebView view2, android.webkit.WebResourceRequest request) {
						String scheme = request.getUrl().getScheme();
						String host = request.getUrl().getHost();
						
						// نفس منطق الروابط العادية بالضبط: أبقِ الروابط الداخلية (المحلية أو نطاق المشروع) داخل التطبيق
						if ("file".equals(scheme) || (host != null && (host.equalsIgnoreCase("raw.githubusercontent.com") || (!ASSET_BASE_HOST.isEmpty() && host.equalsIgnoreCase(ASSET_BASE_HOST))))) {
							dynamicWebView.loadUrl(request.getUrl().toString());
							return true;
						}
						
						try {
							android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, request.getUrl());
							MainActivity.this.startActivity(intent);
						} catch (Exception e) {
							e.printStackTrace();
							SketchwareUtil.showMessage(getApplicationContext(), "تعذر فتح الرابط");
						}
						return true;
					}
				});
				
				android.webkit.WebView.WebViewTransport transport = (android.webkit.WebView.WebViewTransport) resultMsg.obj;
				transport.setWebView(tempWebView);
				resultMsg.sendToTarget();
				return true;
			}
			
			// === [إضافة جديدة] دعم alert() من JavaScript كـ Dialog حقيقي ===
			@Override
			public boolean onJsAlert(android.webkit.WebView view, String url, String message, final android.webkit.JsResult result) {
				android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(MainActivity.this);
				builder.setMessage(message);
				builder.setPositiveButton("موافق", new android.content.DialogInterface.OnClickListener() {
					@Override
					public void onClick(android.content.DialogInterface dialog, int which) {
						result.confirm();
					}
				});
				builder.setCancelable(false);
				builder.create().show();
				return true;
			}
			
			// === [إضافة جديدة] دعم confirm() من JavaScript كـ Dialog حقيقي بخيارين ===
			@Override
			public boolean onJsConfirm(android.webkit.WebView view, String url, String message, final android.webkit.JsResult result) {
				android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(MainActivity.this);
				builder.setMessage(message);
				builder.setPositiveButton("موافق", new android.content.DialogInterface.OnClickListener() {
					@Override
					public void onClick(android.content.DialogInterface dialog, int which) {
						result.confirm();
					}
				});
				builder.setNegativeButton("إلغاء", new android.content.DialogInterface.OnClickListener() {
					@Override
					public void onClick(android.content.DialogInterface dialog, int which) {
						result.cancel();
					}
				});
				builder.setCancelable(false);
				builder.create().show();
				return true;
			}
			
			// === [إضافة جديدة] دعم prompt() من JavaScript مع حقل إدخال نصي ===
			@Override
			public boolean onJsPrompt(android.webkit.WebView view, String url, String message, String defaultValue, final android.webkit.JsPromptResult result) {
				android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(MainActivity.this);
				builder.setMessage(message);
				
				final android.widget.EditText input = new android.widget.EditText(MainActivity.this);
				input.setText(defaultValue);
				builder.setView(input);
				
				builder.setPositiveButton("موافق", new android.content.DialogInterface.OnClickListener() {
					@Override
					public void onClick(android.content.DialogInterface dialog, int which) {
						result.confirm(input.getText().toString());
					}
				});
				builder.setNegativeButton("إلغاء", new android.content.DialogInterface.OnClickListener() {
					@Override
					public void onClick(android.content.DialogInterface dialog, int which) {
						result.cancel();
					}
				});
				builder.setCancelable(false);
				builder.create().show();
				return true;
			}
			
			@Override
			public boolean onShowFileChooser(android.webkit.WebView webView, android.webkit.ValueCallback<android.net.Uri[]> filePathCallback, android.webkit.WebChromeClient.FileChooserParams fileChooserParams) {
				if (mUploadMessage[0] != null) {
					mUploadMessage[0].onReceiveValue(null);
				}
				mUploadMessage[0] = filePathCallback;
				
				android.content.Intent intent = null;
				
				// محاولة استخدام القصد (Intent) القادم من الـ HTML مباشرة لمعرفة نوع الملفات المطلوبة
				if (android.os.Build.VERSION.SDK_INT >= 21) {
					intent = fileChooserParams.createIntent();
				}
				
				// في حال عدم وجود Intent مجهز من الـ HTML، يتم إنشاء Intent عام لجميع أنواع الملفات
				if (intent == null) {
					intent = new android.content.Intent(android.content.Intent.ACTION_GET_CONTENT);
					intent.addCategory(android.content.Intent.CATEGORY_OPENABLE);
					intent.setType("*/*"); // قبول جميع أنواع الملفات دون استثناء
				}
				
				try {
					MainActivity.this.startActivityForResult(android.content.Intent.createChooser(intent, "اختر الملف"), 101);
				} catch (Exception e) {
					mUploadMessage[0] = null;
					return false;
				}
				return true;
			}
		});
		
		// =======================================================
		// ⬇️ معالج التحميل الموحّد (Download) — data: و http/https معاً
		// يستخرج اسم الملف/امتداده ديناميكياً من Content-Disposition أولاً (مثل المتصفح تماماً)،
		// ولا يفرض اسماً أو امتداداً ثابتاً إلا كحل احتياطي أخير لو تعذّر تحديدهما
		// =======================================================
		dynamicWebView.setDownloadListener(new android.webkit.DownloadListener() {
			@Override
			public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
				try {
					boolean isDataUri = url != null && url.startsWith("data:");
					android.net.Uri parsedUri = isDataUri ? null : android.net.Uri.parse(url);
					
					String fileName = null;
					
					// 1. الأولوية القصوى دائماً: استخراج filename من Content-Disposition
					//    (يشتغل مع data: و http/https بنفس الطريقة لأن WebView يمرره تلقائياً لو فيه download="...")
					if (contentDisposition != null && !contentDisposition.isEmpty()) {
						java.util.regex.Matcher m1 = java.util.regex.Pattern
						.compile("filename\\*=UTF-8''([^;]+)", java.util.regex.Pattern.CASE_INSENSITIVE)
						.matcher(contentDisposition);
						java.util.regex.Matcher m2 = java.util.regex.Pattern
						.compile("filename=\"?([^\";]+)\"?", java.util.regex.Pattern.CASE_INSENSITIVE)
						.matcher(contentDisposition);
						
						if (m1.find()) {
							fileName = java.net.URLDecoder.decode(m1.group(1).trim(), "UTF-8");
						} else if (m2.find()) {
							fileName = m2.group(1).trim();
						}
					}
					
					// 2. لو ما زال فاضي، وكان الرابط http/https، خذ الاسم من آخر جزء بالمسار
					if ((fileName == null || fileName.isEmpty()) && !isDataUri) {
						String lastSegment = parsedUri.getLastPathSegment();
						if (lastSegment != null && !lastSegment.isEmpty()) {
							fileName = lastSegment;
						}
					}
					
					// 3. تحديد الـ MIME الفعلي: لو data:، استخرجه من رأس الرابط نفسه (data:<mime>;base64,...)
					String finalMimeType = mimeType;
					String dataHeader = null;
					if (isDataUri) {
						int commaIndex = url.indexOf(",");
						dataHeader = url.substring(5, commaIndex);
						String declaredMime = dataHeader.split(";")[0].trim();
						if (!declaredMime.isEmpty()) {
							finalMimeType = declaredMime;
						}
					}
					
					boolean hasExtension = fileName != null && fileName.contains(".")
					&& fileName.lastIndexOf(".") < fileName.length() - 1;
					
					if (fileName != null) {
						String lowerName = fileName.toLowerCase();
						if (lowerName.endsWith(".apk")) finalMimeType = "application/vnd.android.package-archive";
						else if (lowerName.endsWith(".pdf")) finalMimeType = "application/pdf";
						else if (lowerName.endsWith(".zip")) finalMimeType = "application/zip";
						else if (lowerName.endsWith(".json")) finalMimeType = "application/json";
						else if (lowerName.endsWith(".mp3")) finalMimeType = "audio/mpeg";
						else if (lowerName.endsWith(".mp4")) finalMimeType = "video/mp4";
						else if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) finalMimeType = "application/msword";
					}
					
					// 4. لو ما زال بدون امتداد نهائياً -> استنتجه من الـ MIME ونلحقه بالاسم
					if (fileName == null || !hasExtension) {
						String guessedExt = android.webkit.MimeTypeMap.getSingleton()
						.getExtensionFromMimeType(finalMimeType);
						
						if (guessedExt == null || guessedExt.isEmpty()) {
							guessedExt = "bin";
						}
						
						String defaultBaseName = isDataUri ? "backup" : "downloaded_file";
						fileName = (fileName == null || fileName.isEmpty() ? defaultBaseName : fileName) + "." + guessedExt;
					}
					
					// ============================================================
					// === الحفظ الفعلي: حسب نوع المصدر (data: مقابل http/https) ===
					// ============================================================
					if (isDataUri) {
						String dataString = url.substring(url.indexOf(",") + 1);
						byte[] fileBytes;
						if (dataHeader.toLowerCase().contains("base64")) {
							fileBytes = android.util.Base64.decode(dataString, android.util.Base64.DEFAULT);
						} else {
							fileBytes = android.net.Uri.decode(dataString).getBytes("UTF-8");
						}
						
						if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
							android.content.ContentValues values = new android.content.ContentValues();
							values.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, fileName);
							values.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, finalMimeType);
							values.put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, android.os.Environment.DIRECTORY_DOWNLOADS);
							
							android.net.Uri externalUri = android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI;
							android.net.Uri fileUri = MainActivity.this.getContentResolver().insert(externalUri, values);
							
							if (fileUri != null) {
								java.io.OutputStream outputStream = MainActivity.this.getContentResolver().openOutputStream(fileUri);
								outputStream.write(fileBytes);
								outputStream.close();
								SketchwareUtil.showMessage(getApplicationContext(), "✅ تم حفظ الملف بنجاح: " + fileName);
							}
						} else {
							java.io.File downloadsFolder = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS);
							java.io.File file = new java.io.File(downloadsFolder, fileName);
							java.io.FileOutputStream fos = new java.io.FileOutputStream(file);
							fos.write(fileBytes);
							fos.close();
							SketchwareUtil.showMessage(getApplicationContext(), "✅ تم حفظ الملف بنجاح: " + fileName);
						}
						
					} else {
						// رابط http/https عادي -> DownloadManager
						android.app.DownloadManager.Request request = new android.app.DownloadManager.Request(parsedUri);
						request.setMimeType(finalMimeType);
						request.addRequestHeader("User-Agent", userAgent);
						request.setDescription("جاري تحميل الملف...");
						request.setTitle(fileName);
						request.allowScanningByMediaScanner();
						request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
						request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, fileName);
						
						android.app.DownloadManager dm = (android.app.DownloadManager) MainActivity.this.getSystemService(android.content.Context.DOWNLOAD_SERVICE);
						dm.enqueue(request);
						
						SketchwareUtil.showMessage(getApplicationContext(), "بدأ تحميل: " + fileName);
					}
					
				} catch (Exception e) {
					e.printStackTrace();
					SketchwareUtil.showMessage(getApplicationContext(), "تعذر بدء التحميل");
				}
			}
		});
		
		rootFullscreenContainer.addView(dynamicWebView, new android.widget.FrameLayout.LayoutParams(
		android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
		android.widget.FrameLayout.LayoutParams.MATCH_PARENT
		));
		setContentView(rootFullscreenContainer);
		
		// =======================================================
		// 🔑 دالة تشغيل التطبيق الطبيعي (تُستدعى فقط إذا كان التطبيق نشطاً)
		// =======================================================
		final String baseLocalPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/";
		final String local_path = baseLocalPath + "home.html";
		
		// =======================================================
		// 🖼️ [جديد] دالة إبطال ذاكرة التخزين المؤقت الخاصة بصورة/صور اللوجو (app-assets/) فقط
		// تُستدعى كل مرة يتم فيها اكتشاف إصدار (version.txt) أحدث من النسخة المحلية،
		// حتى لو بقي اسم ملف اللوجو كما هو، سيُعاد تنزيله من جديد بدل الاعتماد على النسخة المخزنة مسبقاً على الجهاز
		// =======================================================
		final Runnable purgeLogoAssetCache = new Runnable() {
			@Override
			public void run() {
				try {
					android.content.SharedPreferences urlMapPrefs = MainActivity.this.getSharedPreferences("secured_images_url_map", android.content.Context.MODE_PRIVATE);
					android.content.SharedPreferences mimePrefs = MainActivity.this.getSharedPreferences("secured_images_mime", android.content.Context.MODE_PRIVATE);
					java.util.Map<String, ?> allEntries = urlMapPrefs.getAll();
					
					android.content.SharedPreferences.Editor urlEditor = urlMapPrefs.edit();
					android.content.SharedPreferences.Editor mimeEditor = mimePrefs.edit();
					boolean changed = false;
					
					for (java.util.Map.Entry<String, ?> entry : allEntries.entrySet()) {
						String fileName = entry.getKey();
						Object valObj = entry.getValue();
						String storedUrl = (valObj != null) ? valObj.toString() : "";
						
						// نستهدف فقط الملفات التي مصدرها مجلد لوجو التطبيق (app-assets/)
						if (storedUrl.toLowerCase().contains("app-assets/")) {
							java.io.File cachedFile = new java.io.File(baseLocalPath + fileName);
							if (cachedFile.exists()) cachedFile.delete();
							urlEditor.remove(fileName);
							mimeEditor.remove(fileName);
							changed = true;
						}
					}
					
					if (changed) {
						urlEditor.apply();
						mimeEditor.apply();
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		};
		
		// 🖼️ [جديد] دالة فتح home.html كالمعتاد (منفصلة لتُستدعى أيضاً من فحص splash.html بالأسفل)
		final Runnable openIndexHtmlFlow = new Runnable() {
			@Override
			public void run() {
				java.io.File localFile = new java.io.File(local_path);
				if (localFile.exists() && localFile.length() > 0) {
					dynamicWebView.loadUrl("file://" + local_path);
				} else {
					boolean copySuccess = false;
					try {
						java.io.InputStream in = MainActivity.this.getAssets().open("home.html");
						java.io.FileOutputStream out = new java.io.FileOutputStream(localFile);
						byte[] buffer = new byte[1024];
						int read;
						while ((read = in.read(buffer)) != -1) {
							out.write(buffer, 0, read);
						}
						in.close();
						out.flush();
						out.close();
						copySuccess = true;
					} catch (Exception e) { e.printStackTrace(); }
					
					if (copySuccess && localFile.exists() && localFile.length() > 0) {
						dynamicWebView.loadUrl("file://" + local_path);
					} else {
						load404Page.run();
					}
				}
			}
		};
		
		// =======================================================
		// 🔗 [جديد] تحميل صفحات HTML خارجية عبر app_linked_pages.json
		// الصيغة داخل الملف: { "الاسم_المحلي.html": "الرابط_الفعلي_لأي_صفحة" }
		// كل رابط يُحمَّل ويُحفظ محلياً باسمه المحلي (وليس باسمه الأصلي بالرابط)،
		// فيصبح href="الاسم_المحلي.html" يعمل أوفلاين تماماً كأنه من ملفات ASSET_BASE_HOST
		// [مُهم] هذه الدالة تُستدعى فقط من داخل performSaveAndFinish، أي فقط لما يتغيّر version.txt
		// بالضبط زي أي ملف تحديث عادي (بدون فحص "موجود من قبل" - نفس سلوك downloadAllSyncFiles تماماً،
		// فتُعاد كتابتها من جديد كل مرة يطلع فيها إصدار جديد، حتى لو الرابط الخارجي اتغيّر)
		// =======================================================
		final Runnable downloadLinkedPagesFlow = new Runnable() {
			@Override
			public void run() {
				RequestNetwork linkedPagesFetcher = new RequestNetwork(MainActivity.this);
				String linkedPagesUrl = ASSET_BASE_URL + "app_linked_pages.json";
				
				linkedPagesFetcher.startRequestNetwork(RequestNetworkController.GET, linkedPagesUrl, "linked_pages_sync", new RequestNetwork.RequestListener() {
					@Override
					public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
						if (response == null || response.trim().isEmpty() || response.contains("404")) return;
						
						try {
							org.json.JSONObject linkedPagesJson = new org.json.JSONObject(response);
							java.util.Iterator<String> keysIterator = linkedPagesJson.keys();
							
							while (keysIterator.hasNext()) {
								final String localPageName = keysIterator.next();
								final String remotePageUrl = linkedPagesJson.optString(localPageName, "");
								if (localPageName.isEmpty() || remotePageUrl.isEmpty()) continue;
								
								final java.io.File localPageFile = new java.io.File(baseLocalPath + localPageName);
								
								new Thread(new Runnable() {
									@Override
									public void run() {
										try {
											java.net.URL url = new java.net.URL(remotePageUrl);
											java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
											conn.setConnectTimeout(10000);
											conn.setReadTimeout(10000);
											conn.setInstanceFollowRedirects(true);
											conn.connect();
											
											if (conn.getResponseCode() == java.net.HttpURLConnection.HTTP_OK) {
												java.io.InputStream in = conn.getInputStream();
												java.io.FileOutputStream out = new java.io.FileOutputStream(localPageFile);
												byte[] buffer = new byte[4096];
												int read;
												while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
												in.close();
												out.flush();
												out.close();
											}
										} catch (Exception e) {
											e.printStackTrace();
										}
									}
								}).start();
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
					
					@Override
					public void onErrorResponse(String tag, String message) {}
				});
			}
		};
		
		final Runnable startNormalAppFlow = new Runnable() {
			@Override
			public void run() {
				// 1. فحص وجود splash.html: إن وُجد يتم فتحه مباشرة، وإلا يتم فتح home.html كالمعتاد
				final String splash_local_path = baseLocalPath + "splash.html";
				java.io.File splashFile = new java.io.File(splash_local_path);
				
				if (splashFile.exists() && splashFile.length() > 0) {
					// splash.html موجود مسبقاً في مساحة التخزين المحلية للتطبيق
					dynamicWebView.loadUrl("file://" + splash_local_path);
				} else {
					// لا يوجد splash.html محلياً، نتحقق إن كان موجوداً ضمن أصول التطبيق (assets)
					boolean splashCopySuccess = false;
					try {
						java.io.InputStream splashIn = MainActivity.this.getAssets().open("splash.html");
						java.io.FileOutputStream splashOut = new java.io.FileOutputStream(splashFile);
						byte[] splashBuffer = new byte[1024];
						int splashRead;
						while ((splashRead = splashIn.read(splashBuffer)) != -1) {
							splashOut.write(splashBuffer, 0, splashRead);
						}
						splashIn.close();
						splashOut.flush();
						splashOut.close();
						splashCopySuccess = true;
					} catch (Exception e) {
						// splash.html غير موجود ضمن assets، لا مشكلة - سيتم فتح home.html بدلاً منه
						splashCopySuccess = false;
					}
					
					if (splashCopySuccess && splashFile.exists() && splashFile.length() > 0) {
						dynamicWebView.loadUrl("file://" + splash_local_path);
					} else {
						// لا يوجد splash.html إطلاقاً (لا محلياً ولا في assets) -> فتح home.html مباشرة
						openIndexHtmlFlow.run();
					}
				}
				
				// 2. تنظيف ملفات HTML المفتقرة (المصدر الأساسي: apppages.json - بلا حدود طلبات، احتياطياً: GitHub API لو فشل)
				// [مُهم] قبل أي تنظيف، نجيب أسماء صفحات app_linked_pages.json ونستثنيها من الحذف
				// لأنها أصلاً مش موجودة في قائمة ملفات الـ repo (مصدرها رابط خارجي مختلف)، فكانت تنحذف فورًا كـ"ملف يتيم"
				RequestNetwork linkedNamesGuard = new RequestNetwork(MainActivity.this);
				String linkedNamesGuardUrl = ASSET_BASE_URL + "app_linked_pages.json";
				
				linkedNamesGuard.startRequestNetwork(RequestNetworkController.GET, linkedNamesGuardUrl, "linked_pages_guard", new RequestNetwork.RequestListener() {
					@Override
					public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
						final java.util.HashSet<String> protectedLinkedPageNames = new java.util.HashSet<>();
						if (response != null && !response.trim().isEmpty() && !response.contains("404")) {
							try {
								org.json.JSONObject linkedPagesJson = new org.json.JSONObject(response);
								java.util.Iterator<String> it = linkedPagesJson.keys();
								while (it.hasNext()) protectedLinkedPageNames.add(it.next());
							} catch (Exception e) { e.printStackTrace(); }
						}
						runHtmlCleanup(protectedLinkedPageNames);
					}
					
					@Override
					public void onErrorResponse(String tag, String message) {
						runHtmlCleanup(new java.util.HashSet<String>());
					}
					
					private void runHtmlCleanup(final java.util.HashSet<String> protectedLinkedPageNames) {
						RequestNetwork htmlCleanerAp = new RequestNetwork(MainActivity.this);
						htmlCleanerAp.startRequestNetwork(RequestNetworkController.GET, APP_PAGES_URL, "clean_html_files_ap", new RequestNetwork.RequestListener() {
							@Override
							public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
								java.util.HashSet<String> currentFiles = new java.util.HashSet<>();
								boolean appPagesOk = false;
								
								if (response != null && !response.trim().isEmpty() && !response.trim().equalsIgnoreCase("null") && !response.contains("404")) {
									try {
										org.json.JSONObject pagesJson = new org.json.JSONObject(response);
										java.util.Iterator<String> it = pagesJson.keys();
										while (it.hasNext()) currentFiles.add(it.next().trim());
										appPagesOk = true;
									} catch (Exception e) { e.printStackTrace(); }
								}
								
								if (appPagesOk) {
									cleanupLocalHtmlFiles(currentFiles);
								} else {
									runGithubHtmlCleanupFallback();
								}
							}
							
							@Override
							public void onErrorResponse(String tag, String message) {
								runGithubHtmlCleanupFallback();
							}
							
							private void cleanupLocalHtmlFiles(java.util.HashSet<String> keepFiles) {
								try {
									java.io.File localDir = new java.io.File(baseLocalPath);
									java.io.File[] localFiles = localDir.listFiles();
									
									if (localFiles != null) {
										boolean removedAny = false;
										for (java.io.File file : localFiles) {
											String name = file.getName();
											if (name.toLowerCase().endsWith(".html")) {
												if (!keepFiles.contains(name) && !protectedLinkedPageNames.contains(name)) {
													file.delete();
													removedAny = true;
												}
											}
										}
										
										if (removedAny) {
											runOnUiThread(new Runnable() {
												@Override
												public void run() { dynamicWebView.clearCache(true); }
											});
										}
									}
								} catch (Exception e) { e.printStackTrace(); }
							}
							
							private void runGithubHtmlCleanupFallback() {
								RequestNetwork htmlCleanerGh = new RequestNetwork(MainActivity.this);
								String apiUrlGh = "https://api.github.com/repos/" + GITHUB_USER + "/" + GITHUB_REPO + "/contents";
								
								htmlCleanerGh.startRequestNetwork(RequestNetworkController.GET, apiUrlGh, "clean_html_files_gh", new RequestNetwork.RequestListener() {
									@Override
									public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
										if (response == null || response.contains("\"message\":\"Not Found\"")) return;
										
										try {
											java.util.HashSet<String> githubHtmlFiles = new java.util.HashSet<>();
											String[] items = response.split("\\{");
											
											for (String item : items) {
												if (item.contains("\"name\"") && item.contains("\"type\":\"file\"")) {
													int nameIndex = item.indexOf("\"name\"");
													int start = item.indexOf("\"", nameIndex + 6) + 1;
													int end = item.indexOf("\"", start);
													String fileName = item.substring(start, end);
													
													githubHtmlFiles.add(fileName.trim());
												}
											}
											
											java.io.File localDir = new java.io.File(baseLocalPath);
											java.io.File[] localFiles = localDir.listFiles();
											
											if (localFiles != null) {
												boolean removedAny = false;
												for (java.io.File file : localFiles) {
													String name = file.getName();
													if (name.toLowerCase().endsWith(".html")) {
														if (!githubHtmlFiles.contains(name) && !protectedLinkedPageNames.contains(name)) {
															file.delete();
															removedAny = true;
														}
													}
												}
												
												if (removedAny) {
													runOnUiThread(new Runnable() {
														@Override
														public void run() { dynamicWebView.clearCache(true); }
													});
												}
											}
										} catch (Exception e) { e.printStackTrace(); }
									}
									
									@Override
									public void onErrorResponse(String tag, String message) {}
								});
							}
						});
					}
				});
				
				// 3. التحقق من تحديثات الإصدار والتنزيل
				final android.app.ProgressDialog progressDialog = new android.app.ProgressDialog(MainActivity.this);
				progressDialog.setMessage("جاري تحديث المكتبات والصور الشاملة...");
				progressDialog.setProgressStyle(android.app.ProgressDialog.STYLE_HORIZONTAL);
				progressDialog.setCancelable(false);
				
				final android.content.SharedPreferences sp = MainActivity.this.getSharedPreferences("app_version_pref", android.content.Context.MODE_PRIVATE);
				final String localVersion = sp.getString("current_version", "0");
				
				RequestNetwork versionChecker = new RequestNetwork(MainActivity.this);
				String versionUrl = ASSET_BASE_URL + "version.txt";
				
				versionChecker.startRequestNetwork(RequestNetworkController.GET, versionUrl, "version_tag", new RequestNetwork.RequestListener() {
					@Override
					public void onResponse(String tag, final String onlineVersionResponse, java.util.HashMap<String, Object> responseHeaders) {
						if (onlineVersionResponse == null || onlineVersionResponse.trim().isEmpty() || onlineVersionResponse.contains("404: Not Found") || onlineVersionResponse.contains("Not Found")) return;
						
						final String cleanOnlineVersion = onlineVersionResponse.trim();
						if (cleanOnlineVersion.equals(localVersion)) return;
						
						// [جديد] بمجرد اكتشاف إصدار مختلف عن المخزن محلياً، أبطل نسخة اللوجو المخزنة مؤقتاً
						// كي يُعاد تحميلها من جديد بدل بقائها ثابتة على أول تحميلة لها
						purgeLogoAssetCache.run();
						
						runOnUiThread(new Runnable() {
							@Override
							public void run() { progressDialog.show(); }
						});
						
						RequestNetwork updater = new RequestNetwork(MainActivity.this);
						String indexUrl = ASSET_BASE_URL + "home.html";
						
						updater.startRequestNetwork(RequestNetworkController.GET, indexUrl, "update_tag", new RequestNetwork.RequestListener() {
							@Override
							public void onResponse(String tag, final String indexResponse, java.util.HashMap<String, Object> responseHeaders) {
								if (indexResponse == null || indexResponse.trim().isEmpty() || indexResponse.contains("404: Not Found") || indexResponse.contains("Not Found")) {
									try {
										java.io.File fileToDel = new java.io.File(local_path);
										if (fileToDel.exists()) fileToDel.delete();
										sp.edit().putString("current_version", "0").apply();
									} catch (Exception e) { e.printStackTrace(); }
									
									runOnUiThread(new Runnable() {
										@Override
										public void run() {
											if (progressDialog.isShowing()) progressDialog.dismiss();
											dynamicWebView.clearCache(true);
											load404Page.run();
										}
									});
									return;
								}
								
								// قائمة الملفات لمزامنتها: نحاول أولاً apppages.json (مصدر واحد بلا حدود طلبات)، ولو فشل نرجع لـ GitHub API كاحتياطي
								RequestNetwork listUpdaterAp = new RequestNetwork(MainActivity.this);
								
								listUpdaterAp.startRequestNetwork(RequestNetworkController.GET, APP_PAGES_URL, "list_tag_ap", new RequestNetwork.RequestListener() {
									@Override
									public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
										final java.util.ArrayList<String> allFilesToSync = new java.util.ArrayList<>();
										boolean appPagesOk = false;
										
										if (response != null && !response.trim().isEmpty() && !response.trim().equalsIgnoreCase("null") && !response.contains("404")) {
											try {
												org.json.JSONObject pagesJson = new org.json.JSONObject(response);
												java.util.Iterator<String> it = pagesJson.keys();
												while (it.hasNext()) {
													String fileName = it.next();
													if (!fileName.startsWith(".") && !fileName.equalsIgnoreCase("README.md")) {
														allFilesToSync.add(fileName);
													}
												}
												appPagesOk = true;
											} catch (Exception e) { e.printStackTrace(); }
										}
										
										if (appPagesOk) {
											downloadAllSyncFiles(allFilesToSync, indexResponse, local_path, cleanOnlineVersion, sp, progressDialog);
										} else {
											runGithubFileListFallback();
										}
									}
									
									@Override
									public void onErrorResponse(String tag, String message) {
										runGithubFileListFallback();
									}
									
									private void runGithubFileListFallback() {
										RequestNetwork listUpdater = new RequestNetwork(MainActivity.this);
										String apiUrl = "https://api.github.com/repos/" + GITHUB_USER + "/" + GITHUB_REPO + "/contents";
										
										listUpdater.startRequestNetwork(RequestNetworkController.GET, apiUrl, "list_tag", new RequestNetwork.RequestListener() {
											@Override
											public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
												if (response == null || response.contains("\"message\":\"Not Found\"")) return;
												
												try {
													final java.util.ArrayList<String> allFilesToSync = new java.util.ArrayList<>();
													String[] items = response.split("\\{");
													
													for (String item : items) {
														if (item.contains("\"name\"") && item.contains("\"type\":\"file\"")) {
															int nameIndex = item.indexOf("\"name\"");
															int start = item.indexOf("\"", nameIndex + 6) + 1;
															int end = item.indexOf("\"", start);
															String fileName = item.substring(start, end);
															
															if (!fileName.startsWith(".") && !fileName.equalsIgnoreCase("README.md")) {
																allFilesToSync.add(fileName);
															}
														}
													}
													
													downloadAllSyncFiles(allFilesToSync, indexResponse, local_path, cleanOnlineVersion, sp, progressDialog);
												} catch (Exception e) { e.printStackTrace(); }
											}
											
											@Override
											public void onErrorResponse(String tag, String message) {}
										});
									}
								});
							}
							
							@Override
							public void onErrorResponse(String tag, String message) {
								runOnUiThread(new Runnable() {
									@Override
									public void run() { if (progressDialog.isShowing()) progressDialog.dismiss(); }
								});
							}
						});
					}
					
					@Override
					public void onErrorResponse(String tag, String message) {}
					
					/* دالة مشتركة تُستدعى بقائمة أسماء الملفات (سواء جاءت من apppages.json أو من GitHub API كاحتياطي)
               وتقوم بتحميل كل ملف من Cloudflare Worker (أو raw.githubusercontent.com لو Worker غير مُفعّل) */
					private void downloadAllSyncFiles(final java.util.ArrayList<String> allFilesToSync, final String indexResponse, final String local_path, final String cleanOnlineVersion, final android.content.SharedPreferences sp, final android.app.ProgressDialog progressDialog) {
						final int totalFiles = allFilesToSync.size();
						if (totalFiles == 0) {
							performSaveAndFinish(indexResponse, local_path, cleanOnlineVersion, sp, progressDialog);
							return;
						}
						
						final java.util.concurrent.atomic.AtomicInteger downloadedCount = new java.util.concurrent.atomic.AtomicInteger(0);
						final java.util.ArrayList<String> htmlContentsList = new java.util.ArrayList<>();
						htmlContentsList.add(indexResponse);
						
						for (final String fileName : allFilesToSync) {
							String lowerFileName = fileName.toLowerCase();
							boolean isMediaFile = lowerFileName.endsWith(".mp4") || lowerFileName.endsWith(".webm") || lowerFileName.endsWith(".ogg")
							|| lowerFileName.endsWith(".mp3") || lowerFileName.endsWith(".wav") || lowerFileName.endsWith(".mov")
							|| lowerFileName.endsWith(".avi") || lowerFileName.endsWith(".mkv") || lowerFileName.endsWith(".m4a");
							
							if (fileName.equalsIgnoreCase("home.html") || fileName.equalsIgnoreCase("version.txt") || isMediaFile) {
								int count = downloadedCount.incrementAndGet();
								if (count == totalFiles) scanAndDownloadAllAssetsDeep(htmlContentsList, indexResponse, local_path, cleanOnlineVersion, sp, progressDialog);
								continue;
							}
							
							RequestNetwork fileDownloader = new RequestNetwork(MainActivity.this);
							String rawUrl = ASSET_BASE_URL + fileName;
							
							fileDownloader.startRequestNetwork(RequestNetworkController.GET, rawUrl, "sync_" + fileName, new RequestNetwork.RequestListener() {
								@Override
								public void onResponse(String tag, String fileResponse, java.util.HashMap<String, Object> fileHeaders) {
									if (fileResponse != null && !fileResponse.contains("404: Not Found")) {
										try {
											java.io.File targetFile = new java.io.File(baseLocalPath + fileName);
											java.io.FileWriter writer = new java.io.FileWriter(targetFile);
											writer.write(fileResponse);
											writer.flush();
											writer.close();
											
											if (fileName.toLowerCase().endsWith(".html")) {
												synchronized(htmlContentsList) { htmlContentsList.add(fileResponse); }
											}
										} catch (Exception e) { e.printStackTrace(); }
									}
									int count = downloadedCount.incrementAndGet();
									if (count == totalFiles) scanAndDownloadAllAssetsDeep(htmlContentsList, indexResponse, local_path, cleanOnlineVersion, sp, progressDialog);
								}
								
								@Override
								public void onErrorResponse(String tag, String message) {
									int count = downloadedCount.incrementAndGet();
									if (count == totalFiles) scanAndDownloadAllAssetsDeep(htmlContentsList, indexResponse, local_path, cleanOnlineVersion, sp, progressDialog);
								}
							});
						}
					}
					
					private void performSaveAndFinish(String data, final String filePath, String newVersion, android.content.SharedPreferences prefs, final android.app.ProgressDialog dialog) {
						try {
							java.io.File file = new java.io.File(filePath);
							java.io.FileWriter writer = new java.io.FileWriter(file);
							writer.write(data);
							writer.flush();
							writer.close();
							
							prefs.edit().putString("current_version", newVersion).apply();
							
							// [جديد] نفس لحظة اكتشاف/حفظ الإصدار الجديد بالضبط -> حدّث صفحات app_linked_pages.json كمان
							downloadLinkedPagesFlow.run();
							
							runOnUiThread(new Runnable() {
								@Override
								public void run() {
									if (dialog != null && dialog.isShowing()) dialog.dismiss();
									dynamicWebView.loadUrl("file://" + filePath);
									SketchwareUtil.showMessage(getApplicationContext(), "تم التحديث الشامل بنجاح!");
								}
							});
						} catch (Exception e) { e.printStackTrace(); }
					}
					
					private void scanAndDownloadAllAssetsDeep(java.util.ArrayList<String> pagesContent, final String indexData, final String path, final String newVersion, final android.content.SharedPreferences sharedPrefs, final android.app.ProgressDialog dialog) {
						final java.util.HashSet<String> urlsToDownloadSet = new java.util.HashSet<>();
						final java.util.ArrayList<String> cssUrlsToFetch = new java.util.ArrayList<>();
						final String baseUrl = ASSET_BASE_URL;
						
						java.util.regex.Pattern htmlPattern = java.util.regex.Pattern.compile("(?i)(?:src|srcset|href)\\s*=\\s*['\"]([^'\"]+)['\"]|url\\(['\"]?([^'\")]+)['\"]?\\)");
						
						for (String htmlContent : pagesContent) {
							if (htmlContent == null) continue;
							java.util.regex.Matcher matcher = htmlPattern.matcher(htmlContent);
							
							while (matcher.find()) {
								String rawPath = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
								if (rawPath != null) {
									String fullUrl = rawPath.trim();
									if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://") && !fullUrl.startsWith("data:")) {
										String cleanPath = fullUrl.replace("../", "").replace("./", "");
										if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
										fullUrl = baseUrl + cleanPath;
									}
									
									String lowerUrl = fullUrl.toLowerCase();
									String cleanUrlForExt = lowerUrl.split("\\?")[0].split("#")[0];
									
									if (cleanUrlForExt.endsWith(".css") || lowerUrl.contains(".css") || lowerUrl.contains("bootstrap")) {
										cssUrlsToFetch.add(fullUrl);
									}
									
									if (cleanUrlForExt.endsWith(".jpg") || cleanUrlForExt.endsWith(".jpeg") || cleanUrlForExt.endsWith(".png") 
									|| cleanUrlForExt.endsWith(".webp") || cleanUrlForExt.endsWith(".gif") || cleanUrlForExt.endsWith(".svg")
									|| cleanUrlForExt.endsWith(".css") || cleanUrlForExt.endsWith(".js") || cleanUrlForExt.endsWith(".woff")
									|| cleanUrlForExt.endsWith(".woff2") || cleanUrlForExt.endsWith(".ttf") || cleanUrlForExt.endsWith(".eot")
									|| lowerUrl.contains("giphy") || lowerUrl.contains("unpkg") || lowerUrl.contains("cdn") 
									|| lowerUrl.contains("jsdelivr") || lowerUrl.contains("cdnjs") || lowerUrl.contains("bootstrap")) {
										
										urlsToDownloadSet.add(fullUrl);
									}
								}
							}
						}
						
						new Thread(new Runnable() {
							@Override
							public void run() {
								java.util.regex.Pattern cssPattern = java.util.regex.Pattern.compile("(?i)url\\s*\\(\\s*['\"]?([^'\")]+)['\"]?\\s*\\)");
								
								for (String cssUrl : cssUrlsToFetch) {
									try {
										java.net.URL url = new java.net.URL(cssUrl);
										java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
										conn.setConnectTimeout(6000);
										conn.setReadTimeout(6000);
										
										if (conn.getResponseCode() == java.net.HttpURLConnection.HTTP_OK) {
											java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), "UTF-8"));
											java.lang.StringBuilder sb = new java.lang.StringBuilder();
											String line;
											while ((line = reader.readLine()) != null) sb.append(line).append("\n");
											reader.close();
											
											java.util.regex.Matcher cssMatcher = cssPattern.matcher(sb.toString());
											while (cssMatcher.find()) {
												String fontPath = cssMatcher.group(1);
												if (fontPath != null) {
													fontPath = fontPath.trim();
													if (fontPath.startsWith("data:")) continue;
													
													String fullFontUrl = fontPath;
													if (!fontPath.startsWith("http://") && !fontPath.startsWith("https://")) {
														String baseCssDir = cssUrl.substring(0, cssUrl.lastIndexOf("/") + 1);
														if (fontPath.startsWith("./")) fontPath = fontPath.substring(2);
														while (fontPath.startsWith("../")) {
															fontPath = fontPath.substring(3);
															if (baseCssDir.endsWith("/")) baseCssDir = baseCssDir.substring(0, baseCssDir.length() - 1);
															baseCssDir = baseCssDir.substring(0, baseCssDir.lastIndexOf("/") + 1);
														}
														fullFontUrl = baseCssDir + fontPath;
													}
													urlsToDownloadSet.add(fullFontUrl);
												}
											}
										}
									} catch (Exception e) { e.printStackTrace(); }
								}
								startFinalDownload(urlsToDownloadSet, indexData, path, newVersion, sharedPrefs, dialog);
							}
						}).start();
					}
					
					private void startFinalDownload(java.util.HashSet<String> finalUrls, final String indexData, final String path, final String newVersion, final android.content.SharedPreferences sharedPrefs, final android.app.ProgressDialog dialog) {
						if (finalUrls.isEmpty()) {
							performSaveAndFinish(indexData, path, newVersion, sharedPrefs, dialog);
							return;
						}
						
						final java.util.ArrayList<String> downloadList = new java.util.ArrayList<>(finalUrls);
						final int totalItems = downloadList.size();
						final java.util.concurrent.atomic.AtomicInteger itemsDownloaded = new java.util.concurrent.atomic.AtomicInteger(0);
						
						for (final String downloadUrlString : downloadList) {
							try {
								String lowerUrl = downloadUrlString.toLowerCase();
								String cleanUrlForExt = lowerUrl.split("\\?")[0].split("#")[0];
								String localPathName;
								
								if (cleanUrlForExt.endsWith(".css") || cleanUrlForExt.endsWith(".js") || cleanUrlForExt.endsWith(".woff2") 
								|| cleanUrlForExt.endsWith(".woff") || cleanUrlForExt.endsWith(".ttf") || cleanUrlForExt.endsWith(".eot")) {
									
									String ext = ".css";
									if (cleanUrlForExt.endsWith(".woff2") || lowerUrl.contains(".woff2")) ext = ".woff2";
									else if (cleanUrlForExt.endsWith(".woff") || lowerUrl.contains(".woff")) ext = ".woff";
									else if (cleanUrlForExt.endsWith(".ttf") || lowerUrl.contains(".ttf")) ext = ".ttf";
									else if (cleanUrlForExt.endsWith(".js") || lowerUrl.contains(".js")) ext = ".js";
									
									localPathName = "static_" + Math.abs(downloadUrlString.hashCode()) + ext;
								} else {
									localPathName = "img_secured_" + Math.abs(downloadUrlString.hashCode());
								}
								
								String localImgPath = MainActivity.this.getApplicationContext().getFilesDir().getAbsolutePath() + "/" + localPathName;
								java.io.File file = new java.io.File(localImgPath);
								
								if (file.exists() && file.length() > 0) {
									int count = itemsDownloaded.incrementAndGet();
									if (count == totalItems) performSaveAndFinish(indexData, path, newVersion, sharedPrefs, dialog);
									continue;
								}
								
								java.net.URL url = new java.net.URL(downloadUrlString);
								java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
								conn.setConnectTimeout(8000);
								conn.setReadTimeout(8000);
								conn.connect();
								
								if (conn.getResponseCode() == java.net.HttpURLConnection.HTTP_OK) {
									java.io.InputStream in = conn.getInputStream();
									java.io.FileOutputStream out = new java.io.FileOutputStream(file);
									byte[] buffer = new byte[4096];
									int read;
									while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
									in.close();
									out.flush();
									out.close();
								}
							} catch (Exception e) { e.printStackTrace(); }
							
							int count = itemsDownloaded.incrementAndGet();
							if (count == totalItems) performSaveAndFinish(indexData, path, newVersion, sharedPrefs, dialog);
						}
					}
				});
			}
		};
		
		// =======================================================
		// ⚡ الخطوة الحاسمـة: فحص app_status.json أونلاين أولاً بالكامل
		// =======================================================
		RequestNetwork appStatusChecker = new RequestNetwork(MainActivity.this);
		String appStatusUrl = ASSET_BASE_URL + "app_status.json";
		
		// === [جديد] حارس زمني (Watchdog) لمنع الشاشة البيضاء عند الاتصال بشبكة بلا إنترنت فعلي (راوتر/أرضي بلا إنترنت)
		// المشكلة: إذا كان الجهاز متصلاً بشبكة (واي فاي/راوتر) بلا إنترنت فعلي، يعتقد أندرويد أن هناك اتصالاً
		// فتحاول مكتبة RequestNetwork الاتصال الفعلي بالخادم دون مهلة زمنية محددة، فقد ينتظر onResponse/onErrorResponse
		// لفترة طويلة جداً (أو غير محددة)، وخلال هذه الفترة لا يُعرض أي محتوى في الـ WebView -> شاشة بيضاء
		// الحل: مؤقّت احتياطي مدته 5 ثوانٍ فقط، أيهما يصل أولاً (رد الشبكة الحقيقي أو انتهاء المؤقّت) هو من يقرر
		final boolean[] appStatusHandled = {false};
		final Object appStatusLock = new Object();
		
		new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(new Runnable() {
			@Override
			public void run() {
				boolean shouldProceed = false;
				synchronized (appStatusLock) {
					if (!appStatusHandled[0]) {
						appStatusHandled[0] = true;
						shouldProceed = true;
					}
				}
				if (shouldProceed) {
					// لم يصل أي رد من الشبكة خلال 5 ثوانٍ (على الأغلب شبكة متصلة بلا إنترنت فعلي)
					// -> افحص الملف المحلي المحفوظ مسبقاً (نفس منطق onErrorResponse تماماً) ثم تابع بشكل طبيعي فوراً
					try {
						java.io.File statusFile = new java.io.File(baseLocalPath + "app_status.json");
						if (statusFile.exists() && statusFile.length() > 0) {
							java.io.FileInputStream fis = new java.io.FileInputStream(statusFile);
							java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(fis, "UTF-8"));
							StringBuilder sb = new StringBuilder();
							String line;
							while ((line = reader.readLine()) != null) sb.append(line);
							reader.close();
							fis.close();
							
							org.json.JSONObject json = new org.json.JSONObject(sb.toString());
							boolean isClosed = json.optBoolean("is_closed", false);
							boolean isMaintenance = json.optBoolean("is_maintenance", false);
							
							if (isClosed || isMaintenance) {
								displayAppStatusScreen.run();
								return;
							}
						}
					} catch (Exception e) { e.printStackTrace(); }
					
					startNormalAppFlow.run();
				}
			}
		}, 5000);
		
		appStatusChecker.startRequestNetwork(RequestNetworkController.GET, appStatusUrl, "app_status_check", new RequestNetwork.RequestListener() {
			@Override
			public void onResponse(String tag, String response, java.util.HashMap<String, Object> responseHeaders) {
				boolean alreadyHandled;
				synchronized (appStatusLock) {
					alreadyHandled = appStatusHandled[0];
					if (!alreadyHandled) appStatusHandled[0] = true;
				}
				// المؤقّت الاحتياطي سبقنا وتصرّف بالفعل (على الأرجح شبكة كانت بطيئة جداً) -> تجاهل هذا الرد المتأخر
				if (alreadyHandled) return;
				
				final String finalResponse = response;
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						if (finalResponse != null && !finalResponse.trim().isEmpty() && !finalResponse.contains("404")) {
							try {
								// 1. حفظ الملف محلياً
								java.io.File statusFile = new java.io.File(baseLocalPath + "app_status.json");
								java.io.FileWriter writer = new java.io.FileWriter(statusFile);
								writer.write(finalResponse);
								writer.flush();
								writer.close();
								
								// 2. تحليل الكود بدقة حسب صيغة JSON الخاصة بك
								org.json.JSONObject json = new org.json.JSONObject(finalResponse);
								boolean isClosed = json.optBoolean("is_closed", false);
								boolean isMaintenance = json.optBoolean("is_maintenance", false);
								
								if (isClosed || isMaintenance) {
									// التطبيق إما مغلق أو تحت الصيانة -> عرض الشاشة وإيقاف كل شيء
									displayAppStatusScreen.run();
									return;
								}
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
						
						// إذا كان التطبيق سليم ويعمل (is_closed = false و is_maintenance = false)
						startNormalAppFlow.run();
					}
				});
			}
			
			@Override
			public void onErrorResponse(String tag, String message) {
				boolean alreadyHandled;
				synchronized (appStatusLock) {
					alreadyHandled = appStatusHandled[0];
					if (!alreadyHandled) appStatusHandled[0] = true;
				}
				// المؤقّت الاحتياطي سبقنا وتصرّف بالفعل -> تجاهل هذا الرد المتأخر
				if (alreadyHandled) return;
				
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						// في حال عدم وجود إنترنت، افحص الملف المحفوظ محلياً أوفلاين
						try {
							java.io.File statusFile = new java.io.File(baseLocalPath + "app_status.json");
							if (statusFile.exists() && statusFile.length() > 0) {
								java.io.FileInputStream fis = new java.io.FileInputStream(statusFile);
								java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(fis, "UTF-8"));
								StringBuilder sb = new StringBuilder();
								String line;
								while ((line = reader.readLine()) != null) sb.append(line);
								reader.close();
								fis.close();
								
								org.json.JSONObject json = new org.json.JSONObject(sb.toString());
								boolean isClosed = json.optBoolean("is_closed", false);
								boolean isMaintenance = json.optBoolean("is_maintenance", false);
								
								if (isClosed || isMaintenance) {
									displayAppStatusScreen.run();
									return;
								}
							}
						} catch (Exception e) { e.printStackTrace(); }
						
						// إذا لم يكن مغلقاً أوفلاين، استمر بالعمل العادي
						startNormalAppFlow.run();
					}
				});
			}
		});
		
		// === [إضافة جديدة] لو التطبيق اتفتح من الضغط على إشعار تحميل الوسائط، انتقل للصفحة اللي كان يحمّل منها المستخدم
		// ملاحظة: التأخير البسيط هنا مقصود، لضمان إن هذا الانتقال يصير بعد اكتمال التحميل التلقائي الأولي لملف home.html بالأعلى (غير متزامن)
		final String targetPageUrlFromNotification = getIntent() != null ? getIntent().getStringExtra("target_page_url") : null;
		if (targetPageUrlFromNotification != null && !targetPageUrlFromNotification.isEmpty()) {
			new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(new Runnable() {
				@Override
				public void run() {
					dynamicWebView.loadUrl(targetPageUrlFromNotification);
				}
			}, 1200);
		}
	}
	
	@Override
	protected void onActivityResult(int _requestCode, int _resultCode, Intent _data) {
		super.onActivityResult(_requestCode, _resultCode, _data);
		// تمرير أي ملف مختار تلقائياً وباسم ونوع الملف الأصلي دون تقييد
		Object tag = getWindow().getDecorView().getTag();
		if (tag instanceof android.webkit.ValueCallback[]) {
			android.webkit.ValueCallback<android.net.Uri[]>[] rawContainer = (android.webkit.ValueCallback[]) tag;
			
			int actualRequestCode = 0;
			int actualResultCode = 0;
			android.content.Intent actualData = null;
			
			// جلب المتغيرات من بيئة سكتشوير ديناميكياً
			try { actualRequestCode = _requestCode; } catch (Exception e) { 
				try { java.lang.reflect.Field f = MainActivity.this.getClass().getDeclaredField("requestCode"); f.setAccessible(true); actualRequestCode = (int) f.get(MainActivity.this); } catch(Exception ex){}
			}
			try { actualResultCode = _resultCode; } catch (Exception e) {
				try { java.lang.reflect.Field f = MainActivity.this.getClass().getDeclaredField("resultCode"); f.setAccessible(true); actualResultCode = (int) f.get(MainActivity.this); } catch(Exception ex){}
			}
			try { actualData = _data; } catch (Exception e) {
				try { java.lang.reflect.Field f = MainActivity.this.getClass().getDeclaredField("data"); f.setAccessible(true); actualData = (android.content.Intent) f.get(MainActivity.this); } catch(Exception ex){}
			}
			
			if (rawContainer[0] != null) {
				android.net.Uri[] results = null;
				
				if (actualResultCode == android.app.Activity.RESULT_OK && actualData != null) {
					// 1. في حال اختيار عدة ملفات معاً
					if (actualData.getClipData() != null) {
						int count = actualData.getClipData().getItemCount();
						results = new android.net.Uri[count];
						for (int i = 0; i < count; i++) {
							results[i] = actualData.getClipData().getItemAt(i).getUri();
						}
					} 
					// 2. في حال اختيار ملف واحد (يتم أخذ الـ Uri الخاص بالملف الأصلي كما هو)
					else if (actualData.getData() != null) {
						results = new android.net.Uri[]{ actualData.getData() };
					}
				}
				
				// إرسال النتيجة للـ WebView (سواء كان ملفاً أو null في حال الإلغاء) لفك التجميد عن زر الـ HTML
				rawContainer[0].onReceiveValue(results);
				rawContainer[0] = null;
			}
		}
		switch (_requestCode) {
			
			default:
			break;
		}
	}
	
	@Override
	public void onBackPressed() {
		// البحث عن الـ WebView في الشاشة من خلال الرقم التعريفي الخاص به
		android.webkit.WebView myWebView = (android.webkit.WebView) findViewById(99999);
		
		// === [إضافة جديدة] لو فيه فيديو/عنصر بوضع ملء الشاشة (Fullscreen) شغال حالياً، اخرج منه فقط ولا تكمل لأي منطق ثاني
		if (myWebView != null) {
			android.view.ViewParent parentObj = myWebView.getParent();
			if (parentObj instanceof android.widget.FrameLayout) {
				android.widget.FrameLayout parentFrame = (android.widget.FrameLayout) parentObj;
				
				if (parentFrame.getChildCount() > 1) {
					android.view.View extraView = parentFrame.getChildAt(parentFrame.getChildCount() - 1);
					
					// استرجاع الـ callback المخزّن كـ tag على العنصر نفسه (نفس الـ callback اللي مرره WebChromeClient بـ onCreate)
					Object tagObj = extraView.getTag();
					if (tagObj instanceof android.webkit.WebChromeClient.CustomViewCallback) {
						((android.webkit.WebChromeClient.CustomViewCallback) tagObj).onCustomViewHidden();
					}
					
					parentFrame.removeView(extraView);
					myWebView.setVisibility(android.view.View.VISIBLE);
					
					// استرجاع أشرطة النظام لوضعها الطبيعي
					MainActivity.this.getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
					MainActivity.this.getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
					
					return; // توقف هنا - المستخدم خرج من ملء الشاشة بس، ما نرجع صفحة ولا نطلع من التطبيق
				}
			}
		}
		
		// === [جديد] رجوع ذكي يعتمد على سجل تصفح مُنظّف من التكرار (Smart Back Stack) بدل سجل WebView الافتراضي
		// الفكرة: onPageFinished بـ onCreate يخزّن كل صفحة تتم زيارتها، ولو رجعت لصفحة زرتها من قبل بنفس الجلسة
		// يتم "قص" كل اللي بعدها تلقائياً، فما يصير عندك تكرار مزعج بالرجوع خطوة خطوة عبر نفس الحلقة
		try {
			android.content.SharedPreferences backStackPrefs = MainActivity.this.getSharedPreferences("smart_back_stack", android.content.Context.MODE_PRIVATE);
			org.json.JSONArray backStackArray = new org.json.JSONArray(backStackPrefs.getString("stack", "[]"));
			
			if (backStackArray.length() > 1) {
				// احذف الصفحة الحالية (آخر عنصر بالسجل) وخذ اللي قبلها مباشرة كوجهة الرجوع
				backStackArray.remove(backStackArray.length() - 1);
				String previousUrl = backStackArray.optString(backStackArray.length() - 1, "");
				
				backStackPrefs.edit().putString("stack", backStackArray.toString()).apply();
				
				if (myWebView != null && previousUrl != null && !previousUrl.trim().isEmpty()) {
					myWebView.loadUrl(previousUrl);
				} else {
					finish();
				}
			} else {
				// ما فيه صفحة سابقة ذات معنى بالسجل الذكي -> اخرج من التطبيق بأمان
				finish();
			}
		} catch (Exception e) {
			e.printStackTrace();
			// خط دفاع أخير في حال أي خطأ غير متوقع: ارجع لسلوك WebView الافتراضي
			if (myWebView != null && myWebView.canGoBack()) {
				myWebView.goBack();
			} else {
				finish();
			}
		}
	}
}