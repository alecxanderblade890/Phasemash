document.addEventListener('DOMContentLoaded', fetchUsers);

let allUsers = [];
let comparisonPairs = [];
let lastPair = [];

/**
 * Fetches all users from the backend and prepares the comparisons.
 */
async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();

        if (!users || users.length < 2) {
            document.getElementById('voting-section').innerHTML = `
                <div class="text-center mt-5">
                    <h3 class="fw-bold">No Users Yet!</h3>
                </div>
            `;
            return;
        }

        allUsers = users;
        generateComparisonPairs();
        getNextComparison();
    } catch (error) {
        console.error("Error fetching users:", error);
    }
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

    shuffleArray(comparisonPairs);
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
                        <button class="btn btn-primary w-100 fw-bold" onclick="vote('${user1.key}', '${user2.key}')">VOTE</button>
                    </div>
                </div>
            </div>
            <div class="col-md-5 text-center">
                <div class="card shadow-sm">
                    <div class="ratio ratio-1x1" style="width: 250px; height: 250px; margin: auto;">
                        <img src="${user2.image_url}" alt="${user2.name}" class="img-fluid rounded-top" style="object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <button class="btn btn-primary w-100 fw-bold" onclick="vote('${user2.key}', '${user1.key}')">VOTE</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handles voting and updates the backend.
 */
async function vote(winnerKey, loserKey) {
    try {
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winnerKey, loserKey })
        });

        if (!response.ok) throw new Error("Failed to record vote");

        getNextComparison(); // Load a new comparison
    } catch (error) {
        console.error("Error voting:", error);
    }
}
