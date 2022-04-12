import React from 'react';
import type { InputHTMLAttributes } from 'react';
import classNames from 'classnames';
import { focusRing } from '~/components/common-styles';

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

export default TextField;
