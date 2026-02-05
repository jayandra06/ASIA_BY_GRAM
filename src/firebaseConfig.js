import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDUpEqHZ7obogQP6C60vDTt_Qj89ovEAvQ",
    authDomain: "leo-ludo-4d550.firebaseapp.com",
    databaseURL: "https://leo-ludo-4d550-default-rtdb.firebaseio.com",
    projectId: "leo-ludo-4d550",
    storageBucket: "leo-ludo-4d550.firebasestorage.app",
    messagingSenderId: "410861554958",
    appId: "1:410861554958:web:246612b9a0a2ddf2601"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { storage, analytics };
