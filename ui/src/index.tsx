import React from 'react';
import ReactDOM from 'react-dom';
import { CssBaseline, Theme } from '@mui/material';
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthenticationProvider, UserProvider } from './context/user';
import App from './components/App';
import './styles.css';
import { BrowserRouter } from 'react-router-dom';

declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {
    }
}

const theme = createTheme();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: false,
            retry: false,
        },
    },
});

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline />
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <AuthenticationProvider>
                            <UserProvider>
                                <App />
                            </UserProvider>
                        </AuthenticationProvider>
                    </BrowserRouter>
                </QueryClientProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
