import { withAuth } from "../middleware/auth";

//analog photograph
//const modelVersion = "1f7f51e8b2e43ade14fb7d6d62385854477e078ac870778aafecf70c0a6de006"

//realistic vision
const modelVersion = "db1c4227cbc7f985e335b2f0388cd6d3aa06d95087d6a71c5b3e07413738fa13"
const DEFAULT_STEPS = 150

let PROMPT_TEMPLATES = {
    //'normal': "analog style product photography of <1>, [environment], [shot_type], centered:1.9 ,(in frame:1.9)",
    'normal': "product photography of [input], [environment], [shot_type], centered:1.9 ,(in frame:1.9),bokeh, uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3",
    'person': "detailed photo of (a person using [input]):1.8,[environment], product photography, [shot_type] , centered:1.9 ,(in frame:1.9), bokeh, uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3",
} 
const FIXED_NEGATIVES = "blur, haze, nsfw, naked"

function parseEnvRequirements(env) {
    const envMapping = {
        "random": "",
        "livingroom": "inside the livingroom of a house",
        "bedroom": "inside the bedroom of a house",
        "backyard": "in the backyard of a house, trees, fence",
        "nature": "out in the woods, trail in nature",
        "table": "on top of a table",
        "cube": "on top of a cube",
        "plain": "no environment, plain background",
    }

    if(envMapping[env]) {
        return envMapping[env]
    }
    return ""
}

function getShotType(shotType) {
    if(shotType == 'wide') {
        return '(wide shot:1.8)' 
    }
    if(shotType == 'closeup') {
        return '(closeup shot:1.8)'
    }

    if(shotType == 'extra-wide') {
        return '(extra wide shot:1.8)'
    }

}

function getFinalPrompt({prompt, usedByPerson, shotType, env}) {
    return PROMPT_TEMPLATES[usedByPerson ? 'person' : 'normal']
            .replace("[input]", prompt)
            .replace("[environment]", parseEnvRequirements(env))
            .replace("[shot_type]", getShotType(shotType))
}

export default withAuth(async function handler(req, res) {
    let response = "";

    let negatives = req.body.negatives.split(",")
    console.log(req.body.usedByPerson)
    if(!req.body.usedByPerson) {
        negatives.push("people", "woman", "man", "feet", "hand", "legs")
    }

    let inputObj = { 
                prompt: getFinalPrompt({prompt: req.body.prompt, usedByPerson: req.body.usedByPerson, shotType: req.body.shotType, env: req.body.environment}) ,
                guidance_scale: req.body.guidanceNumber,
                num_outputs: req.body.numberPhotos,
                negative_prompt: `${FIXED_NEGATIVES}, ${negatives.join(",")}`,
                num_inference_steps: DEFAULT_STEPS,
               // lora_urls:  'https://replicate.delivery/pbxt/xy5oy6tstMaaDRnJVuqKehcNP3B48vKp5xg0sOzEWWXlsuUIA/tmp8trorbpcmacrame-teepeezip.safetensors'
                //lora_scales: 0.5
            }

    if(req.body.imgSource) {
        inputObj.image = req.body.imgSource
        inputObj.prompt_strength = req.body.likeness
    }

    if(req.body.seed != -1) {
        inputObj.seed = req.body.seed
    }

    try {
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
            input: inputObj,
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
    //adding original prompt to be used on the front-end
    prediction.metadata = {
        original_prompt: req.body.prompt
    }

    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
  }
)