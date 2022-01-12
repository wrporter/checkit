import { TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';
import { InputProps as StandardInputProps } from '@mui/material/Input/Input';

interface FormTextFieldProps {
    name: string;
    type: string;
    rules: Omit<
        RegisterOptions,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    helperText?: React.ReactNode;
    InputProps?: Partial<StandardInputProps>;

    [props: string]: any;
}

export default function FormTextField({
    name,
    rules,
    helperText,
    InputProps,
    ...rest
}: FormTextFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { ref, ...restForm }, fieldState }) => {
                return (
                    <TextField
                        inputRef={ref}
                        error={!!fieldState.error}
                        InputProps={InputProps}
                        helperText={
                            helperText || fieldState.error?.message ? (
                                <>
                                    {helperText && <span>{helperText}</span>}
                                    {fieldState.error?.message && (
                                        <span>{fieldState.error?.message}</span>
                                    )}
                                </>
                            ) : null
                        }
                        variant="standard"
                        fullWidth
                        {...rest}
                        {...restForm}
                    />
                );
            }}
        />
    );
}
