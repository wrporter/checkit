import type {
  MenuItemProps as ReachMenuItemProps,
  MenuLinkProps as ReachMenuLinkProps,
  MenuListProps as ReachMenuListProps,
} from '@reach/menu-button';
import {
  MenuItem as ReachMenuItem,
  MenuLink as ReachMenuLink,
  MenuList as ReachMenuList,
} from '@reach/menu-button';
import type * as Polymorphic from '@reach/utils/polymorphic';
import classNames from 'classnames';
import React from 'react';

interface MenuItemProps extends ReachMenuItemProps {
  className?: string;
}

const menuItemClasses =
  'hover:text-black px-4 py-1 data-selected:bg-blue-100 data-selected:hover:bg-gray-100 data-selected:active:bg-gray-200 cursor-pointer';

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ className, ...rest }: MenuItemProps, ref) => {
    return (
      <ReachMenuItem
        ref={ref}
        className={classNames(className, menuItemClasses)}
        {...rest}
      />
    );
  }
) as Polymorphic.ForwardRefComponent<'div', MenuItemProps>;

MenuItem.displayName = 'MenuItem';

interface MenuLinkProps extends ReachMenuLinkProps {
  className?: string;
}

export const MenuLink = React.forwardRef<HTMLAnchorElement, MenuLinkProps>(
  ({ className, ...rest }: MenuLinkProps, ref) => {
    return (
      <ReachMenuLink
        ref={ref}
        className={classNames(className, menuItemClasses)}
        {...rest}
      />
    );
  }
) as Polymorphic.ForwardRefComponent<'a', MenuLinkProps>;

MenuLink.displayName = 'MenuLink';

interface MenuListProps extends ReachMenuListProps {
  className?: string;
}

export const MenuList = React.forwardRef<HTMLDivElement, MenuListProps>(
  ({ className, ...rest }: MenuListProps, ref) => {
    return (
      <ReachMenuList
        ref={ref}
        className={classNames(
          className,
          'flex flex-col rounded border border-gray-100 bg-white pt-2 pb-2 drop-shadow-md'
        )}
        {...rest}
      />
    );
  }
) as Polymorphic.ForwardRefComponent<'div', MenuListProps>;

MenuList.displayName = 'MenuList';
