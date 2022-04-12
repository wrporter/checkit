import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { requireUser } from '~/auth.server';
import { updateItemStatus } from '~/models/item.server';
import invariant from 'tiny-invariant';

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const status = formData.get('status');

    invariant(params.itemId, 'itemId not found');

    if (status !== 'complete' && status !== 'incomplete') {
        return json({
            errors: {
                status: 'status must be one of either "complete" or "incomplete"',
            },
        });
    }

    const user = await requireUser(request);
    if (!user) {
        return json({ error: 'Unauthenticated' }, { status: 401 });
    }

    await updateItemStatus(user.id, params.itemId, status);

    return redirect('/home');
};

export const loader: LoaderFunction = async () => {
    return redirect('/home');
};
