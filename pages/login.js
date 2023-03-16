import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import { UserContext } from '@/components/UserProvider';
import jwt from 'jsonwebtoken';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const {setUser} = useContext(UserContext)
    
    const router = useRouter();

    function keepUserLoggedIn(token) {
        let u = jwt.decode(token)
        setUser(u)
    }    

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                })
            });
            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('jwtToken', token);
                keepUserLoggedIn(token) 
                router.push('/generator');
                setLoading(false)
            } else {
                setLoading(false)
                setError("There was a problem logging you in, check your username and pwd please")
            }
        } catch (error) {
            setLoading(false)
            setError(error.response.data.message);
        }
    };
    
    return (
        <div className="container login-box">
        <h1>
            <img src="/logo.png" className='main-logo' />
            Welcome back!
        </h1>
        <form onSubmit={handleSubmit}>
        <div className="mb-3">
        <label htmlFor="email" className="form-label">
        Email
        </label>
        <input
        type="email"
        className="form-control"
        id="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        />
        </div>
        <div className="mb-3">
        <label htmlFor="password" className="form-label">
        Password
        </label>
        <input
        type="password"
        className="form-control"
        id="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        />
        </div>
        {error && <p className="text-danger">{error}</p>}
       <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : 'Enter »'}
      </button>
      <span className="login-form-sign-up">or <a href="/signup">Sign-up</a> if you haven't yet</span>
        </form>
        </div>
        );
    }
    