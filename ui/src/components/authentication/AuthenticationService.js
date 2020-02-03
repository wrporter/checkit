export function getUser() {
    return fetch('/api/user').then(response => {
        if (response.status >= 400) {
            throw new Error('Authentication failed!');
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
