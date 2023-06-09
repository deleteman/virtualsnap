import '@/styles/globals.css'
import '../styles/bootstrap.scss'
import MainLayout from '../layouts/MainLayout'
import { UserProvider } from '@/components/UserProvider'
import{ Analytics } from '@vercel/analytics/react';

import 'react-tooltip/dist/react-tooltip.css'

export default function App({ Component, pageProps }) {
  return <UserProvider>
    <MainLayout>
      <Component {...pageProps} />
       <Analytics/>
</MainLayout>
  </UserProvider>
}
