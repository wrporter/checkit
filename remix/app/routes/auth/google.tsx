import { authenticator } from '~/auth.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export let loader: LoaderFunction = () => redirect('/login');

export let action: ActionFunction = ({ request }) => {
    return authenticator.authenticate('google', request);
};
