import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { requireUser } from '~/auth.server';
import { deleteCompletedItemsForUser } from '~/models/item.server';
import { redirect } from '@remix-run/node';

export const action: ActionFunction = async ({ request }) => {
    const user = await requireUser(request);
    await deleteCompletedItemsForUser(user.id);
    return null;
};

export const loader: LoaderFunction = async () => {
    return redirect('/home');
};
