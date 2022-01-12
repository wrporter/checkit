export type Credentials = {
    email: string;
    password: string;
};

export interface SignupForm {
    displayName: string;
    email: string;
    password: string;
}

export function getUser() {
    return fetch('/api/auth/user').then((response) => {
        if (response.status === 204 || response.status >= 400) {
            return Promise.resolve();
        }
        return response.json();
    });
}

export function login(credentials: Credentials) {
    return fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    }).then((response) => {
        if (response.status >= 400) {
            return Promise.reject(response.json());
        }
        return response.json();
    });
}

export function signup(form: SignupForm) {
    return fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
    }).then((response) => {
        if (response.status >= 400) {
            return Promise.reject();
        }
        return Promise.resolve();
    });
}

export function logout() {
    return fetch('/api/auth/logout', {
        method: 'POST',
    }).then((response) => {
        if (response.status >= 400) {
            return Promise.reject(response.json());
        }
        return null;
    });
}

export function deleteUser() {
    return fetch('/api/auth/user', {
        method: 'DELETE',
    }).then((response) => {
        if (response.status >= 400) {
            return Promise.reject(response.json());
        }
        return null;
    });
}
