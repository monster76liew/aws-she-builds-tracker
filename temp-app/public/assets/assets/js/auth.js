// Sign up new user
async function signUp(email, password, role, name) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Send email verification
    await user.sendEmailVerification();
    
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: email,
      role: role,
      name: name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Sign in existing user
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update last active
    await db.collection('users').doc(user.uid).update({
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Password reset
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Sign out
async function signOut() {
  await auth.signOut();
  window.location.href = '/auth.html';
}

// Auth state observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // User is signed in
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    // Redirect to appropriate dashboard
    if (window.location.pathname === '/auth.html') {
      window.location.href = `/dashboards/${userData.role}/dashboard.html`;
    }
  } else {
    // User is signed out
    if (window.location.pathname !== '/auth.html') {
      window.location.href = '/auth.html';
    }
  }
});