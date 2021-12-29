import React from 'react';
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Theme } from '@mui/material';
import { AuthenticationProvider } from './authentication/AuthenticationContext';
import App from './App';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UserProvider } from './authentication/UserContext';

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

const AppWrapper = () => {
    return (
        <React.Fragment>
            <CssBaseline/>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <QueryClientProvider client={queryClient}>
                        <AuthenticationProvider>
                            <UserProvider>
                                <App/>
                            </UserProvider>
                        </AuthenticationProvider>
                    </QueryClientProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </React.Fragment>
    );
};

export default AppWrapper;
