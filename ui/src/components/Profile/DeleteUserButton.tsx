import React from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/styles';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../../services/UserService';
import { useUser } from '../../context/user';
import { FormProvider, useForm } from 'react-hook-form';
import FormTextField from '../form/FormTextField';

function Bold({ children }: { children: React.ReactNode }) {
    return <Box sx={{ fontWeight: 'bold', display: 'inline' }}>{children}</Box>
}

export default function DeleteUserButton() {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const user = useUser();

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteUser();
            setOpen(false);
            navigate('/', { replace: true });
        } catch (e) {
            setError('We failed to delete all user data for this account, please try again.');
        }
        setLoading(false);
    };

    const methods = useForm({
        shouldUnregister: true,
        defaultValues: {
            confirm: '',
        }
    });

    return (
        <Box>
            <Button
                variant="outlined"
                color="error"
                onClick={() => setOpen(true)}
            >
                Delete user and all data
            </Button>

            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="responsive-dialog-title"
            >
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleDelete)} noValidate>
                        <DialogTitle id="responsive-dialog-title">
                            Delete user and all data
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you absolutely sure? This action <Bold>cannot</Bold> be
                                undone. Deleting this user account will do the following:
                                <ul>
                                    <li>Delete all data created by this user.</li>
                                    <li>Log out the user.</li>
                                    <li>Navigate to the site home page.</li>
                                </ul>
                            </DialogContentText>

                            <FormTextField
                                autoFocus
                                autoComplete="off"
                                variant="outlined"
                                name="confirm"
                                type="email"
                                label={<>Type <Bold>{user.email}</Bold> to confirm.</>}
                                rules={{
                                    validate: (v) => v === user.email || `Please type ${user.email} to confirm.`
                                }}
                            />

                            {error && <Alert severity="error">{error}</Alert>}
                        </DialogContent>
                        <DialogActions>
                            <LoadingButton color="error" type="submit" loading={loading}>
                                Delete
                            </LoadingButton>
                        </DialogActions>
                    </form>
                </FormProvider>
            </Dialog>
        </Box>
    );
}