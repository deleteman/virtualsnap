import ErrorModal from '@/components/ErrorModal';
import { SDPhoto } from '@/components/SDPhoto';
import { getUserPhotos } from '@/utils/getUserPhotos';
import {  useContext, useEffect, useRef, useState, useReducer } from 'react';
import {  Alert, Spinner, Form } from 'react-bootstrap';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";

import ErrorBoundary from '@/components/Boundary'

import jwt from 'jsonwebtoken';
import { UserContext } from '@/components/UserProvider';
import { getUserProducts } from '@/utils/userUtils';

import { Tooltip } from 'react-tooltip'
import NoSSR from '@/components/NoSSR'
import PhotoCountSelector from '@/components/PhotoCountSelector';
import LikenessSlider, { DEFAULT_LIKENESS } from '@/components/LikenessSlider';



const DEFAULT_NUMBER_PHOTOS = 4;
const DEFAULT_GUIDANCE= 9;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildGallery(data) {
  return data.map( photo => {
    photo.status = "ready"
    return photo
  })
}

export async function getServerSideProps(context) {
  
  const {req} = context
  
  req.cookies = cookies(context);
  
  
  //console.log(req.cookies)
  const token = req.cookies['jwtToken']
  //console.log("token. ", token)
  const usrData = jwt.decode(token)
  console.log(usrData)
  if(!usrData) {
    return {
      props: {
        data: null
      }
    }
  }
  
  const data = await getUserPhotos(usrData.id)
  const products = (await getUserProducts(usrData.id)).map( p => {
    return {
      id: p._id.toString(),
      value: p.name
    }
  })
  // console.log("Get user photos!")
  // console.log(data)
  // console.log("Get user photos!")
  
  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
      products
    },
  }
}


async function savePermanentPhoto(p, input) {
  console.log("Trying to store this file: ", p.path)
  
  //add the seed to the generation data
  input.seed = p.seed
  
  let res = await fetch("/api/predictions/storage", {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer: ' + localStorage.getItem('jwtToken')
    },
    body: JSON.stringify({
      url: p.path,
      metadata: p.metadata,
      prompt_input: input
    })
  })

  let jsonRes = await res.json()

  if(res.status > 201) {
    return {
      error: true, 
      message: jsonRes.error
    }
  }

  return {
    url: jsonRes.url,
    id: jsonRes.saved_to_db,
    cost: jsonRes.cost,
    newToken: jsonRes.newToken
  }
}

async function predictionDone(prediction, setError ) {
  let totalCost = 0;
  if(prediction.status == 'succeeded') {
    let newPhotos = prediction.output.map(o => ({
      path: o,
      seed: parseSeedFromLog(prediction.logs),
      prompt: prediction.input.prompt,
      metadata: prediction.metadata,
      guidance_scale: prediction.input.guidance_scale,
      negative_prompt: prediction.input.negative_prompt
    }))
    try {
      
      for (let photo of newPhotos) {
        let d = await savePermanentPhoto(photo, prediction.input)
        if(d.error){
          setError(d.message)
          p.error = true
        } else {
          photo.path = d.url;
          photo.url = d.url;
          photo._id = d.id
          localStorage.setItem('jwtToken', d.newToken)
          totalCost += d.cost; //reduce the number of credits from this generation
        }       
      }
    } catch (e) {
      console.log("Error saving photos")
      console.log(e)
      return {error: true};
    }
    return {newPhotos, totalCost, error: false}
  }
  if(prediction.status == 'failed') {
    setError(prediction.error)
    return {error: true}
  }
}

function parseSeedFromLog(logMessage) {
  const regex = /Using seed: (\d+)/;
  const match = logMessage.match(regex);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

async function makeRequest({productPrompt,
  guidanceNumber, 
  negatives,
  numberPhotos,
  seed,
  usedByPerson,
  shotType,
  environment,
  imgSource,
  likeness
}) {
  return await fetch("/api/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': 'Bearer: ' + localStorage.getItem('jwtToken')
    },
    body: JSON.stringify({
      prompt: productPrompt,
      guidanceNumber,
      negatives,
      numberPhotos,
      seed,
      usedByPerson,
      shotType,
      environment,
      imgSource,
      likeness
    }),
  });
  
}

const DEFAULT_ENV = "random"
const DEFAULT_SHOT_TYPE = "closeup"
const DEFAULT_SEED = -1
const DEFAULT_IMG_SOURCE = null

function MyComponent({data, products}) {
  const router = useRouter();
  
  const { user }  = useContext(UserContext)

  const [userCredits, setUserCredits] = useState()
  
  const [productPromptValue, setProductPromptValue] = useState('');

  const [numberOfPhotosSelected, setNumberOfPhotosSelected] = useState(DEFAULT_NUMBER_PHOTOS);

  const [guidanceNumber, setGuidanceNumber] = useState(9);
  const refGuidanceNumber = useRef()

  const [negatives, setNegatives] = useState('');
  const refAvoid = useRef();

  const [usedByPerson, setUsedByPerson] = useState(false);
  const refUsedByPerson = useRef()

  //const [numberPhotos, setNumberPhotos] = useState(DEFAULT_NUMBER_PHOTOS);
  let numberPhotos;
  const refNumberPhotos = useRef()


  const [gallery, setGallery] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false);

  const [environment, setEnvironment] = useState(DEFAULT_ENV);
  const refEnvironment = useRef()

  const [shotType, setShotType] = useState(DEFAULT_SHOT_TYPE);
  const refShotTypeClose = useRef()
  const refShotTypeWide = useRef()
  const refShotTypeExtraWide = useRef()
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [imgSource, setImgSource] = useState(DEFAULT_IMG_SOURCE);
  const refPrompt = useRef()

  const refLikeness = useRef()

  const QuillNoSSRWrapper = dynamic( () => import('@/components/PromptEditor'), {ssr: false,
    loading: () => <p>Loading prompt editor...</p>
  })
  
  useEffect(() => {
    if(!data) {
      console.log("there is no data")
      router.push("/login")
    } else {
      console.log("setting gallery from db")
      console.log(data)
      setGallery(buildGallery(data))
     console.log("Gallery")
      console.log(gallery)
    }
    refNumberPhotos.current.value = DEFAULT_NUMBER_PHOTOS
  }, [])

    useEffect(() => {
    if(user) {
      setUserCredits(user.credits)
    }
  }, [user])

  function getShotType() {
    if(refShotTypeClose.current.checked) return refShotTypeClose.current.value;
    if(refShotTypeWide.current.checked) return refShotTypeWide.current.value;
    if(refShotTypeExtraWide.current.checked) return refShotTypeExtraWide.current.value;
  }

  function resetParameters(e) {
    if(e) e.preventDefault()
    refAvoid.current.value = ''
    refEnvironment.current.value = DEFAULT_ENV
    refUsedByPerson.current.checked = false;
    //refShotType.current.value = DEFAULT_SHOT_TYPE
    setSeed(DEFAULT_SEED)
    setImgSource(DEFAULT_IMG_SOURCE)
    refLikeness.current.value = DEFAULT_LIKENESS
    //setLikeness(DEFAULT_LIKENESS)
  }

  function generateFromImage(photo) {
    console.log("Generating more photos like")
    console.log(photo)
    setSeed(photo.seed)
    setImgSource(photo.url)
    setProductPromptValue(photo.metadata?.original_prompt)
    refAvoid.current.value = photo.negative_prompt
  }
  
  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
    //get the product prompt from quill in an efficient way without using internal state
    const productPrompt = document.querySelector(".ql-editor").innerText
    if(productPrompt.trim() == "" ){
      return setError("You must describe your product, something like 'a golden ring with an owl face'")
    }
    setLoading(true)

    setProductPromptValue(productPrompt)
    numberPhotos = refNumberPhotos.current.value; //update this internal variable with the value entered by the user

    const response = await makeRequest({
      productPrompt,
      guidanceNumber:DEFAULT_GUIDANCE,
      negatives: refAvoid.current.value,
      numberPhotos: refNumberPhotos.current.value,
      seed,
      usedByPerson: refUsedByPerson.current.checked,
      shotType: getShotType(),
      //shotType,
      environment: refEnvironment.current.value,
      imgSource,
      likeness: refLikeness.current.value
    });
    let prediction = await response.json();
    let metadata = prediction.metadata; //saving the metadata of this generation
    
    if (response.status !== 201) {
      setError(prediction.detail || prediction.message);
      setLoading(false)
      return;
    }

    numberPhotos = refNumberPhotos.current.value;
    
    console.log("Adding ", numberPhotos, " new empty photos")
    console.log("Size of the gallery: ", gallery.length)
    let placeholders = []
    for(let i = 0; i < numberPhotos; i++) {
      placeholders.push({
        status: "pending",
        _id: Math.random()
      })
    }
    placeholders = [...placeholders, ...gallery]
    //console.log(placeholders)
    setGallery(placeholders)
    console.log("ADDED ", numberPhotos, " new empty photos")
    console.log("Size of the gallery: ", gallery.length)
    
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
      ) {
        await sleep(1000);
        const response = await fetch("/api/predictions/" + prediction.id,{
          headers: {
            Authorization: 'Bearer: ' + localStorage.getItem('jwtToken')
          }
        });
        prediction = await response.json();
        if (response.status !== 200) {
          placeholders.splice(numberPhotos) //remove the pending placeholders
          setGallery(placeholders)
          setError(prediction.detail);
          setLoading(false)
          return;
        }
        console.log({prediction})
      }
      
      prediction.metadata = metadata //re-adding the metadata to the last reponse
      let {error, newPhotos, totalCost} = await predictionDone(prediction, setError)
      if(error == false) {
        setUserCredits(userCredits - totalCost);
        let temp = [] 
        placeholders.forEach( gphoto => {
          if(gphoto.status == "pending") {
            let p = newPhotos.shift()
            temp.push(p.error ? gphoto : p)
          } else {
            temp.push(gphoto)
          }            
        })
        setGallery(temp)
        //setGallery([...res, ...gallery])
      } 
      setLoading(false)
      
    };
    
    function handleCloseErrorModal() {
      setError(null)
    }
    
    return (
      <div className="container generator">
      <ErrorModal show={error != null} onClose={handleCloseErrorModal} errorMessage={error}/>
      <div className="row">
      <div className="col-md-8 col-lg-4">
      <Form onSubmit={handleSubmit}>

      <div class="credits-indicator">
        You have <span class="credits">{(user) ? userCredits : 0}</span> tokens left 
      </div>


      <div className="form-group">
      <label htmlFor="product-prompt">
          Describe your product:
          <a data-tooltip-id="my-tooltip" data-tooltip-content='Use "{" to open the dropdown with your custom products and select one from the list.'>
            <span className='app-tooltip'>?</span>
          </a>
      </label>
      <NoSSR>
        <Tooltip id="my-tooltip" />
      </NoSSR >


      <QuillNoSSRWrapper  products={products}  value={productPromptValue}/>
      {/* <textarea
      className="form-control"
      placeholder="Describe your product with as much detail as you can..."
      id="product-prompt"
      />
    */}
      
      </div>
      <Form.Check
      type='switch'
      label="Are there people in the picture?"
      id="used-by-person"
      ref={refUsedByPerson}
      />
      
      <Form.Check
      type="radio"
      inline
      label="Close-up shot"
      name="shot-type"
      id="shot-type-close"
      value="shot-type-close"
      ref={refShotTypeClose}
      />
      
      <Form.Check
      type="radio"
      inline
      label="Wide shot"
      name="shot-type"
      id="shot-type-wide"
      value="shot-type-wide"
      ref={refShotTypeWide}
      />
    <Form.Check
      type="radio"
      inline
      label="Extra wide shot"
      name="shot-type"
      id="shot-type-extrawide"
      value="shot-type-extrawide"
      ref={refShotTypeExtraWide}
      />
      
      <div className="form-group">
      <label htmlFor="background-color">Elements to avoid:</label>
      <input
      type="text"
      className="form-control"
      placeholder="Write what you don't want to see on the picture..."
      id="negatives"
      ref={refAvoid}
      />
      </div>
      <div className="form-group">
      <label htmlFor="number_photos">Number of photos:</label>
      <PhotoCountSelector outterRef={refNumberPhotos}/>
    </div>
      <Form.Group>
      <Form.Label>Environment</Form.Label>
      <Form.Select 
      className='form-control'
        ref={refEnvironment}
      
      >
      <option value="random">Random</option>
      <option value="livingroom">A livingroom</option>
      <option value="bedroom">A bedroom</option>
      <option value="kitchen">Inside the Kitchen</option>
      <option value="backyard">Backyard</option>
      <option value="nature">Nature</option>
      <option value="table">On top of a table</option>
      <option value="cube">On top of a cube</option>
      <option value="plain">Plain background</option>
      </Form.Select>

      </Form.Group>
 
      <ErrorBoundary>
      <Form.Group>
        <LikenessSlider disabled={imgSource == null} outterRef={refLikeness}/>

      </Form.Group>
  </ErrorBoundary>
     <div className="form-group">
      <label htmlFor="number_photos">Sample product:</label>
      <div className='sample-product-box'>
        {imgSource && <img src={imgSource} />}
        {!imgSource && <div className='no-product-selected'>
        No product selected
        </div>}
      </div>
      </div>


   <button className="btn btn-secondary float-left" disabled={loading} onClick={resetParameters}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><path fill="#fff" fillRule="evenodd" d="M426.667 106.667v42.666L358 149.33c36.077 31.659 58.188 77.991 58.146 128.474-.065 78.179-53.242 146.318-129.063 165.376-75.82 19.058-154.895-15.838-191.92-84.695C58.142 289.63 72.638 204.42 130.348 151.68a85.333 85.333 0 0 0 33.28 30.507 124.587 124.587 0 0 0-46.294 97.066c1.05 69.942 58.051 126.088 128 126.08 64.072 1.056 118.709-46.195 126.906-109.749 6.124-47.483-15.135-92.74-52.237-118.947L320 256h-42.667V106.667h149.334ZM202.667 64c23.564 0 42.666 19.103 42.666 42.667s-19.102 42.666-42.666 42.666c-23.564 0-42.667-19.102-42.667-42.666C160 83.103 179.103 64 202.667 64Z"/></svg>
      Reset
    </button>

      
      <button type="submit" className="btn btn-primary float-right" disabled={loading}>
      {loading ? <Spinner animation="border" size="sm" /> : 
      <>
      <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" fillRule="evenodd" clipRule="evenodd" d="M18.3945 7H18.3944C18.079 7 17.9213 7 17.7739 6.9779C17.3177 6.90952 16.8991 6.6855 16.5891 6.34382C16.4889 6.23342 16.4015 6.1022 16.2265 5.83975L16 5.5C15.6036 4.90544 15.4054 4.60816 15.1345 4.40367C14.9691 4.27879 14.7852 4.18039 14.5895 4.112C14.2691 4 13.9118 4 13.1972 4H10.8028C10.0882 4 9.73092 4 9.41048 4.112C9.2148 4.18039 9.03094 4.27879 8.86549 4.40367C8.59456 4.60816 8.39637 4.90544 8 5.5L7.7735 5.83975C7.59853 6.1022 7.51105 6.23342 7.4109 6.34382C7.10092 6.6855 6.68235 6.90952 6.2261 6.9779C6.07869 7 5.92098 7 5.60555 7H5.60554C5.04256 7 4.76107 7 4.52887 7.05628C3.80101 7.2327 3.23271 7.801 3.05628 8.52887C3 8.76107 3 9.04256 3 9.60555V16C3 17.8856 3 18.8284 3.58579 19.4142C4.17157 20 5.11438 20 7 20H8L16 20H17C18.8856 20 19.8284 20 20.4142 19.4142C21 18.8284 21 17.8856 21 16V9.60555C21 9.04256 21 8.76107 20.9437 8.52887C20.7673 7.801 20.199 7.2327 19.4711 7.05628C19.2389 7 18.9574 7 18.3945 7ZM12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" fill="#ffffff"></path> <path d="M18.3944 7C18.9574 7 19.2389 7 19.4711 7.05628C20.199 7.2327 20.7673 7.801 20.9437 8.52887C21 8.76107 21 9.04256 21 9.60555L21 16C21 17.8856 21 18.8284 20.4142 19.4142C19.8284 20 18.8856 20 17 20L16 20L8 20L7 20C5.11438 20 4.17157 20 3.58579 19.4142C3 18.8284 3 17.8856 3 16L3 9.60555C3 9.04256 3 8.76107 3.05628 8.52887C3.23271 7.801 3.80101 7.2327 4.52887 7.05628C4.76107 7 5.04257 7 5.60555 7V7C5.92098 7 6.07869 7 6.2261 6.9779C6.68235 6.90952 7.10092 6.6855 7.4109 6.34382C7.51105 6.23342 7.59853 6.1022 7.7735 5.83975L8 5.5C8.39637 4.90544 8.59456 4.60816 8.86549 4.40367C9.03094 4.27879 9.2148 4.18039 9.41048 4.112C9.73092 4 10.0882 4 10.8028 4L13.1972 4C13.9118 4 14.2691 4 14.5895 4.112C14.7852 4.18039 14.9691 4.27879 15.1345 4.40367C15.4054 4.60816 15.6036 4.90544 16 5.5L16.2265 5.83975C16.4015 6.1022 16.4889 6.23342 16.5891 6.34382C16.8991 6.6855 17.3177 6.90952 17.7739 6.9779C17.9213 7 18.079 7 18.3944 7V7Z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"></path> <path d="M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="#ffffff" strokeWidth="2"></path> </g></svg>
      Start snapping!
      </>
    }
    </button>
    
    </Form>
    </div>
    { /* right column */ }
    <div className="col-md-12 col-lg-8">
    <div className="row" id="image-gallery">
      <ErrorBoundary>
    {gallery.length > 0 && gallery.map( (photo,idx) => {
      return (
        <div className="col-md-4" key={"container-" + photo._id}>
        <SDPhoto status={photo.status} 
                src={photo.path} 
                id={photo._id} 
                isUpscaled={photo.upscaled} 
                key={photo._id} 
                moreLikeThis={() => generateFromImage(photo)}
                resetMoreLikeThis={() => resetParameters()}
                reduceUserCredits={(creds) => setUserCredits(userCredits - creds)}
          />
        </div>
        )
      })
      }
      {gallery.length == 0 && <Alert className="info no-snaps-notification">You haven&#39;t snapped any pictures yet!</Alert> }
      </ErrorBoundary>
      </div>
      </div>
      </div>
      </div>
      );
    }
    
    export default MyComponent;
    