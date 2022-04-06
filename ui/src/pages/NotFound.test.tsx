import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

describe('NotFound', () => {
    it('displays a helpful page', () => {
        render(
            <ThemeProvider theme={createTheme()}>
                <MemoryRouter>
                    <NotFound />
                </MemoryRouter>
            </ThemeProvider>
        );

        expect(screen.getByText('404: Page Not Found')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Go home' })
        ).toBeInTheDocument();
    });
});
