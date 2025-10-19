const API_BASE_URL = 'https://myapi-754129481175.us-central1.run.app';

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);

    if (!response.ok) {
        const message = `HTTP error ${response.status}`;
        throw new Error(message);
    }

    return response.json();
}

export async function getLeaderboard(limit = 100) {
    return request(`/leaderboard?limit=${limit}`);
}

export { API_BASE_URL };
