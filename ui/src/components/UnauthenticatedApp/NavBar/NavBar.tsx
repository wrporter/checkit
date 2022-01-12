import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import Logo from '../../Logo';

const useStyles = makeStyles((theme) => ({
    bar: {
        backgroundColor: theme.palette.background.default,
        boxShadow: 'none',
        borderBottom: '1px solid #e3e3e3',
        color: theme.palette.text.primary,
    },
    toolbar: {
        justifyContent: 'space-between',
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
    loginButton: {
        marginRight: theme.spacing(1),
    },
}));

export default function NavBar() {
    const classes = useStyles();

    return (
        <AppBar position="static" className={classes.bar}>
            <Toolbar className={classes.toolbar}>
                <Link data-testid="Home" to="/" className={classes.homeLink}>
                    <Logo className={classes.logo} />
                    <Typography variant="h6">Checkit</Typography>
                </Link>

                <Box>
                    <Button
                        className={classes.loginButton}
                        component={Link}
                        to="/login"
                        variant="contained"
                    >
                        Log in
                    </Button>

                    <Button component={Link} to="/signup" variant="outlined">
                        Sign up
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
