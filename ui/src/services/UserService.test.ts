import spyFetch from '../test/spyFetch.test.util';

import { deleteUser, getUser, login, logout, signup } from './UserService';

describe('UserService', () => {
    describe('getUser', () => {
        it('succeeds', async () => {
            const response = { id: 123 };
            spyFetch(200, response);

            await expect(getUser()).resolves.toEqual(response);
        });

        it('throws an error for bad status codes', async () => {
            spyFetch(400, 'error');

            await expect(getUser()).rejects.toBeDefined();
        });
    });

    describe('login', () => {
        it('succeeds', async () => {
            const response = { id: 123 };
            spyFetch(200, response);

            await expect(
                login({ email: '', password: '' })
            ).resolves.toBeDefined();
        });

        it('throws an error for bad status codes', async () => {
            spyFetch(400, 'error');

            await expect(
                login({ email: '', password: '' })
            ).rejects.toBeDefined();
        });
    });

    describe('signup', () => {
        it('succeeds', async () => {
            spyFetch(200);

            await expect(
                signup({ displayName: '', email: '', password: '' })
            ).resolves.toBeUndefined();
        });

        it('throws an error for bad status codes', async () => {
            spyFetch(400);

            await expect(
                signup({ displayName: '', email: '', password: '' })
            ).rejects.toBeUndefined();
        });
    });

    describe('logout', () => {
        it('succeeds', async () => {
            spyFetch(200);

            await expect(logout()).resolves.toBeNull();
        });

        it('throws an error for bad status codes', async () => {
            spyFetch(400);

            await expect(logout()).rejects.toBeDefined();
        });
    });

    describe('deleteUser', () => {
        it('succeeds', async () => {
            spyFetch(200);

            await expect(deleteUser()).resolves.toBeNull();
        });

        it('throws an error for bad status codes', async () => {
            spyFetch(400);

            await expect(deleteUser()).rejects.toBeDefined();
        });
    });
});
