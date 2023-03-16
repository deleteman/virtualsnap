import ErrorModal from '@/components/ErrorModal';
import { SDPhoto } from '@/components/SDPhoto';
import { getUserPhotos } from '@/utils/getUserPhotos';
import { useContext, useEffect, useState } from 'react';
import { Button, Spinner, Form } from 'react-bootstrap';
import cookies from 'next-cookies';
import { useRouter } from 'next/router';


import jwt from 'jsonwebtoken';
import { UserContext } from '@/components/UserProvider';

const DEFAULT_NUMBER_PHOTOS = 4;

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

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
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
      prompt_input: input
    })
  })

  let jsonRes = await res.json()
  return {
    url: jsonRes.url,
    id: jsonRes.saved_to_db
  }
}

async function predictionDone(prediction, setError ) {
  if(prediction.status == 'succeeded') {
    let newPhotos = prediction.output.map(o => ({
      path: o,
      seed: parseSeedFromLog(prediction.logs)
    }))
    try {
      for (let photo of newPhotos) {
        let d = await savePermanentPhoto(photo, prediction.input)
        photo.path = d.url;
        photo._id = d.id
      }
    } catch (e) {
      console.log("Error saving photos")
      console.log(e)
      return false;
    }
    return newPhotos
  }
  if(prediction.status == 'failed') {
    setError(prediction.error)
    return false
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
  environment
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
        environment
      }),
    });

}


function MyComponent({data}) {
  const router = useRouter();

  const { user }  = useContext(UserContext)

  const [productPrompt, setProductPrompt] = useState(' a mobile phone on top of a grey surface ');
  const [guidanceNumber, setGuidanceNumber] = useState(9);
  const [negatives, setNegatives] = useState('');
  const [usedByPerson, setUsedByPerson] = useState(false);
  const [numberPhotos, setNumberPhotos] = useState(DEFAULT_NUMBER_PHOTOS);
  const [gallery, setGallery] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState("random");
  const [shotType, setShotType] = useState("closeup");
  const [seed, setSeed] = useState(-1);

  useEffect(() => {
    if(seed != -1) {
      handleSubmit()
    }
  }, [seed])

  useEffect(() => {
    if(!data) {
      router.push("/login")
    } else {
      setGallery(buildGallery(data))
      console.log("Gallery")
      console.log(gallery)
    }
  }, [])

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
    setLoading(true)
    const response = await makeRequest({
      productPrompt,
        guidanceNumber,
        negatives,
        numberPhotos,
        seed,
        usedByPerson,
        shotType,
        environment
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      setLoading(false)
      return;
    }

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
    console.log(placeholders)
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
          setError(prediction.detail);
          setLoading(false)
          return;
        }
        console.log({prediction})
      }

      let res = await predictionDone(prediction, setError)
      if(res != false) {
          let temp = [] 
          placeholders.forEach( gphoto => {
            if(gphoto.status == "pending") {
              temp.push(res.shift())
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
      <div className="container">
        <ErrorModal show={error != null} onClose={handleCloseErrorModal} errorMessage={error}/>
      <div className="row">
      <div className="col-md-4">
      <Form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="product-prompt">Describe your product:</label>
        <textarea
        className="form-control"
        placeholder="Describe your product with as much detail as you can..."
        id="product-prompt"
        value={productPrompt}
        onChange={(e) => setProductPrompt(e.target.value)}
        />
        
      </div>
        <Form.Check
        type='switch'
        label="Used by a person?"
        id="used-by-person"
        onChange={(e) => setUsedByPerson(e.target.checked)}
        />

        <Form.Check
        type="radio"
        inline
        label="Close-up shot"
        name="shot-type"
        id="shot-type-close"
        value="shot-type-close"
        onChange={() => setShotType("closeup")}
        />

        <Form.Check
        type="radio"
        inline
        label="Wide shot"
        name="shot-type"
        id="shot-type-wide"
        value="shot-type-wide"
        onChange={() => setShotType("wide")}
        />
        
      <Form.Text
      type="number"
      label="Guidance number:"
      id="guidance-number"
      value={guidanceNumber}
      onChange={(e) => setGuidanceNumber(e.target.value)}
      />
      <div className="form-group">
      <label htmlFor="background-color">Elements to avoid:</label>
      <input
      type="text"
      className="form-control"
      placeholder="Write what you don't want to see on the picture..."
      id="negatives"
      value={negatives}
      onChange={(e) => setNegatives(e.target.value)}
      />
      </div>
      <div className="form-group">
      <label htmlFor="number_photos">Number of photos:</label>
      <input
        type="number"
        max={4}
        className="form-control"
        id="number_photos"
        value={numberPhotos}
        onChange={(e) => setNumberPhotos(e.target.value)}
      />
      </div>
      <Form.Group>
        <Form.Label>Environment</Form.Label>
        <Form.Select 
        className='form-control'
        onChange={(e) => setEnvironment(e.target.value)}
        >
          <option value="random">Random</option>
          <option value="livingroom">A livingroom</option>
          <option value="kitchen">Inside the Kitchen</option>
          <option value="backyard">Backyard</option>
          <option value="nature">Nature</option>
          <option value="table">On top of a table</option>
          <option value="cube">On top of a cube</option>
          <option value="plain">Plain background</option>
        </Form.Select>
      </Form.Group>
      <div className="form-group">
      <label htmlFor="number_photos">Add your own product:</label>
      <div className='your-product-box'>
        Coming soon!
      </div>
      </div>

      <button type="submit" className="btn btn-primary float-right" disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : 
         <>
           <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" fill-rule="evenodd" clipRule="evenodd" d="M18.3945 7H18.3944C18.079 7 17.9213 7 17.7739 6.9779C17.3177 6.90952 16.8991 6.6855 16.5891 6.34382C16.4889 6.23342 16.4015 6.1022 16.2265 5.83975L16 5.5C15.6036 4.90544 15.4054 4.60816 15.1345 4.40367C14.9691 4.27879 14.7852 4.18039 14.5895 4.112C14.2691 4 13.9118 4 13.1972 4H10.8028C10.0882 4 9.73092 4 9.41048 4.112C9.2148 4.18039 9.03094 4.27879 8.86549 4.40367C8.59456 4.60816 8.39637 4.90544 8 5.5L7.7735 5.83975C7.59853 6.1022 7.51105 6.23342 7.4109 6.34382C7.10092 6.6855 6.68235 6.90952 6.2261 6.9779C6.07869 7 5.92098 7 5.60555 7H5.60554C5.04256 7 4.76107 7 4.52887 7.05628C3.80101 7.2327 3.23271 7.801 3.05628 8.52887C3 8.76107 3 9.04256 3 9.60555V16C3 17.8856 3 18.8284 3.58579 19.4142C4.17157 20 5.11438 20 7 20H8L16 20H17C18.8856 20 19.8284 20 20.4142 19.4142C21 18.8284 21 17.8856 21 16V9.60555C21 9.04256 21 8.76107 20.9437 8.52887C20.7673 7.801 20.199 7.2327 19.4711 7.05628C19.2389 7 18.9574 7 18.3945 7ZM12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" fill="#ffffff"></path> <path d="M18.3944 7C18.9574 7 19.2389 7 19.4711 7.05628C20.199 7.2327 20.7673 7.801 20.9437 8.52887C21 8.76107 21 9.04256 21 9.60555L21 16C21 17.8856 21 18.8284 20.4142 19.4142C19.8284 20 18.8856 20 17 20L16 20L8 20L7 20C5.11438 20 4.17157 20 3.58579 19.4142C3 18.8284 3 17.8856 3 16L3 9.60555C3 9.04256 3 8.76107 3.05628 8.52887C3.23271 7.801 3.80101 7.2327 4.52887 7.05628C4.76107 7 5.04257 7 5.60555 7V7C5.92098 7 6.07869 7 6.2261 6.9779C6.68235 6.90952 7.10092 6.6855 7.4109 6.34382C7.51105 6.23342 7.59853 6.1022 7.7735 5.83975L8 5.5C8.39637 4.90544 8.59456 4.60816 8.86549 4.40367C9.03094 4.27879 9.2148 4.18039 9.41048 4.112C9.73092 4 10.0882 4 10.8028 4L13.1972 4C13.9118 4 14.2691 4 14.5895 4.112C14.7852 4.18039 14.9691 4.27879 15.1345 4.40367C15.4054 4.60816 15.6036 4.90544 16 5.5L16.2265 5.83975C16.4015 6.1022 16.4889 6.23342 16.5891 6.34382C16.8991 6.6855 17.3177 6.90952 17.7739 6.9779C17.9213 7 18.079 7 18.3944 7V7Z" stroke="#ffffff" strokeWidth="2" stroke-linejoin="round"></path> <path d="M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="#ffffff" strokeWidth="2"></path> </g></svg>
           Start snapping!
         </>
        }
      </button>

      </Form>
      </div>
      { /* right column */ }
      <div className="col-md-8">
      <div className="row" id="image-gallery">
      {gallery && gallery.map( (photo,idx) => {
        return (
          <div className="col-md-4" key={"container-" + photo._id}>
          <SDPhoto status={photo.status} src={photo.path} id={photo._id} isUpscaled={photo.upscaled} key={photo._id} moreUsingSeed={() => setSeed(photo.seed)}/>
          </div>
          )
        })}
        </div>
        </div>
        </div>
        </div>
        );
      }
      
      export default MyComponent;
      