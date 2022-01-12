import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import Profile from '../../pages/Profile';
import Home from '../../pages/Home';
import { useAuthentication } from '../../context/user';
import './AuthenticatedApp.css';
import NavBar from './NavBar';
import NotFound from '../../pages/NotFound';

export default function AuthenticatedApp() {
    const { refetch } = useAuthentication();

    React.useEffect(() => {
        const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
        const ws = new WebSocket(
            `${protocol}://${document.location.host}/api/keepalive`
        );
        ws.onmessage = (event) => {
            if (event.data === 'session_end') {
                refetch();
            }
        };

        return () => {
            ws.close();
        };
    }, [refetch]);

    return (
        <Box>
            <NavBar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Box>
    );
}
