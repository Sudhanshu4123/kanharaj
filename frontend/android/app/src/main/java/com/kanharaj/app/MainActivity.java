package com.kanharaj.app;

import android.animation.ObjectAnimator;
import android.os.Bundle;
import android.view.View;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        // Add exit animation (Motion effect like Housing/Google apps)
        splashScreen.setOnExitAnimationListener(splashScreenView -> {
            // Create a scale up animation for the icon
            final ObjectAnimator scaleX = ObjectAnimator.ofFloat(
                    splashScreenView.getIconView(),
                    View.SCALE_X,
                    1f,
                    1.2f
            );
            final ObjectAnimator scaleY = ObjectAnimator.ofFloat(
                    splashScreenView.getIconView(),
                    View.SCALE_Y,
                    1f,
                    1.2f
            );
            // Create a fade out animation for the whole splash screen
            final ObjectAnimator alpha = ObjectAnimator.ofFloat(
                    splashScreenView.getView(),
                    View.ALPHA,
                    1f,
                    0f
            );

            scaleX.setDuration(400L);
            scaleY.setDuration(400L);
            alpha.setDuration(400L);

            // Using AccelerateInterpolator for a smooth "flying out" feel
            scaleX.setInterpolator(new android.view.animation.AccelerateInterpolator());
            scaleY.setInterpolator(new android.view.animation.AccelerateInterpolator());

            scaleX.start();
            scaleY.start();
            alpha.start();

            scaleX.addListener(new android.animation.AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(android.animation.Animator animation) {
                    splashScreenView.remove();
                }
            });
        });
    }
}
