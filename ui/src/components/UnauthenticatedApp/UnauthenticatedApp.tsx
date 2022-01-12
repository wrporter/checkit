import React from 'react';
import Box from '@mui/material/Box';
import { Route, Routes } from 'react-router-dom';
import NavBar from './NavBar';
import Main from '../../pages/Main';
import Login from '../../pages/Login';
import Signup from '../../pages/Signup';
import styles from './UnauthenticatedApp.module.css';
import NotFound from '../../pages/NotFound';

export default function UnauthenticatedApp() {
    return (
        <Box className={styles.container}>
            <NavBar />

            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Box>
    );
}
