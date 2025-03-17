// Firebase Initialization
const firebaseConfig = {
    apiKey: "AIzaSyBGXJqTjZH79JI2f0hTNXqFE8HOFcUb_xk",
    authDomain: "e-com-dff4a.firebaseapp.com",
    databaseURL: "https://e-com-dff4a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "e-com-dff4a",
    storageBucket: "e-com-dff4a.firebasestorage.app",
    messagingSenderId: "242139274510",
    appId: "1:242139274510:web:d4743045bc8af322028b5f"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const usersRef = database.ref('users');

// Global Variables
let userPairs = [];
let currentComparisonIndex = 0;

/**
 * Fetches all users and generates all possible pairwise comparisons.
 */
function fetchAllUsers() {
    usersRef.once('value', (snapshot) => {
        const users = snapshot.val();
        if (!users) {
            console.log("No users found.");
            return;
        }

        const userKeys = Object.keys(users);
        userPairs = [];

        // Generate all possible pairs (order doesn't matter, so we avoid duplicates)
        for (let i = 0; i < userKeys.length; i++) {
            for (let j = i + 1; j < userKeys.length; j++) {
                userPairs.push([userKeys[i], userKeys[j]]);
            }
        }

        if (userPairs.length > 0) {
            displayPair(0); // Start with the first comparison
        } else {
            console.log("Not enough users to create comparisons.");
        }
    });
}

/**
 * Displays the current pair of users for voting.
 * @param {number} index - The index of the user pair in userPairs array.
 */
function displayPair(index) {
    if (index >= userPairs.length) {
        console.log("All comparisons completed!");
        return;
    }

    const [user1Key, user2Key] = userPairs[index];

    usersRef.child(user1Key).once('value', (snapshot1) => {
        const user1 = snapshot1.val();
        usersRef.child(user2Key).once('value', (snapshot2) => {
            const user2 = snapshot2.val();

            // Set up global variables for voting
            currentUser1Key = user1Key;
            currentUser2Key = user2Key;
            currentUser1Rating = user1.rating || 1000;
            currentUser2Rating = user2.rating || 1000;

            const votingSection = document.getElementById('voting-section');
            votingSection.innerHTML = `
                <div class="row g-4 justify-content-center">
                    <div class="col-md-6 col-lg-5 text-center">
                        <div class="card shadow align-items-center">
                            <img src="${user1.image_url}" alt="${user1.name}" class="img-fluid" style="max-width: 69%; object-fit: contain;">
                            <div class="card-body p-3">
                                <button class="btn btn-primary w-100 fw-bold" onclick="vote('${currentUser1Key}', ${currentUser1Rating}, ${currentUser2Rating})">VOTE</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-5 text-center">
                        <div class="card shadow align-items-center">
                            <img src="${user2.image_url}" alt="${user2.name}" class="img-fluid" style="max-width: 69%; object-fit: contain;">
                            <div class="card-body p-3">
                                <button class="btn btn-primary w-100 fw-bold" onclick="vote('${currentUser2Key}', ${currentUser2Rating}, ${currentUser1Rating})">VOTE</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-3">
                    <p>Comparison ${index + 1} of ${userPairs.length}</p>
                </div>
            `;
        });
    });
}

/**
 * Updates the ratings of the users based on the vote and moves to the next pair.
 * @param {string} winnerKey - The key of the winning user.
 * @param {number} winnerRating - The current rating of the winning user.
 * @param {number} loserRating - The current rating of the losing user.
 */
function vote(winnerKey, winnerRating, loserRating) {
    const k = 32; // K-factor for Elo rating system

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    const newWinnerRating = winnerRating + k * (1 - expectedWinner);
    const newLoserRating = loserRating + k * (0 - expectedLoser);

    const loserKey = winnerKey === currentUser1Key ? currentUser2Key : currentUser1Key;

    database.ref(`users/${winnerKey}/rating`).set(Math.round(newWinnerRating));
    database.ref(`users/${loserKey}/rating`).set(Math.round(newLoserRating));

    // Move to the next pair
    currentComparisonIndex++;
    if (currentComparisonIndex < userPairs.length) {
        displayPair(currentComparisonIndex);
    } else {
        console.log("All comparisons completed!");
        document.getElementById('voting-section').innerHTML = `<h3 class="text-center text-success">All comparisons finished!</h3>`;
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchAllUsers(); // Load all users and comparisons
});