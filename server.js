// server.js
const express = require('express');
const multer = require('multer');
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, get, update } = require('firebase/database');
const cloudinary = require('cloudinary').v2;

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const usersRef = ref(database, 'users');

// API endpoint to fetch all users
app.get('/api/users', async (req, res) => {
    try {
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) {
            return res.json([]);
        }

        const users = snapshot.val();
        const usersArray = Object.entries(users).map(([key, user]) => ({
            key,
            ...user
        }));

        res.json(usersArray);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// API endpoint to add a user
app.post('/api/users', upload.single('image'), async (req, res) => {
    try {
        const userName = req.body.name;
        if (!userName) {
            return res.status(400).json({ error: 'User name is required.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required.' });
        }

        const cloudinaryUpload = await cloudinary.uploader.upload(
            'data:image/png;base64,' + req.file.buffer.toString('base64'),
            { upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET }
        );

        if (cloudinaryUpload && cloudinaryUpload.secure_url) {
            await push(usersRef, {
                name: userName,
                image_url: cloudinaryUpload.secure_url,
                rating: 1400
            });
            res.status(201).json({ message: 'User added successfully.' });
        } else {
            res.status(500).json({ error: 'Cloudinary upload failed.' });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Failed to add user.' });
    }
});

// API endpoint to process voting
app.post('/api/vote', async (req, res) => {
    try {
        const { winnerKey, loserKey } = req.body;
        if (!winnerKey || !loserKey) {
            return res.status(400).json({ error: 'Invalid vote data.' });
        }

        const snapshot = await get(usersRef);
        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'No users found.' });
        }

        const users = snapshot.val();
        const winner = users[winnerKey];
        const loser = users[loserKey];

        if (!winner || !loser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const k = 32;
        const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
        const expectedLoser = 1 / (1 + Math.pow(10, (winner.rating - loser.rating) / 400));

        const newWinnerRating = Math.round(winner.rating + k * (1 - expectedWinner));
        const newLoserRating = Math.round(loser.rating + k * (0 - expectedLoser));

        await update(ref(database, `users/${winnerKey}`), { rating: newWinnerRating });
        await update(ref(database, `users/${loserKey}`), { rating: newLoserRating });

        res.json({ message: 'Vote recorded successfully.' });
    } catch (error) {
        console.error("Error processing vote:", error);
        res.status(500).json({ error: 'Failed to process vote.' });
    }
});

// API endpoint to fetch the leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const snapshot = await get(usersRef);
        const users = snapshot.val();

        if (!users) {
            return res.json([]);
        }

        // Convert users to array and sort by rating (descending)
        const sortedUsers = Object.entries(users)
            .map(([key, user]) => ({ key, ...user }))
            .sort((a, b) => (b.rating || 1000) - (a.rating || 1000));

        res.json(sortedUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to retrieve leaderboard' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
