import React from 'react';
import GoogleLogin from 'react-google-login';
import { useAuthentication } from './authentication/AuthenticationContext';
import FullPageContainer from './utils/FullPageContainer';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
    container: {
        backgroundColor: '#e9faff',
    },
    form: {
        padding: '60px 0',
        backgroundColor: theme.palette.background.default,
        borderRadius: 4,
        width: 400,

        boxShadow: '0 3px 20px 0px rgba(0, 0, 0, 0.1)',
    },
    title: {
        marginBottom: 24,
    },
}));

export default function UnauthenticatedApp() {
    const { login } = useAuthentication();
    const classes = useStyles();

    const failureCallback = response => {
        console.log(response);
    };

    return (
        <FullPageContainer className={classes.container}>
            <Grid container className={classes.form}>
                <Grid container justify="center">
                    <Typography
                        variant="h4"
                        component="h1"
                        className={classes.title}
                    >
                        Sign In
                    </Typography>
                </Grid>

                <Grid container justify="center">
                    <GoogleLogin
                        clientId={window.RESOURCES.GOOGLE_API_KEY}
                        onSuccess={login}
                        onFailure={failureCallback}
                    />
                </Grid>
            </Grid>
        </FullPageContainer>
    );
}
