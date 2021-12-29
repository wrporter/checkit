import React, { createContext, useContext } from 'react';
import * as PropTypes from 'prop-types';
import * as authService from './AuthenticationService';
import { getUser } from './AuthenticationService';
import FullPageSpinner from '../utils/FullPageSpinner';
import { useQuery } from 'react-query';
import { red } from '@mui/material/colors';
import { User } from './UserContext';

export interface Authentication {
    user?: User;
    login: (tokenResponse: any) => Promise<void>;
    logout: () => Promise<void>;
    register: () => void;
    refetch: () => void;
}

const AuthenticationContext = createContext<Authentication | undefined>(undefined);

function AuthenticationProvider({ ...rest }) {
    const [firstAttemptFinished, setFirstAttemptFinished] = React.useState(
        false
    );
    const {
        data: user,
        error,
        isLoading,
        isFetched,
        refetch,
    } = useQuery<User, Error>('user', getUser);

    React.useLayoutEffect(() => {
        if (isFetched) {
            setFirstAttemptFinished(true);
        }
    }, [isFetched]);

    if (!firstAttemptFinished) {
        if (isLoading) {
            return <FullPageSpinner />;
        }
        if (error) {
            return (
                <div style={{ color: red['900'] }}>
                    <p>Uh oh... There's a problem. Try refreshing the app.</p>
                    <pre>{error.message}</pre>
                </div>
            );
        }
    }

    const login = (tokenResponse: any) =>
        authService.login(tokenResponse).then(() => {
            refetch()
        });
    // const register = form => authClient.register(form).then(reload);
    const register = () => console.log('TODO register');
    const logout = () => authService.logout().then(() => {
        refetch()
    });

    return (
        <AuthenticationContext.Provider
            value={{ user, login, logout, register, refetch }}
            {...rest}
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
