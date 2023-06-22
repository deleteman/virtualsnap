import { getFinalPrompt } from "@/utils/promptUtils";
import { withAuth } from "../middleware/auth";
import { getPromptObject } from "@/utils/models/index.js";
import { enoughCredits } from "../middleware/validateCredits";
import { ACTION_SINGLE_GEN, COSTS_SINGLE_GENERATION } from "@/utils/consts";
import { EVENT_TYPES, logEvent } from "@/utils/metricsWaveUtils";



export default withAuth(enoughCredits(async function handler(req, res) {
    let response = "";

    const {user} = req;

    let negatives = req.body.negatives.split(",")
    if(!req.body.usedByPerson) {
        negatives.push("(people:1.9)", "(woman:1.99)", "(man:1.99)", "(feet:1.99)", "(hand:1.99)", "(legs:1.99)", "(fingers: 1.99)") 
    }
    negatives.push("deformed iris", "deformed pupils", "semi-realistic", "cgi", "3d", "render", "sketch", "cartoon", "drawing", "anime:1.4", "text", "cropped", "out of frame", 
        "worst quality", "low quality", "jpeg artifacts", "ugly", "duplicate", "morbid", "mutilated", "extra fingers", "mutated hands", "poorly drawn hands", 
        "poorly drawn face", "mutation", "deformed", "blurry", "dehydrated", "bad anatomy", "bad proportions", "extra limbs", "cloned face", "disfigured", 
        "gross proportions", "malformed limbs", "missing arms", "missing legs", "extra arms", "extra legs", "fused fingers", "too many fingers", "long neck", "watermark", "logo")
    
    let prompt = await getFinalPrompt({prompt: req.body.prompt, usedByPerson: req.body.usedByPerson, shotType: req.body.shotType, env: req.body.environment}, req.user.id);
    let {inputObj, modelVersion} = getPromptObject(prompt, 
                                    negatives, 
                                    req.body.guidanceNumber, 
                                    req.body.numberPhotos,
                                    { source: req.body.imgSource, likeness: req.body.likeness},
                                    req.body.seed
                                    )
    console.log("Doing prediction with this data:")
    console.log(inputObj)
    try {
        response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            version: modelVersion,
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
        original_prompt: req.body.prompt,
        full_input: inputObj
    }

    await logEvent(EVENT_TYPES.generation, {
        email: user.email,
        plan: user.plan,
        prompt: prediction.metadata.original_prompt,
        model_used: modelVersion
    })

    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
  }
, ACTION_SINGLE_GEN))