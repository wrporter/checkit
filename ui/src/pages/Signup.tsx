import React from 'react';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import { red } from '@mui/material/colors';
import { useAuthentication } from '../context/user';
import { Button, Paper, Typography } from '@mui/material';
import { ReactComponent as GoogleLogo } from '../assets/google-logo.svg';
import { signup, SignupForm } from '../services/UserService';
import FormTextField from '../components/form/FormTextField';
import { LoadingButton } from '@mui/lab';
import { FormProvider, useForm } from 'react-hook-form';

const useStyles = makeStyles((theme) => ({
    container: {
        flexDirection: 'column',
        display: 'flex',
        alignItems: 'center',
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(5),
        paddingRight: theme.spacing(3),
        paddingLeft: theme.spacing(3),
    },
    error: {
        color: red['700'],
        textShadow: '0 0 2px #ddd'
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
            backgroundColor: '#f8f9f9'
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

export default function Signup() {
    const { register } = useAuthentication();
    const classes = useStyles();
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const methods = useForm<SignupForm>({
        shouldUnregister: true,
        defaultValues: {
            displayName: '',
            email: '',
            password: '',
        }
    });

    const handleSubmit = (data: SignupForm) => {
        setLoading(true);
        register(signup({
            displayName: data.displayName,
            email: data.email,
            password: data.password,
        })).catch(() => {
            setError("Invalid email or password, please try again.")
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <Box className={classes.container}>
            <fieldset className={classes.content} disabled={loading}>
                <Typography variant="h4" component="h1">
                    Sign up
                </Typography>

                {error && (
                    <Typography className={classes.error}>
                        {error}
                    </Typography>
                )}


                <Button
                    component="a"
                    href="/api/auth/oauth/google/signup"
                    className={classes.socialLoginButton}
                    variant="contained"
                    disableElevation
                    fullWidth
                    startIcon={<GoogleLogo className={classes.loginLogo} />}
                >
                    Sign up with Google
                </Button>

                <Paper elevation={1} className={classes.formContainer}>
                    <FormProvider {...methods}>
                        <form className={classes.form} noValidate autoComplete="off"
                              onSubmit={methods.handleSubmit(handleSubmit)}>
                            <Typography variant="body1" component="h2">
                                Or sign up with email
                            </Typography>

                            <FormTextField
                                name="displayName"
                                type="text"
                                label="Display Name"
                                rules={{
                                    required: "Please enter a display name"
                                }}
                            />
                            <FormTextField
                                name="email"
                                type="email"
                                label="Email"
                                rules={{
                                    required: 'Please enter an email address',
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: 'Please enter a valid email address'
                                    }
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
                                Sign up
                            </LoadingButton>
                        </form>
                    </FormProvider>
                </Paper>
            </fieldset>
        </Box>
    );
}
