import classNames from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';

import { focusRing } from '@/components/common-styles';

interface TextFieldProps extends InputHTMLAttributes<any> {
  [key: string]: unknown;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, ...rest }: TextFieldProps, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(
          className,
          focusRing,
          'border border-gray-500',
          'rounded',
          'px-2 py-1',
          'text-lg'
        )}
        {...rest}
      />
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
