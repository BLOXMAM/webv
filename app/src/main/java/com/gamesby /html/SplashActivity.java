package com.gamesby.html;

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
import android.widget.*;
import com.gamesby.html.databinding.*;
import com.scottyab.rootbeer.*;
import java.io.*;
import java.text.*;
import java.util.*;
import java.util.regex.*;
import org.json.*;

public class SplashActivity extends Activity {
	
	private SplashBinding binding;
	
	@Override
	protected void onCreate(Bundle _savedInstanceState) {
		super.onCreate(_savedInstanceState);
		try {
			binding = SplashBinding.inflate(getLayoutInflater());
			setContentView(binding.getRoot());
			initialize(_savedInstanceState);
			initializeLogic();
		} catch (Throwable e) {
			showCrashDialog(e);
		}
	}
	
	private void initialize(Bundle _savedInstanceState) {
	}
	
	private void initializeLogic() {
		// تم تعطيل فحص الروت مؤقتاً للتجربة
		android.content.Intent intent = new android.content.Intent(SplashActivity.this, MainActivity.class);
		startActivity(intent);
		finish();
	}
	
	private void showCrashDialog(Throwable e) {
		java.io.StringWriter sw = new java.io.StringWriter();
		e.printStackTrace(new java.io.PrintWriter(sw));
		final String trace = sw.toString();
		android.widget.TextView tv = new android.widget.TextView(this);
		tv.setText(trace);
		tv.setTextIsSelectable(true);
		tv.setPadding(24,24,24,24);
		android.widget.ScrollView scroll = new android.widget.ScrollView(this);
		scroll.addView(tv);
		new android.app.AlertDialog.Builder(this)
			.setTitle("Crash Log")
			.setView(scroll)
			.setCancelable(false)
			.setPositiveButton("OK", null)
			.show();
	}
	
}
