import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { useUser } from '../authentication/UserContext';

export default function Profile() {
    const user = useUser();

    return (
        <Container>
            <Typography variant="h1">Profile</Typography>
            <Paper>
                <pre>{JSON.stringify(user, null, 4)}</pre>
            </Paper>
        </Container>
    );
}
