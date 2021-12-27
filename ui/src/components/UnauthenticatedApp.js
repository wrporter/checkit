import React from 'react';
import GoogleLogin from 'react-google-login';
import { useAuthentication } from './authentication/AuthenticationContext';
import FullPageContainer from './utils/FullPageContainer';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import logo from './logo-32x32.png';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(() => ({
    container: {
        background:
            'linear-gradient(50deg, rgba(144,201,120,1) 0%, rgba(175,213,170,1) 33%, rgba(131,198,221,1) 66%, rgba(93,177,209,1) 100%);',
    },
    form: {
        padding: '60px 0',
        width: 400,
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
                            clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
                            onSuccess={login}
                            onFailure={failureCallback}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </FullPageContainer>
    );
}
