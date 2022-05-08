import type {
    ActionFunction,
    LoaderFunction,
    MetaFunction,
} from '@remix-run/node';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import * as React from 'react';

import Button from '~/components/Button';
import TextField from '~/components/TextField';
import TextLink from '~/components/TextLink';
import Checkbox from '~/components/Checkbox';
import { authenticator } from '~/auth.server';
import { json } from '@remix-run/node';
import { validateEmail } from '~/utils';

export const loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request, {
        successRedirect: '/home',
    });
};

interface ActionData {
    errors?: {
        email?: string;
        password?: string;
    };
}

export const action: ActionFunction = async ({ request }) => {
    const requestClone = request.clone();
    const formData = await requestClone.formData();
    const redirectTo = formData.get('redirectTo');

    const email = formData.get('email');
    const password = formData.get('password');

    if (!validateEmail(email)) {
        return json<ActionData>(
            { errors: { email: 'Email is invalid' } },
            { status: 400 }
        );
    }

    if (typeof password !== 'string' || !password) {
        return json<ActionData>(
            { errors: { password: 'Password is required' } },
            { status: 400 }
        );
    }

    return authenticator.authenticate('basic', request, {
        successRedirect: typeof redirectTo === 'string' ? redirectTo : '/home',
        failureRedirect: '/login',
        throwOnError: true,
    });
    // TODO: Handle showing form validation errors with yup
};

export const meta: MetaFunction = () => {
    return {
        title: 'Checkit: Login',
    };
};

export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/home';
    const actionData = useActionData() as ActionData;
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (actionData?.errors?.email) {
            emailRef.current?.focus();
        } else if (actionData?.errors?.password) {
            passwordRef.current?.focus();
        }
    }, [actionData]);

    return (
        <div className="flex h-full flex-col bg-gradient-to-r from-lime-300 to-cyan-400 py-6 sm:py-8 lg:py-10">
            <h2 className="mb-6 text-center text-4xl">Log in</h2>

            <Form
                action="/auth/google"
                method="post"
                className="mx-auto mb-8 w-full max-w-md"
            >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="action" value="login" />

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
                    <span>Log in with Google</span>
                </Button>
            </Form>

            <div className="mx-auto w-full max-w-md rounded bg-white px-8 py-8 drop-shadow">
                <Form method="post" className="space-y-6">
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
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
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
                                autoComplete="current-password"
                                aria-invalid={
                                    actionData?.errors?.password
                                        ? true
                                        : undefined
                                }
                                className="w-full"
                                aria-describedby="password-error"
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
                        Log in
                    </Button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Checkbox id="remember" name="remember" />
                            <label
                                htmlFor="remember"
                                className="ml-2 block text-sm text-gray-900"
                            >
                                Remember me
                            </label>
                        </div>
                        <div className="text-center text-sm text-gray-500">
                            Don&apos;t have an account?{' '}
                            <TextLink
                                to={{
                                    pathname: '/signup',
                                    search: searchParams.toString(),
                                }}
                            >
                                Sign up
                            </TextLink>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
