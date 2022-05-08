import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { Item } from '~/models/item.server';
import { getItemsForUser } from '~/models/item.server';
import { requireUser } from '~/auth.server';
import { Form, useFetcher, useLoaderData } from '@remix-run/react';
import TextField from '~/components/TextField';
import React from 'react';
import { CustomCheckboxContainer, CustomCheckboxInput } from '@reach/checkbox';
import classNames from 'classnames';
import { EyeIcon, EyeOffIcon, TrashIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import Button from '~/components/Button';
import Tooltip from '~/components/Tooltip';
import useLocalStorage from '~/hooks/useLocalStorage';
import logger from '../../server/logger';

type LoaderData = {
    items: Awaited<ReturnType<typeof getItemsForUser>>;
};

export const loader: LoaderFunction = async ({ request, context }) => {
    logger.info(
        'Example log with transaction context',
        context.transactionContext
    );
    const user = await requireUser(request);
    const items = await getItemsForUser(user.id);
    return json<LoaderData>({ items });
};

function CheckboxItem({ item }: { item: Item }) {
    const itemUpdate = useFetcher();
    const [checked, setChecked] = React.useState(!!item.dateCompleted);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        itemUpdate.submit(
            {
                status: event.target.checked ? 'complete' : 'incomplete',
            },
            { method: 'post', action: `/items/${item.id}` }
        );
    };

    return (
        <li>
            <label
                className={classNames(
                    'flex w-full cursor-pointer items-center space-x-4 p-3 hover:bg-blue-100 active:bg-blue-200',
                    {
                        'bg-gray-200 line-through': checked,
                    }
                )}
            >
                <CustomCheckboxContainer
                    checked={checked}
                    onChange={handleChange}
                    className={classNames(
                        'rounded border border-gray-600',
                        'ring-indigo-900 ring-offset-1 focus-within:outline-none focus-within:ring-2 focus:outline-none'
                    )}
                >
                    <CustomCheckboxInput />
                    {checked ? (
                        <CheckIcon className="stroke-current stroke-2 text-blue-600" />
                    ) : null}
                </CustomCheckboxContainer>
                <span>{item.text}</span>
            </label>
        </li>
    );
}

export default function HomePage() {
    const items = useFetcher();
    const data = useLoaderData() as LoaderData;
    const formRef = React.useRef<HTMLFormElement>(null);
    React.useEffect(() => {
        if (items.state === 'idle') {
            formRef.current?.reset();
        }
    }, [items.state]);

    const [showCompleted, setShowCompleted] = useLocalStorage(
        'showCompleted',
        false
    );

    return (
        <div className="flex h-full min-h-screen flex-col">
            <main className="p-8">
                <div className="flex items-end space-x-1">
                    <items.Form
                        ref={formRef}
                        method="post"
                        action="/items/new"
                        className="w-full"
                    >
                        <label className="text-2xl font-light">
                            What do you want to do?
                            <TextField
                                type="text"
                                name="text"
                                className="mt-2 w-full"
                                placeholder="I want to..."
                                autoComplete="off"
                            />
                        </label>
                    </items.Form>

                    <Tooltip
                        label={
                            showCompleted
                                ? 'Hide completed items'
                                : 'Show completed items'
                        }
                    >
                        <Button
                            kind="tertiary"
                            className="px-1 py-1"
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            {showCompleted ? (
                                <EyeIcon className="h-8 w-8" />
                            ) : (
                                <EyeOffIcon className="h-8 w-8" />
                            )}
                        </Button>
                    </Tooltip>

                    <Form method="delete" action="/items/deleteCompleted">
                        <Tooltip label="Delete completed items">
                            <Button kind="tertiary" className="px-1 py-1">
                                <TrashIcon className="h-8 w-8" />
                            </Button>
                        </Tooltip>
                    </Form>
                </div>

                <ul className="mt-4">
                    {data.items
                        .filter((item) => showCompleted || !item.dateCompleted)
                        .map((item) => (
                            <CheckboxItem key={item.id} item={item} />
                        ))}
                </ul>
            </main>
        </div>
    );
}
