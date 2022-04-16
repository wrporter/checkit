import classNames from 'classnames';
import type { ButtonHTMLAttributes } from 'react';
import React from 'react';

import { focusKeyboardRing } from '@/components/common-styles';

interface ButtonProps extends ButtonHTMLAttributes<any> {
  as?: React.ElementType;
  kind?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  [key: string]: unknown;
}

const Button = React.forwardRef<HTMLButtonElement | HTMLElement, ButtonProps>(
  (
    {
      as: Component = 'button',
      className,
      kind = 'primary',
      ...rest
    }: ButtonProps,
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={classNames(
          className,
          focusKeyboardRing,
          'rounded cursor-pointer',
          'py-2 px-4',
          {
            'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800':
              kind === 'primary',
            'border border-blue-600 bg-white text-blue-600 hover:bg-blue-100 active:bg-blue-200':
              kind === 'secondary',
            'bg-white text-blue-600 hover:bg-blue-100 active:bg-blue-200':
              kind === 'tertiary',
            'border border-red-600 bg-white text-red-600 hover:bg-red-100 active:bg-red-200':
              kind === 'danger',
          }
        )}
        {...rest}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
