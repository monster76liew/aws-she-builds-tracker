// ========================================
// FILE: assets/js/mentor-review.js
// Handles mentor reviewing mentee reflections
// ========================================

const { auth, db } = window.firebaseApp;

let currentReflectionId;
let currentReflection;
let currentMentee;
let autoSaver;
let existingFeedbackId = null;

// Initialize page
async function initReviewPage() {
  const user = auth.currentUser;
  
  if (!user) {
    window.location.href = '/public/auth.html';
    return;
  }

  // Get reflection ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  currentReflectionId = urlParams.get('id');

  if (!currentReflectionId) {
    alert('No reflection specified');
    window.location.href = 'dashboard.html';
    return;
  }

  try {
    await loadReflectionData();
    await loadPreviousFeedback();
    await checkExistingDraft();
    setupAutoSave();
    setupEventListeners();
    
    // Hide loading, show content
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');

  } catch (error) {
    console.error('Error initializing review page:', error);
    alert('Error loading reflection. Please try again.');
    window.location.href = 'dashboard.html';
  }
}

// Load reflection data
async function loadReflectionData() {
  // Get reflection document
  const reflectionDoc = await db.collection('reflections').doc(currentReflectionId).get();
  
  if (!reflectionDoc.exists) {
    throw new Error('Reflection not found');
  }

  currentReflection = { id: reflectionDoc.id, ...reflectionDoc.data() };

  // Verify mentor has access to this reflection
  const pairingDoc = await db.collection('pairings').doc(currentReflection.pairingId).get();
  const pairing = pairingDoc.data();

  if (pairing.mentorId !== auth.currentUser.uid) {
    throw new Error('Access denied');
  }

  // Get mentee information
  const menteeDoc = await db.collection('users').doc(currentReflection.menteeId).get();
  currentMentee = menteeDoc.data();

  // Display reflection data
  displayReflectionData();
}

// Display reflection on page
function displayReflectionData() {
  // Mentee name
  document.getElementById('menteeName').textContent = currentMentee.name || currentMentee.email;

  // Month label
  const monthLabels = {
    1: 'Month 1: Foundation & Goal Setting',
    2: 'Month 2: Exploration & Skill Development',
    3: 'Month 3: Apply, Grow & Thrive'
  };
  document.getElementById('monthLabel').textContent = monthLabels[currentReflection.month] || `Month ${currentReflection.month}`;

  // Submitted date
  if (currentReflection.submittedAt) {
    const submittedDate = currentReflection.submittedAt.toDate();
    document.getElementById('submittedDate').textContent = formatTimeAgo(submittedDate);
  }

  // Reflection content
  const reflectionContent = document.getElementById('reflectionContent');
  
  if (currentReflection.formData) {
    // Display form data if exists
    displayFormData(currentReflection.formData);
  } else if (currentReflection.content) {
    // Display plain text content
    reflectionContent.textContent = currentReflection.content;
    
    // Word count
    const wordCount = currentReflection.content.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('wordCount').textContent = wordCount;
  }
}

// Display form data in structured way
function displayFormData(formData) {
  const formDataDisplay = document.getElementById('formDataDisplay');
  const formDataContent = document.getElementById('formDataContent');
  
  formDataDisplay.classList.remove('hidden');
  formDataContent.innerHTML = '';

  // Convert form data to readable format
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    if (value && value.trim()) {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'p-3 bg-gray-50 rounded-lg';
      
      // Format key to readable label
      const label = key.replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase());
      
      fieldDiv.innerHTML = `
        <p class="text-sm font-medium text-gray-700 mb-1">${label}</p>
        <p class="text-gray-900">${value}</p>
      `;
      
      formDataContent.appendChild(fieldDiv);
    }
  });

  // Count total words
  const allText = Object.values(formData).join(' ');
  const wordCount = allText.trim().split(/\s+/).filter(w => w.length > 0).length;
  document.getElementById('wordCount').textContent = wordCount;
}

// Load previous feedback for this mentee (other months)
async function loadPreviousFeedback() {
  try {
    // Get all reflections for this pairing
    const reflectionsSnapshot = await db.collection('reflections')
      .where('pairingId', '==', currentReflection.pairingId)
      .where('status', '==', 'reviewed')
      .orderBy('month', 'desc')
      .get();

    const previousFeedbackList = document.getElementById('previousFeedbackList');
    previousFeedbackList.innerHTML = '';

    let hasPreviousFeedback = false;

    for (const reflectionDoc of reflectionsSnapshot.docs) {
      // Skip current reflection
      if (reflectionDoc.id === currentReflectionId) continue;

      const reflectionData = reflectionDoc.data();
      
      // Get feedback for this reflection
      const feedbackSnapshot = await db.collection('feedback')
        .where('reflectionId', '==', reflectionDoc.id)
        .where('mentorId', '==', auth.currentUser.uid)
        .limit(1)
        .get();

      if (!feedbackSnapshot.empty) {
        hasPreviousFeedback = true;
        const feedbackData = feedbackSnapshot.docs[0].data();
        
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'border-l-4 border-blue-500 bg-blue-50 p-4 rounded';
        feedbackEl.innerHTML = `
          <div class="flex justify-between items-start mb-2">
            <p class="font-medium text-gray-900">Month ${reflectionData.month}</p>
            <span class="text-xs text-gray-500">${formatDate(feedbackData.createdAt?.toDate())}</span>
          </div>
          <p class="text-sm text-gray-700">${feedbackData.content}</p>
        `;
        
        previousFeedbackList.appendChild(feedbackEl);
      }
    }

    // Show/hide section based on whether there's previous feedback
    if (hasPreviousFeedback) {
      document.getElementById('previousFeedbackSection').classList.remove('hidden');
    }

  } catch (error) {
    console.error('Error loading previous feedback:', error);
  }
}

// Check if there's an existing feedback draft
async function checkExistingDraft() {
  try {
    const feedbackSnapshot = await db.collection('feedback')
      .where('reflectionId', '==', currentReflectionId)
      .where('mentorId', '==', auth.currentUser.uid)
      .limit(1)
      .get();

    if (!feedbackSnapshot.empty) {
      const feedbackDoc = feedbackSnapshot.docs[0];
      existingFeedbackId = feedbackDoc.id;
      const feedbackData = feedbackDoc.data();
      
      // Load draft into textarea
      if (feedbackData.content) {
        document.getElementById('feedbackText').value = feedbackData.content;
        updateFeedbackWordCount();
      }
    }
  } catch (error) {
    console.error('Error checking existing draft:', error);
  }
}

// Setup auto-save for feedback
function setupAutoSave() {
  // Create or get feedback document ID
  if (!existingFeedbackId) {
    existingFeedbackId = db.collection('feedback').doc().id;
  }

  autoSaver = new AutoSave('feedback', existingFeedbackId, 3000);
}

// Setup event listeners
function setupEventListeners() {
  // Feedback textarea - auto-save
  const feedbackText = document.getElementById('feedbackText');
  feedbackText.addEventListener('input', () => {
    updateFeedbackWordCount();
    
    const content = feedbackText.value;
    autoSaver.save(
      {
        reflectionId: currentReflectionId,
        mentorId: auth.currentUser.uid,
        content: content,
        status: 'draft'
      },
      (status) => {
        const statusEl = document.getElementById('autoSaveStatus');
        statusEl.textContent = 
          status === 'saving' ? '💾 Saving draft...' : 
          status === 'saved' ? '✓ Draft saved' : 
          status === 'error' ? '⚠ Error saving' : '';
      }
    );
  });

  // Save draft button
  document.getElementById('saveFeedbackDraft').addEventListener('click', async () => {
    const content = document.getElementById('feedbackText').value;
    
    try {
      await autoSaver.saveNow({
        reflectionId: currentReflectionId,
        mentorId: auth.currentUser.uid,
        content: content,
        status: 'draft'
      });
      alert('Feedback draft saved!');
    } catch (error) {
      alert('Error saving draft. Please try again.');
    }
  });

  // Submit feedback button
  document.getElementById('submitFeedbackBtn').addEventListener('click', submitFeedback);

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await auth.signOut();
    window.location.href = '/public/auth.html';
  });
}

// Update feedback word count
function updateFeedbackWordCount() {
  const content = document.getElementById('feedbackText').value;
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  document.getElementById('feedbackWordCount').textContent = `${wordCount} words`;
}

// Submit feedback
async function submitFeedback() {
  const feedbackContent = document.getElementById('feedbackText').value.trim();
  
  if (!feedbackContent) {
    alert('Please write feedback before submitting.');
    return;
  }

  const wordCount = feedbackContent.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 50) {
    alert('Please write at least 50 words of feedback.');
    return;
  }

  const confirmed = confirm(
    'Submit this feedback? The mentee will be notified and you can still edit it later if needed.'
  );

  if (!confirmed) return;

  const submitBtn = document.getElementById('submitFeedbackBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // Save feedback
    await db.collection('feedback').doc(existingFeedbackId).set({
      reflectionId: currentReflectionId,
      mentorId: auth.currentUser.uid,
      content: feedbackContent,
      status: 'completed',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update reflection status
    await db.collection('reflections').doc(currentReflectionId).update({
      status: 'reviewed',
      reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Create notification for mentee
    await db.collection('notifications').add({
      userId: currentReflection.menteeId,
      type: 'feedback',
      title: 'Feedback Received',
      message: `Your mentor has provided feedback on your Month ${currentReflection.month} reflection`,
      relatedId: existingFeedbackId,
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Log activity
    await db.collection('activity_log').add({
      userId: auth.currentUser.uid,
      action: 'feedback_given',
      entityType: 'feedback',
      entityId: existingFeedbackId,
      metadata: { 
        reflectionId: currentReflectionId,
        month: currentReflection.month 
      },
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('Feedback submitted successfully! The mentee has been notified.');
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';

  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('Error submitting feedback. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Feedback';
  }
}

// Helper: Format time ago
function formatTimeAgo(date) {
  if (!date) return 'Just now';
  
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

// Helper: Format date
function formatDate(date) {
  if (!date) return 'Unknown date';
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReviewPage);
} else {
  initReviewPage();
}