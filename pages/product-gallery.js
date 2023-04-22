import { useEffect, useState } from 'react';
import ProductPreview from '@/components/ProductPreview';
import { Alert, Modal } from 'react-bootstrap';
import ProductList from '@/components/ProductList';
import {getUserProducts} from '@/utils/userUtils';
import { Spinner } from 'react-bootstrap';
import jwt from 'jsonwebtoken';

export async function getServerSideProps(context) {

  const {req} = context
  //console.log(req.cookies)
  const token = req.cookies['jwtToken']
  //console.log("token. ", token)
  const usrData = jwt.decode(token)

  if(!usrData) {
    console.log("No user information found on token...")
    return {
      props: {
        productList: []
      }
    }
  }

  const products = await getUserProducts(usrData.id)
  const serialProducts = products.map( p => {
    let photos = p.photos;
    return {
      name: p.name, 
      id: p._id.toString(),
      replicate_id: p.replicate_id || null   ,
      status: p.status || null,
      photos: photos.map( photo => photo.url)
    }
  })

  //console.log(JSON.stringify(products))
  return {
    props: {
      productList: serialProducts
    }
  }
}

function watchPendingTraining(pid, tid, updateCb) {
  if(tid == '' || !tid) return;
 const interval = setInterval(async () => {
  console.log("Checking status of product: ", pid)
  const trainingRes = await fetch(`/api/products/${tid}`, {
     headers: {
          'Authorization': 'Bearer: ' + localStorage.getItem('jwtToken')
        },
  }
  )
  const resObj = await trainingRes.json()
  if(resObj.status == "succeeded" || resObj.status == "failed") {
    console.log("Status update ready, changing to: ", resObj.status)
    updateCb(pid, resObj.status)
    clearInterval(interval)
  }
 }, 1000)
}


const CreateProductForm = ({productList}) => {
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const [products, setProducts] = useState([]);
  const [creating, setCreating] = useState(false)

  function updateProductStatus(id, status) {
    let newProductList = products.map( p => {
      if(p.id != id) return p;
      p.status = status;
      return p;
    })
    setProducts(newProductList)
  }

  useEffect( () => {
    products.forEach( p => {
      if(p.status == "training") {
        watchPendingTraining(p.id, p.replicate_id, updateProductStatus)
      } 
    })
 
  },[products])

  useEffect( () => {
    console.log("Setting product list from backend data...")
    console.log(productList)
    setProducts(productList)
 }, [])

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleFileChange = (event) => {
    let shownPhotos = (Array.from(event.target.files)).map( f => { 
       f.url = URL.createObjectURL(f) //we add the URL so we can display it before uploading it
       return f
    })
    setPhotos([...photos, ...shownPhotos]);
  };

  function handleCloseErrorBox() {
    setValidationError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreating(true)

    if(name == "") {
        return setValidationError("The name of the product is mandatory")
    }
    if(photos.length < 5) {
        return setValidationError("Please upload at least 5 photos of your product")
    }
    const formData = new FormData();
    formData.append('name', name);
    photos.forEach((photo) => formData.append('photos', photo));

    try {
      const response = await fetch('/api/products/train', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer: ' + localStorage.getItem('jwtToken')
        },
 
      });
      const respJSON = await response.json()
      if(response.status >= 200 && response.status < 300) {
        setProducts([...products, respJSON.product])
      } else {
        setValidationError(error.message)
      }
      setCreating(false)
      console.log("Response received")
      console.log(respJSON);
    } catch (error) {
      setCreating(false)
      setValidationError(error.message)
      console.error(error);
    }
  };

  return (
    <div className='container'>
        <div className="row">
            <div className="col-md-12"> 
            <Modal show={validationError != null}  onHide={handleCloseErrorBox} size='lg'>
                <div className='new-product-error-msg'>
                    <div className="row">
                        <div className="col-md-1 p-0">
                            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z" fill="#af5050"></path></g></svg>
                        </div>
                        <div className="col-md-10">
                            <h3>There was a problem:</h3>
                            {validationError}
                        </div>
                     </div>
                </div>
            </Modal>
   <form className="p-4" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Product Name <i>make a note of what you use here, because you&apos;ll need it during the generation phase</i>
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="photos" className="form-label">
          Product Photos <i>upload at least <strong>5 photos</strong> of your product from different angles with a clear background for best results</i>
        </label>
        <input
          type="file"
          className="form-control"
          id="photos"
          multiple
          onChange={handleFileChange}
        />
      </div>
      <div className='original-product-gallery'>
        {photos.length ? photos.map( (p, idx) => <ProductPreview src={p.url} key={idx}></ProductPreview>)
                :  <Alert variant='info'>No pictures uploaded yet</Alert>
        }
      </div>
      <button type="submit" className="btn btn-primary">
            {creating ? <Spinner animation="border" size="sm" /> : "Create product"}
      </button>
    </form>
            </div>
        </div>
        <div className='product-list-container'>
          <h2>Existing products</h2>
          <ProductList products={products} />
        </div>
    </div>
 
  );
};

export default CreateProductForm;
