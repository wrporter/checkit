import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Profile from './Profile';
import { useUser } from '../context/user';

jest.mock('../context/user');
jest.mock('../components/Profile/DeleteUserButton', () => 'button');

describe('Profile', () => {
    it('displays user profile information', () => {
        (useUser as jest.Mock).mockReturnValue({
            displayName: 'Mock Name',
            email: 'mock@email.com',
        });
        render(
            <ThemeProvider theme={createTheme()}>
                <Profile />
            </ThemeProvider>
        );

        expect(screen.getByText('Mock Name')).toBeInTheDocument();
        expect(screen.getByText('mock@email.com')).toBeInTheDocument();
    });
});
