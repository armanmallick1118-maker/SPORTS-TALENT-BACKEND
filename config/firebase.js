// config/firebase.js, Sensei
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');

// Your perfectly placed key, Sensei!
const serviceAccount = require('../firebase-service-account.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "your-project-id.appspot.com" 
});

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// We create this small wrapper so your middleware file doesn't break, Sensei!
const admin = {
  auth: () => auth,
  firestore: () => db,
  storage: () => storage
};

module.exports = { admin, db, storage, auth };