// Configuration
const API_BASE_URL = 'https://myapi-754129481175.us-central1.run.app/'; // Change this to your API URL
let allData = [];
let filteredData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    setupSearch();
});

// Load leaderboard data from API
async function loadLeaderboard() {
    const contentDiv = document.getElementById('content');
    const refreshBtn = document.getElementById('refreshBtn');
    const statsDiv = document.getElementById('stats');

    // Disable refresh button and show loading
    refreshBtn.disabled = true;
    contentDiv.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    statsDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard?limit=100`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allData = await response.json();
        filteredData = [...allData];

        renderLeaderboard(filteredData);
        updateStats(allData);

    } catch (error) {
        console.error('Error loading leaderboard:', error);
        contentDiv.innerHTML = `
            <div class="error">
                <h3>Failed to load leaderboard</h3>
                <p>Error: ${error.message}</p>
                <p>Make sure the API is running at ${API_BASE_URL}</p>
            </div>
        `;
    } finally {
        refreshBtn.disabled = false;
    }
}

// Render the leaderboard table
function renderLeaderboard(data) {
    const contentDiv = document.getElementById('content');

    if (data.length === 0) {
        contentDiv.innerHTML = '<div class="no-results">No agents found</div>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th class="rank">Rank</th>
                    <th>Agent Name</th>
                    <th class="challenges">Challenges Completed</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(entry => `
                    <tr>
                        <td class="rank">
                            <span class="rank-badge ${getRankClass(entry.rank)}">
                                ${entry.rank}
                            </span>
                        </td>
                        <td>
                            <div class="agent-name">${escapeHtml(entry.agent_name)}</div>
                            <div class="agent-id">${escapeHtml(entry.agent_id)}</div>
                        </td>
                        <td class="challenges">${entry.completed_challenges}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    contentDiv.innerHTML = tableHTML;
}

// Update statistics
function updateStats(data) {
    const statsDiv = document.getElementById('stats');
    const totalAgentsEl = document.getElementById('totalAgents');
    const totalChallengesEl = document.getElementById('totalChallenges');

    const totalAgents = data.length;
    const totalChallenges = data.reduce((sum, entry) => sum + entry.completed_challenges, 0);

    totalAgentsEl.textContent = totalAgents;
    totalChallengesEl.textContent = totalChallenges;
    statsDiv.style.display = 'flex';
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            filteredData = [...allData];
        } else {
            filteredData = allData.filter(entry =>
                entry.agent_name.toLowerCase().includes(searchTerm) ||
                entry.agent_id.toLowerCase().includes(searchTerm)
            );
        }

        renderLeaderboard(filteredData);
    });
}

// Get rank badge class for styling
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-refresh every 60 seconds
setInterval(() => {
    loadLeaderboard();
}, 60000);
