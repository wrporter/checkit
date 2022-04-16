import { Menu, MenuButton } from '@reach/menu-button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

import Button from '@/components/Button';
import { MenuItem, MenuLink, MenuList } from '@/components/Menu';

export default function Header() {
  const router = useRouter();
  const session = useSession();
  console.log(session);

  return (
    <header className="flex items-center justify-between border-b border-b-gray-200 bg-white p-3">
      <Link href={session.data?.user ? '/home' : '/'} passHref>
        <a className="flex items-center space-x-2">
          <img
            src={`${router.basePath}/assets/logo.svg`}
            alt=""
            className="h-10 w-10"
          />
          <h1 className="text-2xl">Checkit</h1>
        </a>
      </Link>

      <div>
        {session.data?.user ? (
          <Menu>
            {/* eslint-disable-next-line */}
            <MenuButton as={Button} kind="tertiary" className="px-1 py-1">
              {session.data?.user.imageUrl ? (
                <img
                  src={session.data?.user.imageUrl}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                  {session.data?.user.displayName?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </MenuButton>
            <MenuList>
              <Link href="/profile" passHref>
                <MenuLink>Profile</MenuLink>
              </Link>
              <MenuItem
                onSelect={() => {
                  signOut({ redirect: true });
                }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <div className="flex space-x-2">
            <Link href="/api/auth/signin" passHref>
              <Button as="a">Log in</Button>
            </Link>
            <Link href="/signup" passHref>
              <Button kind="secondary" as="a">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
