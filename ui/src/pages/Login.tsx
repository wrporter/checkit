import React from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { LoadingButton } from '@mui/lab';
import { FormProvider, useForm } from 'react-hook-form';
import { Credentials, login } from '../services/UserService';
import { useAuthentication } from '../context/user';
import { ReactComponent as GoogleLogo } from '../assets/google-logo.svg';
import FormTextField from '../components/form/FormTextField';

const useStyles = makeStyles((theme) => ({
    container: {
        flexDirection: 'column',
        display: 'flex',
        alignItems: 'center',
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(2),
        paddingRight: theme.spacing(3),
        paddingLeft: theme.spacing(3),
    },
    content: {
        width: '100%',
        border: 'none',
        padding: '0',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 400,
        minWidth: 300,
        gap: theme.spacing(3),
    },
    socialLoginButton: {
        backgroundColor: '#ffffff',
        borderColor: '#d6d9dc',
        color: '#3b4045',
        textTransform: 'none',
        fontWeight: 'normal',
        '&:hover': {
            backgroundColor: '#f8f9f9',
        },
    },
    loginLogo: {
        height: 24,
        width: 24,
        marginRight: 8,
    },
    formContainer: {
        width: '100%',
        padding: theme.spacing(3),
    },
    formButton: {
        textTransform: 'none',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
}));

export default function Login() {
    const { onLogin } = useAuthentication();
    const classes = useStyles();
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const methods = useForm<Credentials>({
        shouldUnregister: true,
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleLoginClick = (data: Credentials) => {
        setLoading(true);
        onLogin(
            login({
                email: data.email,
                password: data.password,
            })
        )
            .catch(() => {
                setError('Invalid email or password, please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Box className={classes.container}>
            <fieldset className={classes.content} disabled={loading}>
                <Typography variant="h4" component="h1">
                    Log in
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                    component="a"
                    href="/api/auth/oauth/google/login"
                    className={classes.socialLoginButton}
                    variant="contained"
                    disableElevation
                    fullWidth
                    startIcon={<GoogleLogo className={classes.loginLogo} />}
                >
                    Log in with Google
                </Button>

                <Paper elevation={1} className={classes.formContainer}>
                    <FormProvider {...methods}>
                        <form
                            className={classes.form}
                            noValidate
                            autoComplete="off"
                            onSubmit={methods.handleSubmit(handleLoginClick)}
                        >
                            <Typography variant="body1" component="h2">
                                Or log in with email
                            </Typography>

                            <FormTextField
                                name="email"
                                type="email"
                                label="Email"
                                rules={{
                                    required: 'Please enter an email address',
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message:
                                            'Please enter a valid email address',
                                    },
                                }}
                            />
                            <FormTextField
                                name="password"
                                type="password"
                                label="Password"
                                rules={{
                                    required: 'Please enter a password',
                                }}
                            />

                            <LoadingButton
                                variant="contained"
                                type="submit"
                                className={classes.formButton}
                                loading={loading}
                                fullWidth
                                disableElevation
                            >
                                Log in
                            </LoadingButton>
                        </form>
                    </FormProvider>
                </Paper>
            </fieldset>
        </Box>
    );
}
