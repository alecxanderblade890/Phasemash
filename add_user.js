// scripts/add_user.js

// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Cloudinary Configuration


// Firebase Configuration


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const usersRef = ref(database, 'users');

// DOM Elements
const userForm = document.getElementById('userForm');
const userNameInput = document.getElementById('userName');
const userImageInput = document.getElementById('userImage');

// Utility Functions

/**
 * Uploads an image to Cloudinary.
 * @param {function} callback - Callback function to handle the Cloudinary URL.
 */
async function uploadImage(callback) {
    const file = userImageInput.files[0];

    if (!file) {
        alert('Please select an image.');
        callback(null);
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
            callback(data.secure_url);
        } else {
            console.error('Cloudinary upload failed:', data);
            callback(null);
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        callback(null);
    }
}

/**
 * Adds a user to Firebase.
 * @param {string} userName - The user's name.
 * @param {string} imageUrl - The Cloudinary image URL.
 */
async function addUserToFirebase(userName, imageUrl) {
    try {
        await push(usersRef, {
            name: userName,
            image_url: imageUrl,
            rating: 1400,
        });
        alert('User added successfully!');
        userForm.reset();
    } catch (error) {
        console.error('Firebase add user error:', error);
        alert('Failed to add user. Check console for details.');
    }
}

/**
 * Logs user data from Firebase.
 */
function logUsersFromFirebase() {
    onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        if (users) {
            Object.entries(users).forEach(([userId, userData]) => {
                console.log('User ID:', userId);
                console.log('Name:', userData.name);
                console.log('Rating:', userData.rating);
            });
        } else {
            console.log('No users found.');
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    logUsersFromFirebase(); // Log users when the page loads

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userName = userNameInput.value;

        if (userName) {
            uploadImage(imageUrl => {
                if (imageUrl) {
                    addUserToFirebase(userName, imageUrl);
                } else {
                    alert('Image upload failed, user not added.');
                }
            });
        } else {
            alert('Please enter a user name.');
        }
    });
});