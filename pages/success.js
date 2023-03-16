import Link from 'next/link';

export default function Success() {
  return (
    <div className="container">
      <h1>Signup successful!</h1>
      <p>You can now log in.</p>
      <Link href="/login" className="btn btn-primary">
        Login
      </Link>
    </div>
  );
}
