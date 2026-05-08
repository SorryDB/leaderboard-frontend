import { MODE } from './config.js';

const API_BASE_URL = 'https://myapi-754129481175.us-central1.run.app';
const STATIC_DATA_URL = 'data/leaderboard.json';

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);

    if (!response.ok) {
        const message = `HTTP error ${response.status}`;
        throw new Error(message);
    }

    return response.json();
}

async function getStaticLeaderboard(limit) {
    const response = await fetch(STATIC_DATA_URL, { cache: 'no-cache' });

    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }

    const entries = await response.json();
    const ranked = [...entries]
        .sort((a, b) => b.completed_challenges - a.completed_challenges)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return ranked.slice(0, limit);
}

export async function getLeaderboard(limit = 100) {
    if (MODE === 'static') {
        return getStaticLeaderboard(limit);
    }
    return request(`/leaderboard?limit=${limit}`);
}

export { API_BASE_URL, STATIC_DATA_URL, MODE };
