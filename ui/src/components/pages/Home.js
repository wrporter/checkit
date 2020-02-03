import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { useUser } from '../authentication/UserContext';

export default function Home() {
    const user = useUser();

    return (
        <Container>
            <Typography variant="h2">Welcome home, {user.givenName}!</Typography>
            <Link to="/profile">Profile</Link>
        </Container>
    );
}
