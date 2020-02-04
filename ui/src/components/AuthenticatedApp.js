import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import Profile from './pages/Profile';
import Home from './pages/Home';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { useUser } from './authentication/UserContext';
import Button from '@material-ui/core/Button';
import { useAuthentication } from './authentication/AuthenticationContext';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

export default function AuthenticatedApp() {
    const classes = useStyles();
    const user = useUser();
    const { logout } = useAuthentication();

    return (
        <BrowserRouter>
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            <Link to="/">Site</Link>
                        </Typography>
                        <Avatar alt={user.name} src={user.imageUrl} />
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </Toolbar>
                </AppBar>

                <Switch>
                    <Route path="/profile">
                        <Profile />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </BrowserRouter>
    );
}
