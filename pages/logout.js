import { destroyCookie } from 'nookies'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import { UserContext } from '@/components/UserProvider'


export default function logout() {
  const router = useRouter()
  const {setUser} = useContext(UserContext)

  useEffect(() => {
    // Destroy the token cookie by setting it to an empty value and a max age of 0
    destroyCookie(null, 'jwtToken', { path: '/', maxAge: 0 })
    localStorage.removeItem('jwtToken')
    setUser(null)


    // Redirect the user to the login page
    router.push('/login')
  }, [])

}
