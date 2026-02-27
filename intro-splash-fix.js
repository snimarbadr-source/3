<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base href="./">
  <title>المقابلة — مقابلات الصحة</title>
  <link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">
  <link rel="stylesheet" href="./styles.css" />
  <style>
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Tahoma, Arial;
      background: radial-gradient(1200px 800px at 80% 10%, rgba(53,224,201,.12), transparent 60%),
                  radial-gradient(900px 700px at 10% 30%, rgba(58,164,255,.10), transparent 60%),
                  linear-gradient(180deg, #050b12, #071423);
      color: #e8f3ff;
      direction: rtl;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- FULLSCREEN INTERVIEW MODAL -->
  <div id="interview-fullscreen" class="interview-fullscreen-container">
    <!-- HEADER -->
    <header class="interview-fullscreen-header">
      <div class="interview-header-left">
        <button class="icon-btn-large" id="btn-close-interview" title="إغلاق والعودة">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="interview-header-title">
          <h1>المقابلة الصحية</h1>
          <p>مستشفى ريسبكت</p>
        </div>
      </div>
      <div class="interview-header-right">
        <div class="interview-progress">
          <span class="progress-label">التقدم:</span>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <span class="progress-text" id="progress-text">0%</span>
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="interview-fullscreen-content">
      <!-- LEFT: IMAGE UPLOAD -->
      <section class="interview-section interview-left-section">
        <div class="section-inner">
          <div class="upload-zone" id="upload-zone">
            <div class="upload-placeholder" id="upload-placeholder">
              <div class="upload-icon-large">📸</div>
              <h2>إضافة صورة المرشح</h2>
              <p>اسحب الصورة هنا أو</p>
              <button class="btn-upload" id="btn-upload-click">اضغط للاختيار</button>
              <input type="file" id="file-input" accept="image/*" style="display: none;">
            </div>
            <div class="upload-preview-zone" id="upload-preview-zone" style="display: none;">
              <img id="preview-img" src="" alt="معاينة الصورة" class="preview-image">
              <div class="preview-overlay">
                <button class="btn-change-image" id="btn-change-image">تغيير الصورة</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SEPARATOR -->
      <div class="interview-separator"></div>

      <!-- RIGHT: QUESTIONS -->
      <section class="interview-section interview-right-section">
        <div class="section-inner">
          <h2 class="questions-heading">الأسئلة والإجابات</h2>
          <div class="questions-container" id="questions-container">
            <!-- سيتم ملؤها بـ JavaScript -->
          </div>
          <div class="interview-actions">
            <button class="btn-interview" id="btn-reset-form">مسح النموذج</button>
            <button class="btn-interview btn-primary" id="btn-submit-form">✓ حفظ وإرسال</button>
          </div>
        </div>
      </section>
    </main>
  </div>

  <!-- OVERLAY FOR ANIMATIONS -->
  <div id="interview-overlay" class="interview-overlay" style="display: none;"></div>

  <!-- TOAST NOTIFICATIONS -->
  <div id="interview-toast" class="interview-toast"></div>

  <script>
    // ===== STATE MANAGEMENT =====
    const interviewState = {
      currentImage: null,
      currentImageBase64: null,
      formData: {},
      questions: [],
    };

    // ===== INITIALIZATION =====
    function initInterviewPage() {
      setupImageUpload();
      loadQuestions();
      setupFormHandlers();
      updateProgress();
      
      // Smooth entrance animation
      setTimeout(() => {
        document.getElementById('interview-fullscreen').classList.add('loaded');
      }, 100);
    }

    // ===== IMAGE UPLOAD SYSTEM =====
    function setupImageUpload() {
      const fileInput = document.getElementById('file-input');
      const uploadZone = document.getElementById('upload-zone');
      const btnUploadClick = document.getElementById('btn-upload-click');
      const btnChangeImage = document.getElementById('btn-change-image');
      const btnCloseInterview = document.getElementById('btn-close-interview');

      // Click to select
      btnUploadClick.addEventListener('click', () => {
        fileInput.click();
      });

      // File input change
      fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
          handleImageFile(e.target.files[0]);
        }
      });

      // Drag and drop
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-active');
      });

      uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-active');
      });

      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-active');
        
        const files = e.dataTransfer.files;
        if (files[0] && files[0].type.startsWith('image/')) {
          handleImageFile(files[0]);
        } else {
          showToast('⚠️ يرجى اختيار صورة صحيحة', 'error');
        }
      });

      // Change image
      btnChangeImage.addEventListener('click', () => {
        fileInput.click();
      });

      // Close interview
      btnCloseInterview.addEventListener('click', () => {
        closeInterview();
      });
    }

    function handleImageFile(file) {
      if (!file.type.startsWith('image/')) {
        showToast('❌ نوع الملف غير مدعوم', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        interviewState.currentImageBase64 = e.target.result;
        interviewState.currentImage = file;
        displayImagePreview(e.target.result);
        showToast('✅ تم تحميل الصورة بنجاح', 'success');
        updateProgress();
      };
      reader.readAsDataURL(file);
    }

    function displayImagePreview(dataUrl) {
      const placeholder = document.getElementById('upload-placeholder');
      const previewZone = document.getElementById('upload-preview-zone');
      const previewImg = document.getElementById('preview-img');

      previewImg.src = dataUrl;
      placeholder.style.display = 'none';
      previewZone.style.display = 'flex';
    }

    // ===== QUESTIONS SYSTEM =====
    function loadQuestions() {
      // Sample questions - في الواقع ستأتي من البيانات الأصلية
      interviewState.questions = [
        { id: 1, text: 'ما اسمك الكامل؟', type: 'text', required: true },
        { id: 2, text: 'ما رقمك الوطني؟', type: 'text', required: true },
        { id: 3, text: 'ما مؤهلاتك التعليمية؟', type: 'textarea', required: true },
        { id: 4, text: 'ما خبرتك السابقة في المجال الطبي؟', type: 'textarea', required: false },
        { id: 5, text: 'لماذا تريد العمل في مستشفانا؟', type: 'textarea', required: false },
      ];

      renderQuestions();
    }

    function renderQuestions() {
      const container = document.getElementById('questions-container');
      container.innerHTML = '';

      interviewState.questions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'question-item';
        item.style.animationDelay = `${idx * 50}ms`;

        const inputId = `q-${q.id}`;
        let inputField = '';

        if (q.type === 'textarea') {
          inputField = `
            <textarea 
              id="${inputId}" 
              class="question-input question-textarea"
              placeholder="أدخل إجابتك..."
              ${q.required ? 'required' : ''}
            ></textarea>
          `;
        } else {
          inputField = `
            <input 
              type="text" 
              id="${inputId}" 
              class="question-input"
              placeholder="أدخل إجابتك..."
              ${q.required ? 'required' : ''}
            />
          `;
        }

        item.innerHTML = `
          <div class="question-label">
            <span class="question-text">${q.text}</span>
            ${q.required ? '<span class="required-mark">*</span>' : ''}
          </div>
          ${inputField}
        `;

        // Add input event listener
        const input = item.querySelector('.question-input');
        input.addEventListener('input', () => {
          interviewState.formData[q.id] = input.value;
          updateProgress();
        });

        container.appendChild(item);
      });
    }

    // ===== FORM HANDLERS =====
    function setupFormHandlers() {
      const btnReset = document.getElementById('btn-reset-form');
      const btnSubmit = document.getElementById('btn-submit-form');

      btnReset.addEventListener('click', () => {
        resetForm();
      });

      btnSubmit.addEventListener('click', () => {
        submitForm();
      });
    }

    function resetForm() {
      document.querySelectorAll('.question-input').forEach(input => {
        input.value = '';
      });
      interviewState.formData = {};
      showToast('🔄 تم مسح النموذج', 'success');
      updateProgress();
    }

    function submitForm() {
      if (!interviewState.currentImageBase64) {
        showToast('⚠️ يرجى إضافة صورة المرشح أولاً', 'error');
        document.getElementById('upload-zone').classList.add('shake');
        setTimeout(() => {
          document.getElementById('upload-zone').classList.remove('shake');
        }, 500);
        return;
      }

      // Check required fields
      const requiredQuestions = interviewState.questions.filter(q => q.required);
      const allFilled = requiredQuestions.every(q => {
        const value = interviewState.formData[q.id];
        return value && value.trim().length > 0;
      });

      if (!allFilled) {
        showToast('⚠️ يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
      }

      // Create submission data
      const submissionData = {
        timestamp: new Date().toISOString(),
        image: interviewState.currentImageBase64,
        answers: interviewState.formData,
        status: 'pending',
      };

      // Save to localStorage
      const submissions = JSON.parse(localStorage.getItem('interview_submissions') || '[]');
      submissions.push(submissionData);
      localStorage.setItem('interview_submissions', JSON.stringify(submissions));

      showToast('✅ تم حفظ البيانات بنجاح!', 'success');

      // Reset after success
      setTimeout(() => {
        resetForm();
        document.getElementById('upload-placeholder').style.display = 'flex';
        document.getElementById('upload-preview-zone').style.display = 'none';
        interviewState.currentImageBase64 = null;
        interviewState.currentImage = null;
        showToast('🎉 جاهز لمرشح جديد', 'info');
        updateProgress();
      }, 1500);
    }

    // ===== UTILITIES =====
    function updateProgress() {
      const totalQuestions = interviewState.questions.length;
      const filledQuestions = Object.keys(interviewState.formData).filter(
        key => interviewState.formData[key] && interviewState.formData[key].trim().length > 0
      ).length;
      
      const hasImage = interviewState.currentImageBase64 ? 1 : 0;
      const totalItems = totalQuestions + 1;
      const filledItems = filledQuestions + hasImage;

      const percentage = Math.round((filledItems / totalItems) * 100);

      document.getElementById('progress-fill').style.width = percentage + '%';
      document.getElementById('progress-text').textContent = percentage + '%';
    }

    function showToast(message, type = 'info') {
      const toast = document.getElementById('interview-toast');
      toast.textContent = message;
      toast.className = `interview-toast show ${type}`;

      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }

    function closeInterview() {
      const container = document.getElementById('interview-fullscreen');
      container.classList.remove('loaded');
      
      setTimeout(() => {
        window.history.back();
      }, 300);
    }

    // ===== START =====
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initInterviewPage);
    } else {
      initInterviewPage();
    }
  </script>
</body>
</html>
