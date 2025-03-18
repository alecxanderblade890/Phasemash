document.addEventListener('DOMContentLoaded', fetchLeaderboard);

/**
 * Fetches the leaderboard from the server.
 */
async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');

        const users = await response.json();
        if (users.length === 0) {
            document.getElementById('leaderboard').innerHTML = `
                <div class="text-center mt-5">
                    <h3 class="fw-bold">No Users Yet!</h3>
                </div>
            `;
            return;
        }

        displayLeaderboard(users);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        document.getElementById('leaderboard').innerHTML = `
            <div class="text-center mt-5">
                <h3 class="fw-bold text-danger">Error loading leaderboard.</h3>
            </div>
        `;
    }
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
