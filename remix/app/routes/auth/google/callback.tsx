import { authenticator } from '~/auth.server';
import type { LoaderFunction } from '@remix-run/node';

export let loader: LoaderFunction = ({ request }) => {
    return authenticator.authenticate('google', request, {
        successRedirect: '/home',
        failureRedirect: '/login',
    });
};
