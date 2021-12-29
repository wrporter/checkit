import React from 'react';
import GoogleLogin from 'react-google-login';
import { useAuthentication } from './authentication/AuthenticationContext';
import FullPageContainer from './utils/FullPageContainer';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import logo from './logo-32x32.png';
import Paper from '@mui/material/Paper';
import { ReactComponent as GoogleLogo } from './google-logo.svg';
import Button from "@mui/material/Button";
import { red } from '@mui/material/colors';

const useStyles = makeStyles(() => ({
    container: {
        background:
            'linear-gradient(50deg, rgba(144,201,120,1) 0%, rgba(175,213,170,1) 33%, rgba(131,198,221,1) 66%, rgba(93,177,209,1) 100%);',
    },
    form: {
        padding: '60px 40px',
        width: 400,
    },
    title: {
        marginBottom: 24,
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#fff',
        border: '1px solid #999',
        color: '#242428',
    },
    loginError: {
        marginTop: 8,
        color: red['900'],
    },
    loginLogo: {
        height: 24,
        width: 24,
        marginRight: 8,
    }
}));

export default function UnauthenticatedApp() {
    const { login } = useAuthentication();
    const classes = useStyles();
    const [loginError, setLoginError] = React.useState('');

    const failureCallback = (response: any) => {
        console.log(response);
        setLoginError("Login failed, please try again.")
    };

    return (
        <FullPageContainer className={classes.container}>
            <Paper elevation={5}>
                <Grid container className={classes.form}>
                    <Grid container justifyContent="center" spacing={1}>
                        <Grid item>
                            <Avatar variant="square" src={logo} />
                        </Grid>
                        <Grid item>
                            <Typography
                                variant="h4"
                                component="h1"
                                className={classes.title}
                            >
                                Checkit
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container justifyContent="center">
                        <GoogleLogin
                            clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID || ""}
                            onSuccess={login}
                            onFailure={failureCallback}
                            render={(renderProps) => (
                                <Button
                                    data-testid="LoginButton"
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled}
                                    className={classes.loginButton}
                                    startIcon={<GoogleLogo className={classes.loginLogo} />}
                                >
                                    <Typography style={{ textTransform: 'none' }}>Sign in with Google</Typography>
                                </Button>
                            )}
                        />

                        {loginError && <Typography
                            className={classes.loginError}
                        >
                            {loginError}
                        </Typography>}
                    </Grid>
                </Grid>
            </Paper>
        </FullPageContainer>
    );
}
