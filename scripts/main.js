import { getLeaderboard, API_BASE_URL, STATIC_DATA_URL, MODE } from './api.js';

const REFRESH_INTERVAL = 120000;

const TOOLTIPS = {
    pass1: 'Success rate when each approach makes a single attempt per task.',
    pass32: 'Success rate when each approach is allowed up to 32 attempts per task.',
    tactics: 'Baseline: applies a curated list of deterministic Lean tactics (e.g., rfl, simp) directly to each goal.',
};

const state = {
    entries: [],
    combined: null,
};

let elements = {
    content: null,
    stats: null,
    combinedScore: null,
};

document.addEventListener('DOMContentLoaded', () => {
    elements = {
        content: document.getElementById('content'),
        stats: document.getElementById('stats'),
        combinedScore: document.getElementById('combinedScore'),
    };

    loadLeaderboard();
    if (MODE !== 'static') {
        setInterval(loadLeaderboard, REFRESH_INTERVAL);
    }
});

async function loadLeaderboard() {
    const { content, stats } = elements;

    content.innerHTML = '<div class="loading">Loading leaderboard…</div>';
    stats.style.display = 'none';

    try {
        const { entries, combined } = await getLeaderboard();
        state.entries = entries;
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
                <p>${error.message}</p>
                <p>${source}</p>
            </div>
        `;
    }
}

function tooltipIcon(text, { below = false, right = false, label = 'More information' } = {}) {
    const variant = `${below ? ' tip-below' : ''}${right ? ' col-right' : ''}`;
    return `
        <span class="with-tooltip${variant}">
            <span class="info-icon" tabindex="0" role="button" aria-label="${escapeHtml(label)}">i</span>
            <span class="tooltip" role="tooltip">${escapeHtml(text)}</span>
        </span>
    `;
}

function renderLeaderboard() {
    const { content } = elements;

    if (state.entries.length === 0) {
        content.innerHTML = '<div class="no-results">No approaches found</div>';
        return;
    }

    const rows = state.entries.map(entry => {
        const tip = entry.agent_id === 'tactics'
            ? ' ' + tooltipIcon(TOOLTIPS.tactics, { label: 'About the Tactics baseline' })
            : '';
        const name = entry.agent_url
            ? `<a href="${escapeHtml(entry.agent_url)}" target="_blank" rel="noopener">${escapeHtml(entry.agent_name)}</a>`
            : escapeHtml(entry.agent_name);
        return `
            <tr>
                <td class="rank">
                    <span class="rank-badge ${getRankClass(entry.rank)}">
                        ${entry.rank}
                    </span>
                </td>
                <td>
                    <div class="agent-name">${name}${tip}</div>
                    <div class="agent-id">${escapeHtml(entry.category ?? '')}</div>
                </td>
                <td class="challenges${entry.pass_at_1 == null ? ' empty' : ''}">${formatPercent(entry.pass_at_1)}</td>
                <td class="challenges${entry.pass_at_32 == null ? ' empty' : ''}">${formatPercent(entry.pass_at_32)}</td>
            </tr>
        `;
    }).join('');

    const colIcon = (text, label) => tooltipIcon(text, { below: true, right: true, label });

    content.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th class="rank">Rank</th>
                    <th>Approach</th>
                    <th class="challenges">Pass@1&nbsp;${colIcon(TOOLTIPS.pass1, 'About Pass@1')}</th>
                    <th class="challenges">Pass@32&nbsp;${colIcon(TOOLTIPS.pass32, 'About Pass@32')}</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function updateStats() {
    const { stats, combinedScore } = elements;
    combinedScore.textContent = formatPercent(state.combined);
    stats.style.display = 'flex';
}

function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '-';
    return `${Number(value).toFixed(1)}%`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
