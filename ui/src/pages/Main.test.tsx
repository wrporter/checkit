import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import Main from './Main';

describe('Main', () => {
    it('displays a home page', () => {
        render(
            <ThemeProvider theme={createTheme()}>
                <MemoryRouter>
                    <Main />
                </MemoryRouter>
            </ThemeProvider>
        );

        expect(
            screen.getByText('Get more done with Checkit!')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Get started' })
        ).toBeInTheDocument();
    });
});
