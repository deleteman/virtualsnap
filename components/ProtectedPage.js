
// components/ProtectedPage.js

import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { UserContext } from './UserProvider';

function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    return token !== null;
}

function ProtectedPage(Component) {
    const {setUser} = useContext(UserContext)
    return function WithProtectedPage(props) {
        const router = useRouter();
        
        // Check if user is authenticated
        const isAuthenticated = checkAuth();
        
        useEffect(() => {
            // Redirect to login page if user is not authenticated
            if (!isAuthenticated) {
                setUser(null)
                router.push('/login');
            }
        }, [isAuthenticated, router]);
        
        // Render the protected page component
        return <Component {...props} />;
    };
}

export default ProtectedPage;


