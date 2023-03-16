import { destroyCookie } from 'nookies'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import { UserContext } from '@/components/UserProvider'


export default function Index() {
  const router = useRouter()
  const {setUser} = useContext(UserContext)

  useEffect(() => {
    // Redirect the user to the login page
    router.push('/login')
  }, [])

}
