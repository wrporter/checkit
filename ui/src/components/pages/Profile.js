import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { useUser } from '../authentication/UserContext';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    avatar: {
        width: theme.spacing(10),
        height: theme.spacing(10),
    },
}));

export default function Profile() {
    const user = useUser();
    const classes = useStyles();

    return (
        <Container>
            <Typography variant="h2">Profile</Typography>
            <Avatar
                variant="square"
                alt={user.name}
                src={user.imageUrl}
                className={classes.avatar}
            />
            <Typography>Name: {user.name}</Typography>
            <Typography>Email: {user.email}</Typography>
        </Container>
    );
}
