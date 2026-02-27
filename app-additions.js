// ===== IMAGE UPLOAD ENHANCEMENTS =====
// هذا الملف يضيف وظائف رفع الصور إلى التطبيق الأساسي

(function() {
  'use strict';

  // State for image handling
  let currentImageBase64 = null;
  let currentImageFile = null;

  // Wait for DOM to be ready
  function initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const btnSelectImage = document.getElementById('btn-select-image');
    const btnClearImage = document.getElementById('btn-clear-image');
    const uploadContent = document.querySelector('.upload-content');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');

    if (!uploadArea || !imageInput) return;

    // Click to select image
    if (btnSelectImage) {
      btnSelectImage.addEventListener('click', (e) => {
        e.preventDefault();
        imageInput.click();
      });
    }

    // File input change
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageSelect(file);
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          handleImageSelect(file);
        } else {
          showToast('يرجى اختيار صورة صحيحة', 'error');
        }
      }
    });

    // Clear image
    if (btnClearImage) {
      btnClearImage.addEventListener('click', (e) => {
        e.preventDefault();
        clearImage();
      });
    }

    // Direct click on upload area (not on button)
    uploadContent.addEventListener('click', (e) => {
      if (e.target !== btnSelectImage && !btnSelectImage.contains(e.target)) {
        imageInput.click();
      }
    });
  }

  function handleImageSelect(file) {
    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار صورة صحيحة', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageBase64 = e.target.result;
      currentImageFile = file;
      displayImagePreview(e.target.result);
      showToast('تم تحميل الصورة بنجاح ✓', 'success');
    };
    reader.onerror = () => {
      showToast('خطأ في قراءة الصورة', 'error');
    };
    reader.readAsDataURL(file);
  }

  function displayImagePreview(dataUrl) {
    const uploadContent = document.querySelector('.upload-content');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');

    if (uploadContent && uploadPreview && previewImage) {
      uploadContent.style.display = 'none';
      uploadPreview.style.display = 'flex';
      previewImage.src = dataUrl;
    }
  }

  function clearImage() {
    const imageInput = document.getElementById('image-input');
    const uploadContent = document.querySelector('.upload-content');
    const uploadPreview = document.getElementById('upload-preview');

    currentImageBase64 = null;
    currentImageFile = null;
    
    if (imageInput) {
      imageInput.value = '';
    }

    if (uploadContent && uploadPreview) {
      uploadPreview.style.display = 'none';
      uploadContent.style.display = 'flex';
    }

    showToast('تم حذف الصورة', 'success');
  }

  function getImageBase64() {
    return currentImageBase64;
  }

  // Helper: Show toast notification
  function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // Enhance existing form submission
  function enhanceFormSubmission() {
    const btnSubmit = document.getElementById('btn-submit-interview');
    if (!btnSubmit) return;

    const originalClick = btnSubmit.onclick;
    btnSubmit.addEventListener('click', (e) => {
      // Check if image is selected
      if (!currentImageBase64) {
        showToast('⚠️ يرجى إضافة صورة المرشح أولاً', 'error');
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Store image in a way the form can access it
      window.currentCandidateImage = currentImageBase64;
    });
  }

  // Enhance questions rendering
  function enhanceQuestionsRendering() {
    const questionsList = document.getElementById('questions-list');
    if (!questionsList) return;

    // Store original observer if exists
    const observeQuestionsChanges = new MutationObserver(() => {
      // Reattach events to newly added questions
      attachInputEvents();
    });

    observeQuestionsChanges.observe(questionsList, {
      childList: true,
      subtree: true
    });
  }

  function attachInputEvents() {
    const inputs = document.querySelectorAll('.question-input');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.style.borderColor = 'var(--brand)';
      });
      input.addEventListener('blur', function() {
        this.style.borderColor = 'var(--line)';
      });
    });
  }

  // Reset form helper
  function setupResetButton() {
    const btnReset = document.getElementById('btn-reset');
    if (!btnReset) return;

    btnReset.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Clear all inputs
      const inputs = document.querySelectorAll('.question-input');
      inputs.forEach(input => {
        input.value = '';
      });

      clearImage();
      showToast('تم مسح النموذج بنجاح', 'success');
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        initImageUpload();
        enhanceQuestionsRendering();
        setupResetButton();
        enhanceFormSubmission();
        attachInputEvents();
      }, 100);
    });
  } else {
    initImageUpload();
    enhanceQuestionsRendering();
    setupResetButton();
    enhanceFormSubmission();
    attachInputEvents();
  }

  // Expose functions globally if needed
  window.imageUploadModule = {
    getImageBase64,
    clearImage,
    handleImageSelect,
    currentImageBase64: () => currentImageBase64
  };

})();
