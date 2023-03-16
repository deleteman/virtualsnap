import { withAuth } from "../middleware/auth";
import FormData from 'form-data'

const modelVersion = "32fdb2231d00a10d33754cc2ba794a2dfec94216579770785849ce6f149dbc69"

export default withAuth(async function handler(req, res) {
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
                scale: 8,
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
    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
  }
)