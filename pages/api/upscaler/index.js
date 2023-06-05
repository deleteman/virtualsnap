import { withAuth } from "../middleware/auth";
import { enoughCredits } from "../middleware/validateCredits";
import { COSTS_UPSCALER } from "@/utils/consts";
import { substractUserCredits } from "@/utils/userUtils";

const modelVersion = "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b"


export default withAuth(enoughCredits(async function handler(req, res) {
    let response = "";

    try {
        let imgURL = req.body.url
        let photoID = req.body.id

        console.log("Upscaling image...", imgURL)

        const imgBinary = imgURL//await image.blob()
   


        response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            // Pinned to a specific version of Stable Diffusion
            // See https://replicate.com/stability-ai/stable-diffussion/versions
            version: modelVersion,
    
            // This is the text prompt that will be submitted by a form on the frontend
            input: {
                image: imgBinary,
                scale: 4,
                face_enhance: true
            }
        }),
        });

    } catch (err) {
        console.error("Error sending request to Replicate")
        console.log(err)
        res.statusCode = 500;
        return res.end(JSON.stringify({ detail: err.detail }));
    }
  
    if (response.status !== 201) {
      let error = await response.json();
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }
  
    const prediction = await response.json();
    console.log(prediction)
    console.log("Updating user credits for the upscale....")
    await substractUserCredits(req.user.id, COSTS_UPSCALER)
    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
  }
, COSTS_UPSCALER))