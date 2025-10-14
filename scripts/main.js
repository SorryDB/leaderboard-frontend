import { getLeaderboard, API_BASE_URL } from './api.js';

const REFRESH_INTERVAL = 120000;
const state = {
    all: [],
    filtered: [],
};

let elements = {
    content: null,
    refreshBtn: null,
    stats: null,
    totalAgents: null,
    totalChallenges: null,
    searchInput: null,
};

document.addEventListener('DOMContentLoaded', () => {
    elements = {
        content: document.getElementById('content'),
        refreshBtn: document.getElementById('refreshBtn'),
        stats: document.getElementById('stats'),
        totalAgents: document.getElementById('totalAgents'),
        totalChallenges: document.getElementById('totalChallenges'),
        searchInput: document.getElementById('searchInput'),
    };

    elements.refreshBtn.addEventListener('click', loadLeaderboard);
    elements.searchInput.addEventListener('input', handleSearch);

    loadLeaderboard();
    setInterval(loadLeaderboard, REFRESH_INTERVAL);
});

async function loadLeaderboard() {
    const { content, refreshBtn, stats } = elements;

    refreshBtn.disabled = true;
    content.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    stats.style.display = 'none';

    try {
        const data = await getLeaderboard();
        state.all = data;
        state.filtered = [...data];

        renderLeaderboard();
        updateStats();
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        content.innerHTML = `
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

function renderLeaderboard() {
    const { content } = elements;

    if (state.filtered.length === 0) {
        content.innerHTML = '<div class="no-results">No agents found</div>';
        return;
    }

    const rows = state.filtered.map(entry => `
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
    `).join('');

    content.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th class="rank">Rank</th>
                    <th>Agent Name</th>
                    <th class="challenges">Challenges Completed</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function updateStats() {
    const { stats, totalAgents, totalChallenges } = elements;

    const totalAgentCount = state.all.length;
    const totalChallengeCount = state.all.reduce((sum, entry) => sum + entry.completed_challenges, 0);

    totalAgents.textContent = totalAgentCount;
    totalChallenges.textContent = totalChallengeCount;
    stats.style.display = 'flex';
}

function handleSearch(event) {
    const term = event.target.value.toLowerCase().trim();

    state.filtered = term === ''
        ? [...state.all]
        : state.all.filter(entry => {
            const name = entry.agent_name.toLowerCase();
            const id = entry.agent_id.toLowerCase();
            return name.includes(term) || id.includes(term);
        });

    renderLeaderboard();
}

function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
