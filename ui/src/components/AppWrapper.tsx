import React from 'react';
import { createTheme, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthenticationProvider } from './authentication/AuthenticationContext';
import App from './App';
import { UserProvider } from './authentication/UserContext';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const theme = createTheme();

const AppWrapper = () => {
    return (
        <React.Fragment>
            <CssBaseline />
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <AuthenticationProvider>
                        <UserProvider>
                            <App />
                        </UserProvider>
                    </AuthenticationProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </React.Fragment>
    );
};

export default AppWrapper;
