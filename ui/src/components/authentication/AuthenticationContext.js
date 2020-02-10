import React, { createContext, useContext } from 'react';
import { useAsync } from 'react-async';
import * as PropTypes from 'prop-types';
import { bootstrapAppData } from '../utils/bootstrap';
import * as authService from './AuthenticationService';
import FullPageSpinner from '../utils/FullPageSpinner';

const AuthenticationContext = createContext();

function AuthenticationProvider(props) {
    const [firstAttemptFinished, setFirstAttemptFinished] = React.useState(
        false
    );
    const {
        data = { user: null },
        error,
        isRejected,
        isPending,
        isSettled,
        reload,
    } = useAsync({
        promiseFn: bootstrapAppData,
    });

    React.useLayoutEffect(() => {
        if (isSettled) {
            setFirstAttemptFinished(true);
        }
    }, [isSettled]);

    if (!firstAttemptFinished) {
        if (isPending) {
            return <FullPageSpinner />;
        }
        if (isRejected) {
            return (
                <div style={{ color: 'red' }}>
                    <p>Uh oh... There's a problem. Try refreshing the app.</p>
                    <pre>{error.message}</pre>
                </div>
            );
        }
    }

    const login = tokenResponse =>
        authService.login(tokenResponse).then(reload);
    // const register = form => authClient.register(form).then(reload);
    const register = () => console.log('TODO register');
    const logout = () => authService.logout().then(reload);

    return (
        <AuthenticationContext.Provider
            value={{ data, login, logout, register, reload }}
            {...props}
        />
    );
}

AuthenticationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

function useAuthentication() {
    const context = useContext(AuthenticationContext);
    if (context === undefined) {
        throw new Error(
            'useAuthentication must be used within a AuthenticationProvider'
        );
    }
    return context;
}

export { AuthenticationProvider, useAuthentication };
