import { TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';

interface FormTextFieldProps {
    name: string;
    type: string;
    label: string;
    rules: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
}

const FormTextField: React.FC<FormTextFieldProps> = ({name, type, label, rules}: FormTextFieldProps) => {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { ref, ...rest }, fieldState }) => {
                return <TextField
                    {...rest}
                    inputRef={ref}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    label={label}
                    type={type}
                    variant="standard"
                    fullWidth
                />;
            }}
        />
    )
}

export default FormTextField;
