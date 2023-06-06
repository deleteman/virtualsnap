
const DEFAULT_STEPS = 50
const DEFAULT_WIDTH=768
const DEFAULT_HEIGHT =640
const DEFAULT_SCHEDULER="DDIM"
const FIXED_NEGATIVES = "blur, haze, nsfw, naked, low quality, 3d, render, drawing"


const modelVersion = "8431dfba7ba601d1db4fc1eeca919a7fbbe91854a18ab25234c2c523b56b866b"

export function getPromptObject(prompt, negatives, guidanceNumber, numberPhotos) {
    console.log("Generaing with deliberate....")
    let inputObj = { 
                prompt: prompt.prompt,
                guidance_scale: guidanceNumber,
                num_outputs: +numberPhotos,
                negative_prompt: `${FIXED_NEGATIVES}, ${negatives.join(",")}`,
                scheduler: DEFAULT_SCHEDULER,
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT,
                num_inference_steps: DEFAULT_STEPS,
            }
        
    /*if(prompt.lora && prompt.lora.length > 0) {
        inputObj.lora_urls = prompt.lora.reduce((acc, lora) => (acc? acc+"|"+lora.url: lora.url), "")
        inputObj.lora_scales = prompt.lora.reduce((acc, lora) => (acc? acc+"|"+lora.weight: lora.weight), "")
    }

    if(req.body.imgSource) {
        inputObj.image = req.body.imgSource
        inputObj.prompt_strength = req.body.likeness
    }
    */


    return {
        inputObj,
        modelVersion
    }

}