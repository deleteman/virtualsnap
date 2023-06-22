import { destroyCookie } from 'nookies'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import { UserContext } from '@/components/UserProvider'

export function getServerSideProps(context) {
  let {res} = context
    res.setHeader(
        "Set-Cookie", [
            `jwtToken=deleted; Max-Age=0; HttpOnly; SameSite=Lax; path=/ expires=Thu, 01 Jan 1970 00:00:00 GMT'`,
        ]);

    return ({
      props: {}
    })
 
}

export default function Logout() {
  const router = useRouter()
  const {setUser} = useContext(UserContext)

  useEffect(() => {
    // Destroy the token cookie by setting it to an empty value and a max age of 0
    destroyCookie(null, 'jwtToken', { path: '/', maxAge: 0 })
    localStorage.removeItem('jwtToken')
    setUser(null)
    async function performLogout() {
      let logoutResp = await fetch('/api/logout')
      
      console.log("logout response: ", await logoutResp.json())
      router.push('/')
    }

    performLogout()
    // Redirect the user to the login page
  }, [])

}
