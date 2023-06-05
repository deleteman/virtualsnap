const DEFAULT_STEPS = 50
const DEFAULT_WIDTH=768
const DEFAULT_HEIGHT =640
const DEFAULT_SCHEDULER="DDIM"
const FIXED_NEGATIVES = "blur, haze, nsfw, naked, low quality"


const modelVersion = "db1c4227cbc7f985e335b2f0388cd6d3aa06d95087d6a71c5b3e07413738fa13"

export function getPromptObject(prompt, negatives, guidanceNumber, numberPhotos, imgSource, seed) {
    console.log("Making prompt with Realistic vision....")
    console.log(imgSource)
    let inputObj = { 
                prompt: prompt.prompt,
                guidance_scale: guidanceNumber,
                num_outputs: numberPhotos,
                negative_prompt: `${FIXED_NEGATIVES}, ${negatives.join(",")}`,
                scheduler: DEFAULT_SCHEDULER,
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT,
                num_inference_steps: DEFAULT_STEPS,
            }
        
    if(prompt.lora && prompt.lora.length > 0) {
        inputObj.lora_urls = prompt.lora.reduce((acc, lora) => (acc? acc+"|"+lora.url: lora.url), "")
        inputObj.lora_scales = prompt.lora.reduce((acc, lora) => (acc? acc+"|"+lora.weight: lora.weight), "")
    }

    if(imgSource.source) {
        inputObj.image = imgSource.source
        inputObj.prompt_strength = imgSource.likeness
    }

    if(seed != -1) {
        inputObj.seed = seed
    }


    return {
        inputObj,
        modelVersion
    }

}