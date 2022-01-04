import React, { createContext, useContext } from 'react';
import * as PropTypes from 'prop-types';
import * as authService from '../../services/UserService';
import { getUser } from '../../services/UserService';
import FullPageSpinner from '../../components/utils/FullPageSpinner';
import { useQuery } from 'react-query';
import { red } from '@mui/material/colors';
import { User } from './UserContext';
import { useNavigate } from 'react-router-dom';

export interface Authentication {
    user?: User;
    onLogin: (request: Promise<void>) => Promise<void>;
    logout: () => Promise<void>;
    register: (signupRequest: Promise<void>) => Promise<void>;
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
    const navigate = useNavigate();

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

    const onLogin = async (loginRequest: Promise<void>) => {
        await loginRequest;
        await refetch();
        navigate('/', { replace: true });
    }
    const register = async (signupRequest: Promise<void>) => {
        await signupRequest;
        await refetch();
        navigate('/', { replace: true });
    };
    const logout = () => authService.logout().then(async () => {
        await refetch();
        navigate('/');
    });

    return (
        <AuthenticationContext.Provider
            value={{ user, onLogin: onLogin, logout, register, refetch }}
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
