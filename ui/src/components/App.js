import React from 'react';
import { useUser } from './authentication/UserContext';
import FullPageSpinner from './utils/FullPageSpinner';

const loadAuthenticatedApp = () => import('./AuthenticatedApp');
const AuthenticatedApp = React.lazy(loadAuthenticatedApp);
const UnauthenticatedApp = React.lazy(() => import('./UnauthenticatedApp'));

export default function App() {
    const user = useUser();

    React.useEffect(() => {
        loadAuthenticatedApp();
    }, []);

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}
