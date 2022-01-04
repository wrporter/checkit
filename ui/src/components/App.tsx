import React from 'react';
import FullPageSpinner from './utils/FullPageSpinner';
import { useAuthentication } from '../context/user';

const loadAuthenticatedApp = () => import('./AuthenticatedApp');
const AuthenticatedApp = React.lazy(loadAuthenticatedApp);
const UnauthenticatedApp = React.lazy(() => import('./UnauthenticatedApp'));

export default function App() {
    const { user } = useAuthentication();

    // React.useEffect(() => {
    //     loadAuthenticatedApp();
    // }, []);

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}
