import React from 'react';
import { useAuthentication } from './AuthenticationContext';

export interface User {
    displayName: string;
    email: string;
    imageUrl: string;
    image: string;
}

const UserContext = React.createContext<User | undefined>(undefined);

function UserProvider({ ...rest }) {
    const { user } = useAuthentication();
    return <UserContext.Provider value={user} {...rest} />;
}

function useUser(): User {
    const context = React.useContext(UserContext);
    if (context === undefined) {
        throw new Error(`useUser must be used within a UserProvider`);
    }
    return context;
}

export { UserProvider, useUser };
