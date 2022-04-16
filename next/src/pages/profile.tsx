import { Dialog } from '@reach/dialog';
import { useSession } from 'next-auth/react';
import React from 'react';

import Button from '@/components/Button';
import Header from '@/components/Header';
import TextField from '@/components/TextField';

export default function ProfilePage() {
  const { data: session } = useSession();
  console.log(session);
  const user = session?.user;
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Header />

      <main className="p-8">
        <div className="mx-auto flex flex-row space-x-4">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt=""
              className="h-20 w-20 rounded-full"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-4xl text-white">
              {user?.displayName.charAt(0).toUpperCase()}
            </span>
          )}

          <div className="flex flex-col justify-center">
            <div className="text-2xl">{user?.displayName}</div>
            <div className="text-xl font-light">{user?.email}</div>
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
            Are you absolutely sure? This action <b>cannot</b> be undone.
            Deleting this user account will do the following:
          </p>
          <ul className="my-4 ml-8 list-disc">
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
            <Button kind="tertiary" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>

            <form method="delete" action="/profile/delete">
              <Button kind="danger">
                I understand the consequences, delete this user
              </Button>
            </form>
          </div>
        </Dialog>
      </main>
    </div>
  );
}
