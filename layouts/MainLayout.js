
import NavigationBar from '@/components/NavigationBar'

import cookies from 'next-cookies';
import jwt from 'jsonwebtoken';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/components/UserProvider';


export default function Layout({ children, data }) {
    const {setUser } = useContext(UserContext)

    useEffect(() => {
        console.log("setting user")
        let u = jwt.decode(localStorage.getItem('jwtToken'))
        console.log(u)
        setUser(u)
    }, [])
  return (
    <div className='main-container'>
       <NavigationBar /> 
      <main className="content">{children}</main>
      <div className='footer bg-dark'></div>
    </div>
  )
}