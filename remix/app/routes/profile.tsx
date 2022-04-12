import Header from '~/components/Header';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/auth.server';
import { Form, useLoaderData } from '@remix-run/react';
import { useUser } from '~/utils';
import Button from '~/components/Button';
import React from 'react';
import { Dialog } from '@reach/dialog';
import TextField from '~/components/TextField';

type LoaderData = {
    user: Awaited<ReturnType<typeof requireUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUser(request);
    return json<LoaderData>({ user });
};

export default function ProfilePage() {
    const user = useUser();
    const data = useLoaderData() as LoaderData;
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    return (
        <div className="flex h-full min-h-screen flex-col">
            <Header />

            <main className="p-8">
                <div className="mx-auto flex flex-row space-x-4">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt=""
                            className="h-20 w-20 rounded-full"
                        />
                    ) : (
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-4xl text-white">
                            {user.displayName.charAt(0).toUpperCase()}
                        </span>
                    )}

                    <div className="flex flex-col justify-center">
                        <div className="text-2xl">{data.user.displayName}</div>
                        <div className="text-xl font-light">
                            {data.user.email}
                        </div>
                    </div>
                </div>

                <Button
                    kind="danger"
                    className="mt-10"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    Delete user and all data
                </Button>
                <Dialog
                    isOpen={showDeleteDialog}
                    onDismiss={() => setShowDeleteDialog(false)}
                    className="m-0 h-screen w-screen drop-shadow-2xl md:m-20 md:h-auto md:w-auto md:rounded"
                    aria-labelledby="DeleteModal"
                >
                    <h2
                        className="mb-2 text-xl font-bold text-slate-800"
                        id="DeleteModal"
                    >
                        Delete user and all data
                    </h2>
                    <p>
                        Are you absolutely sure? This action <b>cannot</b> be
                        undone. Deleting this user account will do the
                        following:
                    </p>
                    <ul className="ml-8 mt-4 mb-4 list-disc">
                        <li>Delete all data created by this user.</li>
                        <li>Log out the user.</li>
                        <li>Navigate to the site home page.</li>
                    </ul>

                    <TextField
                        type="text"
                        placeholder="Type wesp@qualtrics.com to confirm."
                        className="w-full"
                    />

                    <div className="mt-8 flex justify-end space-x-2">
                        <Button
                            kind="tertiary"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>

                        <Form method="delete" action="/profile/delete">
                            <Button kind="danger">
                                I understand the consequences, delete this user
                            </Button>
                        </Form>
                    </div>
                </Dialog>
            </main>
        </div>
    );
}
