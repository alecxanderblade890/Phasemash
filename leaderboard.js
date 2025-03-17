// Firebase Initialization
const firebaseConfig = {

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
            document.getElementById('leaderboard').innerHTML = `
            <div class="text-center mt-5">
                <h3 class="fw-bold">No Users Yet!</h3>
            </div>
            `;
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
 * Displays the leaderboard in a vertical layout.
 * @param {Array} users - Array of user objects sorted by rating.
 */
function displayLeaderboard(users) {
    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = ''; // Clear previous data

    users.forEach((user, index) => {
        const position = index + 1; // Rank starts from 1

        leaderboardContainer.innerHTML += `
            <div class="w-100 d-flex justify-content-center">
                <div class="card shadow text-center p-3 my-2" style="max-width: 400px; width: 100%;">
                    <span class="badge bg-primary position-absolute top-0 start-50 translate-middle">
                        #${position}
                    </span>
                    <img src="${user.image_url}" alt="${user.name}" class="img-fluid rounded-circle mx-auto d-block mt-3" style="width: 100px; height: 100px; object-fit: cover;">
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