import { getLeaderboard, API_BASE_URL, STATIC_DATA_URL, MODE } from './api.js';

const REFRESH_INTERVAL = 120000;
const state = {
    all: [],
    filtered: [],
    combined: null,
};

let elements = {
    content: null,
    refreshBtn: null,
    stats: null,
    totalAgents: null,
    bestPass1: null,
    combinedScore: null,
    searchInput: null,
};

document.addEventListener('DOMContentLoaded', () => {
    elements = {
        content: document.getElementById('content'),
        refreshBtn: document.getElementById('refreshBtn'),
        stats: document.getElementById('stats'),
        totalAgents: document.getElementById('totalAgents'),
        bestPass1: document.getElementById('bestPass1'),
        combinedScore: document.getElementById('combinedScore'),
        searchInput: document.getElementById('searchInput'),
    };

    elements.refreshBtn.addEventListener('click', loadLeaderboard);
    elements.searchInput.addEventListener('input', handleSearch);

    loadLeaderboard();
    if (MODE !== 'static') {
        setInterval(loadLeaderboard, REFRESH_INTERVAL);
    }
});

async function loadLeaderboard() {
    const { content, refreshBtn, stats } = elements;

    refreshBtn.disabled = true;
    content.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    stats.style.display = 'none';

    try {
        const { entries, combined } = await getLeaderboard();
        state.all = entries;
        state.filtered = [...entries];
        state.combined = combined;

        renderLeaderboard();
        updateStats();
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        const source = MODE === 'static'
            ? `Make sure ${STATIC_DATA_URL} is reachable.`
            : `Make sure the API is running at ${API_BASE_URL}`;
        content.innerHTML = `
            <div class="error">
                <h3>Failed to load leaderboard</h3>
                <p>Error: ${error.message}</p>
                <p>${source}</p>
            </div>
        `;
    } finally {
        refreshBtn.disabled = false;
    }
}

function renderLeaderboard() {
    const { content } = elements;

    if (state.filtered.length === 0) {
        content.innerHTML = '<div class="no-results">No approaches found</div>';
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
                <div class="agent-id">${escapeHtml(entry.category ?? '')}</div>
            </td>
            <td class="challenges">${formatPercent(entry.pass_at_1)}</td>
            <td class="challenges">${formatPercent(entry.pass_at_32)}</td>
        </tr>
    `).join('');

    content.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th class="rank">Rank</th>
                    <th>Approach</th>
                    <th class="challenges">Pass@1</th>
                    <th class="challenges">Pass@32</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function updateStats() {
    const { stats, totalAgents, bestPass1, combinedScore } = elements;

    totalAgents.textContent = state.all.length;
    const best = state.all.reduce((max, e) => e.pass_at_1 > max ? e.pass_at_1 : max, -Infinity);
    bestPass1.textContent = Number.isFinite(best) ? formatPercent(best) : '—';
    combinedScore.textContent = formatPercent(state.combined);
    stats.style.display = 'flex';
}

function handleSearch(event) {
    const term = event.target.value.toLowerCase().trim();

    state.filtered = term === ''
        ? [...state.all]
        : state.all.filter(entry => {
            const name = (entry.agent_name ?? '').toLowerCase();
            const category = (entry.category ?? '').toLowerCase();
            return name.includes(term) || category.includes(term);
        });

    renderLeaderboard();
}

function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `${Number(value).toFixed(1)}%`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
