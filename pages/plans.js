import { getPlanName } from '@/utils/planUtils';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import cookies from 'next-cookies';
import jwt from 'jsonwebtoken';
import { updateUserCookieWithDB } from '@/utils/userUtils';
import { UserContext } from '@/components/UserProvider';

const __TEST_MODE = false


const prices = {
    "starter": {
        "m": {
          price: "€10 / month",
          link: 'https://buy.stripe.com/test_eVa2azdKq0z52I03ch'
        },
        "y": {
          price: "€100 / year",
          link: 'https://buy.stripe.com/test_aEUdThcGm95B4Q86os'
        }
    },
    "designer": {
        "m": {
          price: "€30 / month",
          link: 'https://buy.stripe.com/test_5kAcPd0XEftZciAeUU', 
        },
        "y": {
          price: "€300 / year",
          link: 'https://buy.stripe.com/test_9AQ7uT5dU0z52I08wz'
        }
    },
    "photographer": {
        "m": {
          price: "€45 / month",
          link: 'https://buy.stripe.com/test_bIY2az35M6Xt6Yg6op'
        },
        "y": {
          price: "€430 / year",
          link: 'https://buy.stripe.com/test_7sI3eD6hY4Pl96odQS'
        }
    }
}




export async function getServerSideProps(context) {
  
  const {req, res, query} = context
  
  const updateCookie = query?.update_cookie
  console.log("Update cookie: ", query)

  req.cookies = cookies(context);
  
  
  
  let token = req.cookies['jwtToken']
  let usrData = jwt.decode(token)

  if(updateCookie) {
    [usrData, token] = await updateUserCookieWithDB(usrData, res)
  }

  if(!usrData) {
    return {
      props: {
        data: null
      }
    }
  }
  
 return {
    props: {
      user: usrData,
      update_token: updateCookie || false,
      token
    },
  }
}

const Pricing = ({user, update_token, token}) => {
    const [selected, setSelected] = useState(false)
    const [plan, setPlan] = useState('m')
    const {setUser} = useContext(UserContext)

    useEffect(() => {
      if(update_token) {
        localStorage.setItem('jwtToken', token)
        setUser(user) 
      }
    }, [])
 
  return (
    <Container className='pricing-page'>
      <h1 >
        Unlock the power of AI
      </h1>
      <div className='centered'>
</div>

    {user && <p>
      Your current plan is: <span className='plan-name'>{getPlanName(user.plan)}</span>
      </p>}
      <p>Pick the plan that best suites your needs</p>

      <Row>
        <Col>
        {!__TEST_MODE && (<><script async src="https://js.stripe.com/v3/pricing-table.js"></script>
<stripe-pricing-table pricing-table-id="prctbl_1NFcM3GFk8GiSjjaOsVpah3L"
publishable-key="pk_live_51N7hKAGFk8GiSjja2zmRRjfcBEqK0YeZp0xQuxauf4uhC56WBzl0gtyilqTKX6snqtWgbM3IeLvmN3btx6dqiGLg00rr5KPJU9">
</stripe-pricing-table></>)}
        {__TEST_MODE && (<><script async src="https://js.stripe.com/v3/pricing-table.js"></script>
<stripe-pricing-table pricing-table-id="prctbl_1NEr33GFk8GiSjjaTwRUXC1r"
publishable-key="pk_test_51N7hKAGFk8GiSjja9UV0cRbSMdBvjFTaCJpq03HxcUgqG1z48yWkBmcMxfNvIZ1trTE7YxLgISqSxX3nmOpS3yL900yCQUb8Vd">
</stripe-pricing-table></>)}
        </Col>
      </Row>
    </Container>
  );
};

export default Pricing;
