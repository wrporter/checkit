import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from './session.server';
import type { User } from '~/models/user.server';
import { createUser, getUserByEmail, verifyLogin } from '~/models/user.server';
import invariant from 'tiny-invariant';
import { GoogleStrategy } from 'remix-auth-google';

export const AUTH_ERROR_KEY = 'auth-error-key';

export const authenticator = new Authenticator<User>(sessionStorage, {
    sessionErrorKey: AUTH_ERROR_KEY,
});

// function validationError(field: string, condition: boolean, message: string) {
//     if (!condition) {
//         throw new Error(JSON.stringify({ field, message }));
//     }
// }

authenticator.use(
    new FormStrategy(async ({ form }) => {
        const email = form.get('email');
        const password = form.get('password');

        invariant(typeof email === 'string', 'email must be a string');
        invariant(email.length > 0, 'email must not be empty');

        invariant(typeof password === 'string', 'password must be a string');
        invariant(password.length > 0, 'password must not be empty');

        // validationError(
        //     'password',
        //     password.length >= 8,
        //     'password must be at least 8 characters long'
        // );

        const user = await verifyLogin(email, password);
        invariant(user, 'Invalid email or password');

        return user;
    }),
    'basic'
);

authenticator.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
            callbackURL: `${
                process.env.NODE_ENV === 'production'
                    ? 'https://checkit.sunbeam.cf'
                    : 'http://localhost:3000'
            }/auth/google/callback`,
        },
        async ({ profile }) => {
            let user = await getUserByEmail(profile.emails[0].value);
            if (!user) {
                user = await createUser(
                    profile.displayName,
                    profile.emails[0].value,
                    undefined,
                    profile.photos[0].value,
                    undefined,
                    { google: true }
                );
            }
            invariant(user, 'User does not exist');
            return user;
        }
    ),
    'google'
);

export async function getUser(request: Request) {
    return await authenticator.isAuthenticated(request);
}

export async function requireUser(request: Request) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    return await authenticator.isAuthenticated(request, {
        failureRedirect: `/login?${searchParams}`,
    });
}
