import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Home from './pages/Home';
import makeStyles from '@mui/styles/makeStyles';
import Avatar from '@mui/material/Avatar';
import { useUser } from './authentication/UserContext';
import Button from '@mui/material/Button';
import { useAuthentication } from './authentication/AuthenticationContext';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import logo from './logo-32x32.png';
import Box from '@mui/material/Box';

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
    const { logout, refetch } = useAuthentication();

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const handleAccountMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogoutClick = () => {
        handleClose();
        logout();
    };

    const checkSessionEnd = React.useCallback(() => {
        const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
        const ws = new WebSocket(
            `${protocol}://${document.location.host}/api/keepalive`
        );
        ws.onmessage = event => {
            if (event.data === 'session_end') {
                refetch();
            }
        };
    }, [refetch]);

    React.useEffect(() => {
        checkSessionEnd();
    }, [checkSessionEnd]);

    return (
        <BrowserRouter>
            <div className={classes.root}>
                <AppBar position="static" className={classes.bar}>
                    <Toolbar>
                        <Link
                            data-testid="Home"
                            to="/"
                            className={classes.homeLink}
                        >
                            <Avatar
                                variant="square"
                                src={logo}
                                className={classes.logo}
                            />
                            <Typography variant="h6">Checkit</Typography>
                        </Link>

                        <Box className={classes.divider}/>

                        <Button
                            data-testid="AccountMenu"
                            onClick={handleAccountMenuClick}
                            className={classes.accountButton}
                            startIcon={
                                <Avatar alt={user.name} src={user.imageUrl}/>
                            }
                            endIcon={<ArrowDropDownIcon/>}
                        >
                            <Typography>{user.name}</Typography>
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            keepMounted
                            open={open}
                            onClose={handleClose}
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
                                data-testid="AccountMenu.Profile"
                                component={Link}
                                to="/profile"
                                onClick={handleClose}
                            >
                                Profile
                            </MenuItem>
                            <MenuItem
                                data-testid="AccountMenu.Logout"
                                onClick={handleLogoutClick}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                <Box className={classes.content}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </Box>
            </div>
        </BrowserRouter>
    );
}
