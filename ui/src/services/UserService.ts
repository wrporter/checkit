export type Credentials = {
    email: string;
    password: string;
};

export interface SignupForm {
    displayName: string;
    email: string;
    password: string;
}

export async function getUser() {
    const response = await fetch('/api/auth/user');
    if (response.status >= 400) {
        return Promise.reject(response.json());
    }
    return response.json();
}

export async function login(credentials: Credentials) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.status >= 400) {
        return Promise.reject(response.json());
    }
    return response.json();
}

export async function signup(form: SignupForm) {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
    });
    if (response.status >= 400) {
        return Promise.reject();
    }
    return Promise.resolve();
}

export async function logout() {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
    });
    if (response.status >= 400) {
        return Promise.reject(response.json());
    }
    return null;
}

export async function deleteUser() {
    const response = await fetch('/api/auth/user', {
        method: 'DELETE',
    });
    if (response.status >= 400) {
        return Promise.reject(response.json());
    }
    return null;
}
