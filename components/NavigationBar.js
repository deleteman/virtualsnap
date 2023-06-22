import Link from 'next/link'
import { NavLink, NavItem, Navbar, Nav, NavDropdown, Image } from 'react-bootstrap'
import md5 from 'crypto-js/md5'
import { useContext } from 'react'
import { UserContext } from './UserProvider'
import { useRouter } from 'next/router'

function NavigationBar() {
  const {user} = useContext(UserContext)
  const router = useRouter()
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className='justify-content-end'>
      <Link href="/generator">
        <Navbar.Brand>
          <img src='/logo.png' className='header-logo' />
          <div className=''>
            VirtualSnap
            <div  className='motto'>Your virtual product photography studio</div>
          </div>
        </Navbar.Brand>
      </Link>
      {!user && <Navbar.Collapse id="navbar-nav" className='justify-content-end'>
        <Nav  pullLeft>
          <NavLink href="/plans" active={router.pathname.indexOf('plans') != -1 }   >
              Pricing
          </NavLink>
          <NavLink href="https://medium.com/the-online-sales-scoop" target='_blank'   >
              Blog
          </NavLink>
           <NavLink href="/login" active={router.pathname.indexOf('login') != -1 }   >
              Log-in
          </NavLink>
 
        </Nav>


      </Navbar.Collapse>}
      {user && <Navbar.Collapse id="navbar-nav" className='justify-content-end'>
        <Nav  pullLeft>
          <NavLink href="/plans" active={router.pathname.indexOf('plans') != -1 }   >
              Get more tokens!
          </NavLink>


          <NavLink href="/generator" active={router.pathname.indexOf('generator') != -1 }   >
              Photo studio
          </NavLink>


          <NavLink href="/product-gallery"  active={router.pathname.indexOf('product-gallery') != -1} >
              Product Gallery
          </NavLink>
      </Nav>
      <Nav>
          <NavDropdown
            title={
              <div className="d-flex align-items-center">
                <Image
                  src={"https://www.gravatar.com/avatar/" + md5(user.email)}
                  alt="User Avatar"
                  roundedCircle
                  width={40}
                  height={40}
                  className="mr-2"
                />
              </div>
            }
          >
            <Link href="">
              <NavDropdown.Item>Profile (pending)</NavDropdown.Item>
            </Link>
            <Link href="">
              <NavDropdown.Item>Settings (pending)</NavDropdown.Item>
            </Link>
            <Link href="https://billing.stripe.com/p/login/test_eVa16bfdVe5NcO4aEE">
              <NavDropdown.Item href="https://billing.stripe.com/p/login/test_eVa16bfdVe5NcO4aEE">Billing</NavDropdown.Item>
            </Link>
            <NavDropdown.Divider />
            <NavDropdown.Item href="/logout">Log out</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
     }
    </Navbar>
  )
}

export default NavigationBar
