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
import { Menu } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import logo from './logo-32x32.png';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    bar: {
        backgroundColor: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid #e3e3e3',
        color: theme.palette.text.primary,
    },
    content: {
        padding: 32,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    divider: {
        flexGrow: 1,
    },
    homeLink: {
        display: 'flex',
        padding: '8px 12px 8px 0',
        textDecoration: 'none',
        color: theme.palette.text.primary,
        alignItems: 'center',
    },
    logo: {
        marginRight: theme.spacing(2),
    },
    accountButton: {
        textTransform: 'none',
    },
}));

export default function AuthenticatedApp() {
    const classes = useStyles();
    const user = useUser();
    const { logout, reload } = useAuthentication();

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef();
    const handleAccountMenuClick = () => {
        setOpen(!open);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleLogoutClick = () => {
        handleClose();
        logout();
    };

    React.useEffect(() => {
        const ws = new WebSocket(
            `wss://${document.location.host}/api/keepalive`
        );
        // TODO: This should not happen on close, but on an event sent from the server. This is not necessarily when the session ends, especially when we switch to persistent sessions.
        ws.onclose = reload;
    }, []);

    return (
        <BrowserRouter>
            <div className={classes.root}>
                <AppBar position="static" className={classes.bar}>
                    <Toolbar>
                        <Link to="/" className={classes.homeLink}>
                            <Avatar
                                variant="square"
                                src={logo}
                                className={classes.logo}
                            />
                            <Typography variant="h6">Checkit</Typography>
                        </Link>

                        <Box className={classes.divider} />

                        <Button
                            ref={anchorRef}
                            onClick={handleAccountMenuClick}
                            className={classes.accountButton}
                            startIcon={
                                <Avatar alt={user.name} src={user.imageUrl} />
                            }
                            endIcon={<ArrowDropDownIcon />}
                        >
                            <Typography>{user.name}</Typography>
                        </Button>
                        <Menu
                            anchorEl={anchorRef.current}
                            keepMounted
                            open={open}
                            onClose={handleClose}
                            getContentAnchorEl={null}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            <MenuItem
                                component={Link}
                                to="/profile"
                                onClick={handleClose}
                            >
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogoutClick}>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                <Box className={classes.content}>
                    <Switch>
                        <Route path="/profile">
                            <Profile />
                        </Route>
                        <Route path="/">
                            <Home />
                        </Route>
                    </Switch>
                </Box>
            </div>
        </BrowserRouter>
    );
}
