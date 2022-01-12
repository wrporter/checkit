import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(8),
    },
    spacer: {
        marginTop: theme.spacing(4),
    },
}));

export default function Main() {
    const classes = useStyles();

    return (
        <Container className={classes.container}>
            <Typography variant="h2" align="center" gutterBottom>
                Get more done with Checkit!
            </Typography>
            <Typography className={classes.spacer} align="center">
                Use state of the art technology to be your most productive self.
                The most simplified todo list application ever!
            </Typography>
            <Box textAlign="center" className={classes.spacer}>
                <Button component={Link} variant="contained" to="/login">
                    Get started
                </Button>
            </Box>
        </Container>
    );
}
