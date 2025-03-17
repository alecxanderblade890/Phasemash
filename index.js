// Firebase Initialization
const firebaseConfig = {

};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const usersRef = database.ref('users');

let allUsers = [];         // Stores all users from Firebase
let comparisonPairs = [];  // Stores all possible unique pairs
let lastPair = [];         // Keeps track of the last shown pair

/**
 * Fetches all users from Firebase and prepares the comparisons.
 */
function fetchUsers() {
    usersRef.once('value', (snapshot) => {
        const users = snapshot.val();
        if (!users) {
            document.getElementById('voting-section').innerHTML = `
            <div class="text-center mt-5">
                <h3 class="fw-bold">No Users Yet!</h3>
            </div>
            `;
            return;
        }

        // Convert object to array with keys
        allUsers = Object.entries(users).map(([key, user]) => ({
            key,
            ...user
        }));

        if (allUsers.length < 2) {
            console.log("Not enough users for comparison.");
            return;
        }
        generateComparisonPairs(); // Generate all unique matchups
        getNextComparison(); // Start first matchup
    });
}

/**
 * Generates all possible unique matchups and shuffles them.
 */
function generateComparisonPairs() {
    comparisonPairs = [];

    for (let i = 0; i < allUsers.length; i++) {
        for (let j = i + 1; j < allUsers.length; j++) {
            comparisonPairs.push([allUsers[i], allUsers[j]]);
        }
    }

    shuffleArray(comparisonPairs); // Shuffle to make matchups random
}

/**
 * Shuffles an array using Fisher-Yates algorithm.
 * @param {Array} array 
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Gets the next random comparison ensuring at least one image is different.
 */
function getNextComparison() {
    if (comparisonPairs.length === 0) {
        document.getElementById('voting-section').innerHTML = `
            <div class="text-center mt-5">
                <h3 class="fw-bold">ALL COMPARISONS FINISHED, THANK YOU.</h3>
            </div>
        `;
        return;
    }

    // Just pop the next pair without excessive filtering
    let nextPair = comparisonPairs.pop();
    lastPair = nextPair;

    displayUsers(nextPair[0], nextPair[1]);
}

/**
 * Displays the two users in the voting section.
 */
function displayUsers(user1, user2) {
    const votingSection = document.getElementById('voting-section');
    votingSection.innerHTML = `
        <div class="row g-4 justify-content-center">
            <div class="col-md-5 text-center">
                <div class="card shadow-sm">
                    <div class="ratio ratio-1x1" style="width: 250px; height: 250px; margin: auto;">
                        <img src="${user1.image_url}" alt="${user1.name}" class="img-fluid rounded-top" style="object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <button class="btn btn-primary w-100 fw-bold" onclick="vote('${user1.key}', ${user1.rating}, '${user2.key}', ${user2.rating})">VOTE</button>
                    </div>
                </div>
            </div>
            <div class="col-md-5 text-center">
                <div class="card shadow-sm">
                    <div class="ratio ratio-1x1" style="width: 250px; height: 250px; margin: auto;">
                        <img src="${user2.image_url}" alt="${user2.name}" class="img-fluid rounded-top" style="object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <button class="btn btn-primary w-100 fw-bold" onclick="vote('${user2.key}', ${user2.rating}, '${user1.key}', ${user1.rating})">VOTE</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handles voting and updates the Firebase database.
 */
function vote(winnerKey, winnerRating, loserKey, loserRating) {
    const k = 32; // K-factor for Elo rating system

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    const newWinnerRating = winnerRating + k * (1 - expectedWinner);
    const newLoserRating = loserRating + k * (0 - expectedLoser);

    // Update database
    database.ref(`users/${winnerKey}/rating`).set(Math.round(newWinnerRating));
    database.ref(`users/${loserKey}/rating`).set(Math.round(newLoserRating));

    getNextComparison(); // Load a new comparison
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchUsers);