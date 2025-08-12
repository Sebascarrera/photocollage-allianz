// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDnPdCa_Z7V5qxvnE8Mk_nsnVZHz_4UXbw",
  authDomain: "collage-5507d.firebaseapp.com",
  databaseURL: "https://collage-5507d-default-rtdb.firebaseio.com",
  projectId: "collage-5507d",
  storageBucket: "collage-5507d.firebasestorage.app",
  messagingSenderId: "515067725517",
  appId: "1:515067725517:web:6c8a1423d7af3860930b84",
  measurementId: "G-NR7QPKVHPP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };