import React from 'react';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useUser } from '../context/user/UserContext';

const useStyles = makeStyles(theme => ({
    container: {
        padding: 32,
    },
    avatar: {
        width: theme.spacing(10),
        height: theme.spacing(10),
    },
}));

export default function Profile() {
    const user = useUser();
    const classes = useStyles();
    // TODO Add statistics to user profile of how many items they've completed and when, etc. A graph?

    return (
        <Box className={classes.container}>
            <Grid container spacing={2}>
                <Grid item>
                    <Avatar
                        alt={user.displayName}
                        src={user.imageUrl || user.image}
                        className={classes.avatar}
                    />
                </Grid>

                <Grid item container xs={12} sm alignItems="center">
                    <Grid item xs container direction="column" spacing={2}>
                        <Grid item xs>
                            <Typography data-testid="Profile.Name" variant="h6">{user.displayName}</Typography>
                            <Typography data-testid="Profile.Email">{user.email}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
