export function getUser() {
    return fetch('/api/user').then(response => {
        if (response.status === 204 || response.status >= 400) {
            return;
        }
        return response.json();
    });
}

export function login(tokenCallback) {
    return fetch('/api/google/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenCallback),
    }).then(response => response.json());
}

export function logout() {
    return fetch('/api/logout', {
        method: 'POST',
    }).then(() => null);
}
