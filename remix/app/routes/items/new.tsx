import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { requireUser } from '~/auth.server';
import { createItem } from '~/models/item.server';

interface ActionData {
    errors: {
        text?: string;
    };
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const text = formData.get('text');

    if (typeof text !== 'string' || !text) {
        return json<ActionData>(
            { errors: { text: 'Text is required' } },
            { status: 400 }
        );
    }

    const user = await requireUser(request);
    if (!user) {
        return json({ error: 'Unauthenticated' }, { status: 401 });
    }

    return await createItem(user.id, text);
};

export const loader: LoaderFunction = async () => {
    return redirect('/home');
};
