import classNames from 'classnames';
import Link, { LinkProps } from 'next/link';
import React from 'react';

import { focusKeyboardRing } from '@/components/common-styles';

interface TextLinkProps extends LinkProps {
  className?: string;
  children?: React.ReactNode;
}

const TextLink = ({ className, children, ...rest }: TextLinkProps) => {
  return (
    <Link {...rest} passHref>
      <a
        className={classNames(
          className,
          focusKeyboardRing,
          'text-blue-600 underline'
        )}
      >
        {children}
      </a>
    </Link>
  );
};

TextLink.displayName = 'TextLink';

export default TextLink;
