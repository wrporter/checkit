import React from 'react';
import { useAuthentication } from './AuthenticationContext';

export interface User {
    name: string;
    email: string;
    imageUrl: string;
}

const UserContext = React.createContext<User | undefined>(undefined);

function UserProvider({ ...rest }) {
    const {
        data: { user },
    } = useAuthentication();
    return <UserContext.Provider value={user} {...rest} />;
}

function useUser() {
    const context = React.useContext(UserContext);
    if (context === undefined) {
        throw new Error(`useUser must be used within a UserProvider`);
    }
    return context;
}

export { UserProvider, useUser };
