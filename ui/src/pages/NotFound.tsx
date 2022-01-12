import React from 'react';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import { Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(8),
    },
    spacer: {
        marginTop: theme.spacing(4),
    },
}));

export default function NotFound() {
    const classes = useStyles();

    return (
        <Container className={classes.container}>
            <Typography variant="h2" align="center" gutterBottom>
                404: Page Not Found
            </Typography>
            <Typography className={classes.spacer} align="center">
                This page checked out! Looks like you may have landed here by
                mistake.
            </Typography>
            <Box textAlign="center" className={classes.spacer}>
                <Button component={Link} variant="contained" to="/">
                    Go home
                </Button>
            </Box>
        </Container>
    );
}
