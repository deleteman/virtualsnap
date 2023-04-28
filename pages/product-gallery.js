import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProductPreview from '@/components/ProductPreview';
import { Alert, Modal } from 'react-bootstrap';
import ProductList from '@/components/ProductList';
import {getUserProducts} from '@/utils/userUtils';
import { Spinner } from 'react-bootstrap';
import jwt from 'jsonwebtoken';
import JSZip from "jszip";

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
        usr_logged: false,
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
      photos: (photos) ? photos.map( photo => photo.url) : []
    }
  })

  //console.log(JSON.stringify(products))
  return {
    props: {
      usr_logged: true,
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



  const handleImageUpload = async (files, name) => {

    console.log("handling image upload...")
    console.log("product name: ", name)
    console.log(files)

    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFile = new File([zipBlob], "training-images-" + (new Date()).getTime() + ".zip",  {
      type: 'application/zip'
    });
    let uploadedImages = []

    files.push(zipFile) //add the zipfile to the list of files that need to be uploaded
    console.log("files with the zip included")
    console.log(files)

    for(let i = 0; i < files.length; i++) {
        const res = await fetch(
            `/api/s3/?file=${files[i].name}`
            );
        const { url, fields } = await res.json();
        console.log("pre-signed url: ", url)
        console.log(fields)

        const formData = new FormData();

        Object.entries({ ...fields, file: files[i] }).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const upload = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        if (upload.ok) {
            if(files[i].name.indexOf(".zip") != -1) { //it's the zip file
                let zipTrain = await fetch('/api/products/train', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer: ' + localStorage.getItem('jwtToken'),
                        'Content-type': 'application/json'
                      },
                    body: JSON.stringify({
                       url: url + files[i].name,
                       uploadedFiles: uploadedImages,
                       name
                    })
                })
                let zipJSONResp = await zipTrain.json()
                console.log("Zip train result: ")
                console.log(zipTrain)
                if(!zipTrain.error) {
                  return {
                    replicate_id: zipJSONResp.replicate_id,
                    product: zipJSONResp.product
                  }
                }
                return zipJSONResp
            } else { //we're uploading a single image
              uploadedImages.push({
                url: url + fields.key,
              })
            }
            console.log('Image Uploaded successfully!');
        } else {
            console.error('Upload failed.');
            console.error(upload)
            return {
              error: true,
              error_msg: "There was a problem uploading the file to S3, see console for more details"
            }
        }

    }
  }



const CreateProductForm = ({productList ,usr_logged}) => {

  const router = useRouter();

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

  useEffect(() => {
    if(!usr_logged) {
      console.log("there is no data")
      router.push("/login")
    }
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
      let imgUploadResult = await handleImageUpload(photos, name)
      if(!imgUploadResult.error) {
        setProducts([...products, imgUploadResult.product])
      } else {
        setValidationError(imgUploadResult.error_msg)
      }
      setCreating(false)
      console.log("Response received")
      console.log(imgUploadResult);
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
