import React from 'react';
import classNames from 'classnames';
import { focusKeyboardRing } from '~/components/common-styles';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';

interface TextLinkProps extends LinkProps {
    [key: string]: unknown;
}

const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
    ({ className, ...rest }: TextLinkProps, ref) => {
        return (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <Link
                ref={ref}
                className={classNames(
                    className,
                    focusKeyboardRing,
                    'text-blue-600 underline'
                )}
                {...rest}
            />
        );
    }
);

export default TextLink;
