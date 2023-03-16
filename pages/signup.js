import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [betaKey, setBetaKey] = useState('');
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            betaKey,
        })
      }
      );
      if(response.status > 201) {
        const error = await response.json()
        console.log(error)
        return setError(error.message)
      }      
      router.push('/success');
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div className="container signup-box">
      <h1>
            <img src="/logo.png" className='main-logo' />
            Welcome!
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
        <div className="mb-3">
          <label htmlFor="betaKey" className="form-label">
            Beta access key
          </label>
          <input
            type="text"
            className="form-control"
            id="betaKey"
            value={betaKey}
            onChange={(event) => setBetaKey(event.target.value)}
            required
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Create your account
        </button>

      <span className="login-form-sign-up">or <a href="/login">Log in</a> if you have one already!</span>
      </form>
    </div>
  );
}
