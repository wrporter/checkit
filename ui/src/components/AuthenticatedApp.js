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
import Container from '@material-ui/core/Container';
import logo from './logo-32x32.png';

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
        backgroundColor: '#f3f3f3',
        paddingTop: 32,
        height: 'calc(100vh - 65px)',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
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
    const { logout } = useAuthentication();

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

    return (
        <BrowserRouter>
            <div className={classes.root}>
                <AppBar position="static" className={classes.bar}>
                    <Toolbar>
                        <Link to="/" className={classes.logo}>
                            <Avatar variant="square" src={logo} />
                        </Link>
                        <Typography variant="h6" className={classes.title}>
                            Checkit
                        </Typography>
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

                <Container className={classes.content}>
                    <Switch>
                        <Route path="/profile">
                            <Profile />
                        </Route>
                        <Route path="/">
                            <Home />
                        </Route>
                    </Switch>
                </Container>
            </div>
        </BrowserRouter>
    );
}
