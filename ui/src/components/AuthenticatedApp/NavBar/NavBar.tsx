import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuthentication } from '../../../context/user';
import Logo from '../../Logo';
import { useQueryClient } from 'react-query';

const useStyles = makeStyles(theme => ({
    bar: {
        backgroundColor: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid #e3e3e3',
        color: theme.palette.text.primary,
    },
    toolbar: {
        justifyContent: 'space-between',
    },
    menuButton: {
        marginRight: theme.spacing(2),
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

export default function NavBar() {
    const queryClient = useQueryClient();
    const classes = useStyles();
    const { user, logout } = useAuthentication();

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
        queryClient.clear();
        logout();
    };

    return (
        <AppBar position="static" className={classes.bar}>
            <Toolbar className={classes.toolbar}>
                <Link
                    data-testid="Home"
                    to="/"
                    className={classes.homeLink}
                >
                    <Logo className={classes.logo} />
                    <Typography variant="h6">Checkit</Typography>
                </Link>

                {user && (
                    <>
                        <Button
                            data-testid="AccountMenu"
                            onClick={handleAccountMenuClick}
                            className={classes.accountButton}
                            startIcon={
                                <Avatar alt={user.displayName} src={user.imageUrl || user.image} />
                            }
                            endIcon={<ArrowDropDownIcon />}
                        />

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
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
