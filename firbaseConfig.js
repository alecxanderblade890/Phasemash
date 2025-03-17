// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBGXJqTjZH79JI2f0hTNXqFE8HOFcUb_xk",
    authDomain: "e-com-dff4a.firebaseapp.com",
    databaseURL: "https://e-com-dff4a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "e-com-dff4a",
    storageBucket: "e-com-dff4a.firebasestorage.app",
    messagingSenderId: "242139274510",
    appId: "1:242139274510:web:d4743045bc8af322028b5f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database, ref, push, onValue }; // Export the initialized app and database