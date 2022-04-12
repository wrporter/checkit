import type {
    LinksFunction,
    LoaderFunction,
    MetaFunction,
} from '@remix-run/node';
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from '@remix-run/react';

import tailwindStylesheetUrl from './styles/tailwind.css';
import reachMenuButtonStylesheetUrl from '@reach/menu-button/styles.css';
import reachCheckboxStylesheetUrl from '@reach/checkbox/styles.css';
import reachDialogStylesheetUrl from '@reach/dialog/styles.css';
import reachTooltipStylesheetUrl from '@reach/tooltip/styles.css';

import { json } from '@remix-run/node';
import { getUser } from '~/auth.server';

export const links: LinksFunction = () => {
    return [
        { rel: 'stylesheet', href: reachMenuButtonStylesheetUrl },
        { rel: 'stylesheet', href: reachCheckboxStylesheetUrl },
        { rel: 'stylesheet', href: reachDialogStylesheetUrl },
        { rel: 'stylesheet', href: reachTooltipStylesheetUrl },
        { rel: 'stylesheet', href: tailwindStylesheetUrl },
    ];
};

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'Checkit',
    viewport: 'width=device-width,initial-scale=1',
});

type LoaderData = {
    user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    return json<LoaderData>({
        user: await getUser(request),
    });
};

export default function App() {
    return (
        <html lang="en" className="h-full">
            <head>
                <Meta />
                <Links />
            </head>
            <body className="h-full text-slate-700">
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
