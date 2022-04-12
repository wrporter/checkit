import { Link, useSubmit } from '@remix-run/react';
import Button from '~/components/Button';
import { useOptionalUser } from '~/utils';
import { MenuItem, MenuLink, MenuList } from '~/components/Menu';
import { Menu, MenuButton } from '@reach/menu-button';

export default function Header() {
    const user = useOptionalUser();
    const submit = useSubmit();

    return (
        <header className="flex items-center justify-between border-b border-b-gray-200 bg-white p-3">
            <Link
                to={user ? '/home' : '/'}
                // to="/"
                className="flex items-center space-x-2"
            >
                <img src="/assets/logo.svg" alt="" className="h-10 w-10" />
                <h1 className="text-2xl">Checkit</h1>
            </Link>

            <div>
                {user ? (
                    <Menu>
                        <MenuButton
                            as={Button}
                            kind="tertiary"
                            className="px-1 py-1"
                        >
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt=""
                                    className="h-8 w-8 rounded-full"
                                />
                            ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                                    {user.displayName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </MenuButton>
                        <MenuList>
                            <MenuLink as={Link} to="/profile">
                                Profile
                            </MenuLink>
                            <MenuItem
                                onSelect={() =>
                                    submit(null, {
                                        method: 'post',
                                        action: '/logout',
                                    })
                                }
                            >
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>
                ) : (
                    <div className="flex space-x-2">
                        <Button as={Link} to="/login">
                            Log in
                        </Button>
                        <Button kind="secondary" as={Link} to="/signup">
                            Sign up
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
