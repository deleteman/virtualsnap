import Link from 'next/link';

export default function Success() {
  return (
    <div className="container signup-box">
        <h1>
            <img src="/logo.png" className='main-logo' />
            You&apos;re in!
      </h1>
      
      <center>
      <Link href="/login" className="btn btn-primary">
        Log in now »
      </Link>
        </center>
    </div>
  );
}
