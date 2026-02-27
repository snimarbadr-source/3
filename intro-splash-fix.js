// ===== INTRO SPLASH FIX =====
// يجب إضافة هذا الملف قبل app.js في index.html

(function() {
  'use strict';

  function hideIntroSplash() {
    const splash = document.getElementById('intro-splash');
    if (!splash) return;

    // Add hide class for animation
    splash.classList.add('hide');

    // Remove from DOM after animation completes
    setTimeout(() => {
      try {
        splash.remove();
      } catch (e) {
        splash.style.display = 'none';
      }
    }, 650); // يجب أن تتطابق مع المدة الزمنية للـ animation
  }

  // Hide after 4 seconds
  function startAutoHide() {
    const splash = document.getElementById('intro-splash');
    if (!splash) return;

    setTimeout(() => {
      hideIntroSplash();
    }, 4000);
  }

  // Allow click to skip
  function setupClickSkip() {
    const splash = document.getElementById('intro-splash');
    if (!splash) return;

    splash.addEventListener('click', hideIntroSplash);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        startAutoHide();
        setupClickSkip();
      }, 100);
    });
  } else {
    setTimeout(() => {
      startAutoHide();
      setupClickSkip();
    }, 100);
  }
})();
