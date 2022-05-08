import type {
    ActionFunction,
    LoaderFunction,
    MetaFunction,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import * as React from 'react';

import { createUser, getUserByEmail } from '~/models/user.server';
import { validateEmail } from '~/utils';
import Button from '~/components/Button';
import TextField from '~/components/TextField';
import TextLink from '~/components/TextLink';
import { authenticator } from '~/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request, {
        successRedirect: '/home',
    });
};

interface ActionData {
    errors: {
        displayName?: string;
        email?: string;
        password?: string;
    };
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const displayName = formData.get('displayName');
    const email = formData.get('email');
    const password = formData.get('password');
    const redirectTo = formData.get('redirectTo');

    if (typeof displayName !== 'string' || !displayName) {
        return json<ActionData>(
            { errors: { displayName: 'Display name is required' } },
            { status: 400 }
        );
    }

    if (!validateEmail(email)) {
        return json<ActionData>(
            { errors: { email: 'Email is invalid' } },
            { status: 400 }
        );
    }

    if (typeof password !== 'string') {
        return json<ActionData>(
            { errors: { password: 'Password is required' } },
            { status: 400 }
        );
    }

    if (password.length < 3) {
        return json<ActionData>(
            { errors: { password: 'Password is too short' } },
            { status: 400 }
        );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return json<ActionData>(
            { errors: { email: 'A user already exists with this email' } },
            { status: 400 }
        );
    }

    await createUser(displayName, email, password);

    return authenticator.authenticate('basic', request, {
        successRedirect: typeof redirectTo === 'string' ? redirectTo : '/home',
    });

    // return createUserSession({
    //     request,
    //     userId: user.id,
    //     remember: false,
    //     redirectTo: typeof redirectTo === 'string' ? redirectTo : '/home',
    // });
};

export const meta: MetaFunction = () => {
    return {
        title: 'Sign Up',
    };
};

export default function Signup() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') ?? undefined;
    const actionData = useActionData() as ActionData;
    const displayNameRef = React.useRef<HTMLInputElement>(null);
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (actionData?.errors?.displayName) {
            displayNameRef.current?.focus();
        } else if (actionData?.errors?.email) {
            emailRef.current?.focus();
        } else if (actionData?.errors?.password) {
            passwordRef.current?.focus();
        }
    }, [actionData]);

    return (
        <div className="flex h-full flex-col bg-gradient-to-r from-lime-300 to-cyan-400 py-6 sm:py-8 lg:py-10">
            <h2 className="mb-6 text-center text-4xl">Sign up</h2>

            <Form
                action="/auth/google"
                method="post"
                className="mx-auto mb-8 w-full max-w-md"
            >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="action" value="signup" />

                <Button
                    type="submit"
                    kind="tertiary"
                    className="flex w-full items-center justify-center space-x-4"
                >
                    <img
                        src="/assets/google-logo.svg"
                        alt=""
                        className="h-6 w-6"
                    />
                    <span>Sign up with Google</span>
                </Button>
            </Form>

            <div className="mx-auto w-full max-w-md rounded bg-white px-8 py-8 drop-shadow">
                <Form method="post" className="space-y-6">
                    <div>
                        <label
                            htmlFor="displayName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Display name
                        </label>
                        <div className="mt-1">
                            <TextField
                                ref={displayNameRef}
                                id="displayName"
                                required
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                                name="displayName"
                                type="displayName"
                                autoComplete="displayName"
                                aria-invalid={
                                    actionData?.errors?.displayName
                                        ? true
                                        : undefined
                                }
                                aria-describedby="displayName-error"
                                className="w-full"
                            />
                            {actionData?.errors?.displayName && (
                                <div
                                    className="pt-1 text-red-700"
                                    id="displayName-error"
                                >
                                    {actionData.errors.displayName}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>
                        <div className="mt-1">
                            <TextField
                                ref={emailRef}
                                id="email"
                                required
                                name="email"
                                type="email"
                                autoComplete="email"
                                aria-invalid={
                                    actionData?.errors?.email ? true : undefined
                                }
                                aria-describedby="email-error"
                                className="w-full"
                            />
                            {actionData?.errors?.email && (
                                <div
                                    className="pt-1 text-red-700"
                                    id="email-error"
                                >
                                    {actionData.errors.email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <div className="mt-1">
                            <TextField
                                id="password"
                                ref={passwordRef}
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                aria-invalid={
                                    actionData?.errors?.password
                                        ? true
                                        : undefined
                                }
                                aria-describedby="password-error"
                                className="w-full"
                            />
                            {actionData?.errors?.password && (
                                <div
                                    className="pt-1 text-red-700"
                                    id="password-error"
                                >
                                    {actionData.errors.password}
                                </div>
                            )}
                        </div>
                    </div>

                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <Button type="submit" className="w-full">
                        Create Account
                    </Button>
                    <div className="flex items-center justify-center">
                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <TextLink
                                to={{
                                    pathname: '/login',
                                    search: searchParams.toString(),
                                }}
                            >
                                Log in
                            </TextLink>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
