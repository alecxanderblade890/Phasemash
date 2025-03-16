// scripts/add_user.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGXJqTjZH79JI2f0hTNXqFE8HOFcUb_xk",
    authDomain: "e-com-dff4a.firebaseapp.com",
    databaseURL: "https://e-com-dff4a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "e-com-dff4a",
    storageBucket: "e-com-dff4a.firebasestorage.app",
    messagingSenderId: "242139274510",
    appId: "1:242139274510:web:d4743045bc8af322028b5f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    var name_ = document.getElementById('name');
    var rating_ = document.getElementById('rating');

    // Corrected line: Use the 'database' object
    const dataRef = ref(database, 'users');

    try {
        onValue(dataRef, (snapshot) => { //Use onValue function from the module.
            const users = snapshot.val();
            if (users) {
                // Iterate through each user
                Object.keys(users).forEach((userId) => {
                    const userData = users[userId];
                    const name = userData.name;
                    const rating = userData.rating;

                    console.log("User ID:", userId);
                    console.log("Name:", name);
                    console.log("Rating:", rating);
                    console.log(typeof(name));

                    name_.textContent = name;
                    rating_.textContent = rating;
                });
            } else {
                console.log("No users found.");
            }
        });
    } catch (e) { // catch the error object
        console.log("ERROR", e); // log the error object
    }

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userName = document.getElementById('userName').value;
        const userRating = parseInt(document.getElementById('userRating').value);

        if (userName && userRating >= 1 && userRating <= 5) {

            const usersRef = ref(database, 'users/');
            push(usersRef, {
                name: userName,
                rating: userRating
            })
                .then(() => {
                    alert('User added successfully!');
                    userForm.reset();
                })
                .catch((error) => {
                    console.error('Error adding user:', error);
                    alert('Failed to add user. Check console for details.');
                });

        } else {
            alert('Please enter valid name and rating (1-5).');
        }
    });
});

import {onValue} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";