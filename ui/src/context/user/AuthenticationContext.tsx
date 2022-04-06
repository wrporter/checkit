import React, { createContext, useContext } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/UserService';
import { getUser } from '../../services/UserService';
import FullPageSpinner from '../../components/utils/FullPageSpinner';
import { User } from './UserContext';

export interface Authentication {
    user?: User;
    onLogin: (request: Promise<void>) => Promise<void>;
    logout: () => Promise<void>;
    register: (signupRequest: Promise<void>) => Promise<void>;
    refetch: () => void;
}

const AuthenticationContext = createContext<Authentication | undefined>(
    undefined
);

function AuthenticationProvider({ ...rest }) {
    const [firstAttemptFinished, setFirstAttemptFinished] =
        React.useState(false);
    const {
        data: user,
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

    const value = React.useMemo(() => {
        async function onLogin(loginRequest: Promise<void>) {
            await loginRequest;
            await refetch();
            navigate('/', { replace: true });
        }

        async function register(signupRequest: Promise<void>) {
            await signupRequest;
            await refetch();
            navigate('/', { replace: true });
        }

        async function logout() {
            await authService.logout();
            await refetch();
            navigate('/');
        }

        return {
            user,
            onLogin,
            logout,
            register,
            refetch,
        };
    }, [user, refetch, navigate]);

    if (!firstAttemptFinished && isLoading) {
        return <FullPageSpinner />;
    }

    return <AuthenticationContext.Provider value={value} {...rest} />;
}

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
