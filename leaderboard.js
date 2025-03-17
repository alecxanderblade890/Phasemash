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

/**
 * Fetches all users from Firebase, sorts them by rating, and displays them.
 */
function fetchLeaderboard() {
    usersRef.once('value', (snapshot) => {
        const users = snapshot.val();
        if (!users) {
            console.log("No users found.");
            return;
        }

        // Convert to array and sort by rating (descending)
        const sortedUsers = Object.entries(users)
            .map(([key, user]) => ({ key, ...user }))
            .sort((a, b) => (b.rating || 1000) - (a.rating || 1000));

        displayLeaderboard(sortedUsers);
    });
}

/**
 * Displays the leaderboard using Bootstrap cards.
 * @param {Array} users - Array of user objects sorted by rating.
 */
function displayLeaderboard(users) {
    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = ''; // Clear previous data

    users.forEach((user, index) => {
        const position = index + 1; // Rank starts from 1

        leaderboardContainer.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card shadow text-center p-3">
                    <span class="badge bg-primary position-absolute top-0 start-50 translate-middle">
                        #${position}
                    </span>
                    <img src="${user.image_url}" alt="${user.name}" class="img-fluid rounded-circle mx-auto d-block mt-3" style="width: 120px; height: 120px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="fw-bold">${user.name}</h5>
                        <p class="text-muted">Rating: <span class="fw-bold">${user.rating || 1000}</span></p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Load leaderboard when page loads
document.addEventListener('DOMContentLoaded', fetchLeaderboard);