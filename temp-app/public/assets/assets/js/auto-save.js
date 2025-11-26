class AutoSave {
  constructor(collectionName, documentId, debounceMs = 2000) {
    this.collectionName = collectionName;
    this.documentId = documentId;
    this.debounceMs = debounceMs;
    this.saveTimer = null;
    this.isSaving = false;
    this.lastSaved = null;
  }
  
  // Auto-save data with debouncing
  save(data, onStatusChange) {
    // Clear existing timer
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    // Show "saving..." status
    if (onStatusChange) onStatusChange('saving');
    
    // Set new timer
    this.saveTimer = setTimeout(async () => {
      this.isSaving = true;
      
      try {
        await db.collection(this.collectionName).doc(this.documentId).set({
          ...data,
          lastSavedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        this.lastSaved = new Date();
        if (onStatusChange) onStatusChange('saved');
        
        // Hide status after 2 seconds
        setTimeout(() => {
          if (onStatusChange) onStatusChange('');
        }, 2000);
        
      } catch (error) {
        console.error('Auto-save error:', error);
        if (onStatusChange) onStatusChange('error');
      } finally {
        this.isSaving = false;
      }
    }, this.debounceMs);
  }
  
  // Force immediate save
  async saveNow(data) {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    await db.collection(this.collectionName).doc(this.documentId).set({
      ...data,
      lastSavedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
}

// Usage example in reflection page:
const reflectionId = 'reflection_12345';
const autoSaver = new AutoSave('reflections', reflectionId);

document.getElementById('reflectionText').addEventListener('input', (e) => {
  const content = e.target.value;
  autoSaver.save(
    { content, status: 'draft' },
    (status) => {
      document.getElementById('saveStatus').textContent = 
        status === 'saving' ? 'Saving...' : 
        status === 'saved' ? 'Saved' : 
        status === 'error' ? 'Error saving' : '';
    }
  );
});