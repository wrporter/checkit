import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <Container>
            <Typography variant="h1">Welcome Home!</Typography>
            <Link to="/profile">Profile</Link>
        </Container>
    );
}
