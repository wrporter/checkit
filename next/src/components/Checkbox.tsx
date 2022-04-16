import classNames from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';

import { focusKeyboardRing } from '@/components/common-styles';

interface CheckboxProps extends InputHTMLAttributes<any> {
  [key: string]: unknown;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...rest }: CheckboxProps, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={classNames(
          className,
          focusKeyboardRing,
          'h-4 w-4 cursor-pointer rounded border-gray-500 checked:bg-blue-600'
        )}
        {...rest}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
