import { useContext, useEffect, useState } from "react";
import { Spinner, Modal, OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { UserContext } from "./UserProvider";
import upscaler from "@/pages/api/upscaler";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatTime(t) {
  return `${Math.fround(t)} s`
}


export function SDPhoto({src, status, id, isUpscaled ,index, moreLikeThis, resetMoreLikeThis}) {
    const [showModal, setShowModal] = useState(false)
    const [imgSrc , setImgSrc] = useState(src)
    const [error, setError] = useState(false)
    const [upscaling , setUpscaling] = useState(false)
    const [isPhotoUpscaled, setIsPhotoUpscaled] = useState(isUpscaled)
    const [generating, setGenerating] = useState(false)
    const [photoStatus, setPhotoStatus] = useState(status)
    const { user } = useContext(UserContext)
    const [timer, setTimer] = useState(0.0)
    const [selectedForCopy, setSelectedForCopy] = useState(false)
    

    const startTime = (new Date()).getTime()

    function handleImageClick() {
        setShowModal(true)
    }

    function handleCloseModal() {
        setShowModal(false)
    }

    function handleCloseErrorModal() {
      setError("")
    }

    function runMoreLikeThis() {
        if(!selectedForCopy) {
          moreLikeThis()
        } else {
          resetMoreLikeThis()
        }
      setSelectedForCopy(!selectedForCopy)
    }

    /*
    useEffect(() => {
      let interval = setInterval(() => {
        console.log(timer)
        let newValue = timer + 10;
        setTimer( newValue)
      }, 10);

      return () => clearInterval(interval)
    }, [])

    */
    async function upscaleDone(resp) {
      console.log("upscale done...", resp)
      let saveResp = await fetch('/api/upscaler/updatePhoto', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Authorization': 'Bearer: ' + localStorage.getItem('jwtToken')
        },
        body: JSON.stringify({
          url: resp.output,
          photo_id: id
        })
      })
      let objResp = await saveResp.json()
      if(objResp.status > 201) {
        setError("Error while saving the upscaled image: ", objResp.error)
      }
      setImgSrc(objResp.url)
      setIsPhotoUpscaled(true)

    }



   async function upscalePhoto() {
    console.log("upscaling photo...")
    setUpscaling(true)
    let upscaleResp = await fetch('/api/upscaler', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer: ' + localStorage.getItem('jwtToken')
      },
      body: JSON.stringify({
        image_id: id,
        url: imgSrc
      })
    })
    upscaleResp= await upscaleResp.json();

    while (
      upscaleResp.status !== "succeeded" &&
      upscaleResp.status !== "failed"
      ) {
        await sleep(1000);
        const response = await fetch("/api/predictions/" + upscaleResp.id,{
          headers: {
            Authorization: 'Bearer: ' + localStorage.getItem('jwtToken')
          }
        });
        upscaleResp= await response.json();
        if (response.status !== 200 || upscaleResp.error) {
          setError(upscaleResp.error);
          setUpscaling(false)
          return;
        }
        console.log({upscaleResp})
      }

    let res = await upscaleDone(upscaleResp, setError)
    setUpscaling(false)
   }

   if(photoStatus == "pending") {
    return (
      <>
        <div className={ "position-relative img-wrapper loading-photo" }>
               <Spinner animation="border" size="sm" />
               {/*<p>
                {timer}
    </p> */}
        </div>
      </>
    )
   }

    return (
        <>
          <Modal show={error != ""} onHide={handleCloseErrorModal} size="lg">
            <Modal.Body>
              {error}
            </Modal.Body>
          </Modal>
          <Modal show={showModal} onHide={handleCloseModal} size="lg">
            <Modal.Body>
              <img src={imgSrc} alt="" style={{ width: '100%' }} />
            </Modal.Body>
          </Modal>
          <div className={ "position-relative img-wrapper " + (isPhotoUpscaled? 'upscaled-photo' : '') }>
            <img src={imgSrc} className="img-thumbnail" onClick={() => handleImageClick()} />
            {/* <Button variant="secondary" className="position-absolute top-0 start-0 p-2 overlay-button" style={{ opacity: 0 }} onClick={moreUsingSeed}>
              More like this batch
            </Button>
            */}
            <Button variant="primary" className="position-absolute top-0 start-0 p-2 overlay-button" style={{ opacity: (upscaling? 1 : 0) }} onClick={upscalePhoto} disabled={upscaling} title="Upscale the photo">
              {upscaling? <Spinner animation="border" size="sm" /> : 
                <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.77 18.3C9.2807 18.3 7.82485 17.8584 6.58655 17.031C5.34825 16.2036 4.38311 15.0275 3.81318 13.6516C3.24325 12.2757 3.09413 10.7616 3.38468 9.30096C3.67523 7.84029 4.39239 6.49857 5.44548 5.44548C6.49857 4.39239 7.84029 3.67523 9.30096 3.38468C10.7616 3.09413 12.2757 3.24325 13.6516 3.81318C15.0275 4.38311 16.2036 5.34825 17.031 6.58655C17.8584 7.82485 18.3 9.2807 18.3 10.77C18.3 11.7588 18.1052 12.738 17.7268 13.6516C17.3484 14.5652 16.7937 15.3953 16.0945 16.0945C15.3953 16.7937 14.5652 17.3484 13.6516 17.7268C12.738 18.1052 11.7588 18.3 10.77 18.3ZM10.77 4.74999C9.58331 4.74999 8.42327 5.10189 7.43657 5.76118C6.44988 6.42046 5.68084 7.35754 5.22672 8.45389C4.77259 9.55025 4.65377 10.7566 4.88528 11.9205C5.11679 13.0844 5.68824 14.1535 6.52735 14.9926C7.36647 15.8317 8.43556 16.4032 9.59945 16.6347C10.7633 16.8662 11.9697 16.7474 13.0661 16.2933C14.1624 15.8391 15.0995 15.0701 15.7588 14.0834C16.4181 13.0967 16.77 11.9367 16.77 10.75C16.77 9.15869 16.1379 7.63257 15.0126 6.50735C13.8874 5.38213 12.3613 4.74999 10.77 4.74999Z" fill="#ffffff"></path> <path d="M20 20.75C19.9015 20.7504 19.8038 20.7312 19.7128 20.6934C19.6218 20.6557 19.5392 20.6001 19.47 20.53L15.34 16.4C15.2075 16.2578 15.1354 16.0697 15.1388 15.8754C15.1422 15.6811 15.221 15.4958 15.3584 15.3583C15.4958 15.2209 15.6812 15.1422 15.8755 15.1388C16.0698 15.1354 16.2578 15.2075 16.4 15.34L20.53 19.47C20.6704 19.6106 20.7493 19.8012 20.7493 20C20.7493 20.1987 20.6704 20.3893 20.53 20.53C20.4608 20.6001 20.3782 20.6557 20.2872 20.6934C20.1962 20.7312 20.0985 20.7504 20 20.75Z" fill="#ffffff"></path> <path d="M10.75 14C10.5519 13.9974 10.3626 13.9176 10.2225 13.7775C10.0824 13.6374 10.0026 13.4481 10 13.25V8.25C10 8.05109 10.079 7.86032 10.2197 7.71967C10.3603 7.57902 10.5511 7.5 10.75 7.5C10.9489 7.5 11.1397 7.57902 11.2803 7.71967C11.421 7.86032 11.5 8.05109 11.5 8.25V13.25C11.4974 13.4481 11.4176 13.6374 11.2775 13.7775C11.1374 13.9176 10.9481 13.9974 10.75 14Z" fill="#ffffff"></path> <path d="M13.25 11.5H8.25C8.05109 11.5 7.86032 11.421 7.71967 11.2803C7.57902 11.1397 7.5 10.9489 7.5 10.75C7.5 10.5511 7.57902 10.3603 7.71967 10.2197C7.86032 10.079 8.05109 10 8.25 10H13.25C13.4489 10 13.6397 10.079 13.7803 10.2197C13.921 10.3603 14 10.5511 14 10.75C14 10.9489 13.921 11.1397 13.7803 11.2803C13.6397 11.421 13.4489 11.5 13.25 11.5Z" fill="#ffffff"></path> </g></svg>
              }
            </Button>
            <Button variant="primary" className="position-absolute top-0 start-10 p-2 overlay-button" style={{ opacity: (generating? 1 : 0) }} onClick={moreLikeThis} disabled={generating} title="More like this one">
              <svg fill="#ffffff" width="32px" height="32px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1468.183 451.76v1468.184H0V451.76h1468.183ZM777.203 800h-112l-.001 318.041H333v112h332.202V1580h112v-349.959H1113v-112H777.202V800ZM1920 0v1468.296h-338.812V338.812H451.704V0H1920Z" fillRule="evenodd"></path> </g></svg>
            </Button>
          </div>
        </>

    );
}