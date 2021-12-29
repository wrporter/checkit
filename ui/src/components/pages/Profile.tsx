import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useUser } from '../authentication/UserContext';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
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
        <Box>
            <Grid container spacing={2}>
                <Grid item>
                    <Avatar
                        alt={user.name}
                        src={user.imageUrl}
                        className={classes.avatar}
                    />
                </Grid>

                <Grid item container xs={12} sm alignItems="center">
                    <Grid item xs container direction="column" spacing={2}>
                        <Grid item xs>
                            <Typography data-testid="Profile.Name" variant="h6">{user.name}</Typography>
                            <Typography data-testid="Profile.Email">{user.email}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
