import { getLoraURL } from "@/utils/productUtils";
const { Configuration, OpenAIApi } = require("openai");

const DEFAULT_LORA_SCALE = 0.8 //used for custom products

const _LORAS_ = {
    /* */
    "jewelry": {
        url: "https://replicate.delivery/pbxt/VBK2HDF7vI7SF90ZQC3QS6xAnE18PJo18FsaSDJxreaIa1dIA/tmpwc7tuow8jewelryzip.safetensors",
        //url: "https://civitai.com/api/download/models/32976",
        weight: 1.0
    },
    //*/
   /*"rust": {
        url:"https://replicate.delivery/pbxt/oUYRYsPdK4ZvJtkISXZF5uei7MoPhVAsZ8UEkaTOB2cxfP7QA/tmplx_13y0vrustzip.safetensors",
        weight: 0.86
    },*/
    /* */
    "food": {
        url: "https://replicate.delivery/pbxt/51E4pWLH9gKdJ9pqnKo4C3vroyHyr1qYiaejIY33Jk8J4idIA/tmph9zp73cnfood-photoszip.safetensors",
        weight: 0.86
    },
    //*/
    /*"portrait": {
        url: "https://civitai.com/api/download/models/53221",
        weight: 1.0
    },
    "headshot": {
        url: "https://civitai.com/api/download/models/53221",
        weight: 1.0
    }*/
}



let PROMPT_TEMPLATES = {
    //'normal': "analog style product photography of <1>, [environment], [shot_type], centered:1.9 ,(in frame:1.9)",
    'normal': "commercial photography of [input], (artistic:1.5), (action shot:1.9), (hard shadows:1.4),[environment], [shot_type],(hyper detailed), (studio light), (pro color grading), (shot on 70mm lens), (canon camera), (8k), (centered:1.9) ,(in frame:1.9),bokeh, uhd, dslr, (high quality:1.8)",
    //'normal': "masterpiece, product photography of [input], [environment], [shot_type], centered:1.9 ,(in frame:1.9),bokeh, 8k uhd, dslr, soft lighting, (high quality:1.8),  Fujifilm XT3",
    'normal_wide_shot': "masterpiece, high quality photo of [input], [environment], [shot_type], centered:1.9 ,(in frame:1.9),bokeh, 8k uhd, dslr, soft lighting, (high quality:1.8), Fujifilm XT3",
    'person': "masterpiece, detailed photo of (a person using [input]):1.8,[environment], product photography, [shot_type] , centered:1.9 ,(in frame:1.9), bokeh, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3",
} 

export function parseEnvRequirements(env) {
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

export function getShotType(shotType) {
    if(shotType == 'shot-type-wide') {
        return '(wide shot:1.8)' 
    }
    if(shotType == 'shot-type-close') {
        return '(close up shot:1.8), (35mm:1.4), (f 1.4:1.4)'
    }
    
    if(shotType == 'shot-type-extrawide') {
        return '(extra wide shot:1.8)'
    }
    
}

export function getPromptTemplateIndex(usedByPerson, shotType) {
    if(usedByPerson) {
        return 'person'
    }
    if(!shotType) return 'normal';
    
    if(shotType.indexOf("wide") != -1) {
        return 'normal_wide_shot'
    }
    return 'normal'
}


export async function getFinalPrompt({prompt, usedByPerson, shotType, env}, user_id) {
    const productNameRegExp = /\{([a-zA-Z 0-9]+)\}/g;
    let index = getPromptTemplateIndex(usedByPerson, shotType)
    let text = PROMPT_TEMPLATES[index] //usedByPerson ? 'person' : 'normal']
    .replace("[input]", prompt)
    .replace("[environment]", parseEnvRequirements(env))
    .replace("[shot_type]", getShotType(shotType))
    
    
    
    //let matches = productNameRegExp.exec(text);
    let ret = {
        prompt: text,
        lora: []
    }
    let count = 1;
    let matches = null;
    while( (matches = productNameRegExp.exec(text)) !== null) {
        
        console.log("Match------------------------")
        console.log(matches)
        console.log("--------------------------")
        let lora_url = await getLoraURL(matches[1], user_id)
        ret.prompt = ret.prompt.replace(matches[0], `<${count}>`)
        ret.lora.push({url: lora_url, weight: DEFAULT_LORA_SCALE})
        count++;
    }



    let promptTopics = await getPromptTopics(prompt)

    promptTopics.forEach( t => {
        if(_LORAS_[t]) {
          ret.prompt += `,in the style of <${count}>,`
            ret.lora.push({url: _LORAS_[t].url, weight: _LORAS_[t].weight})
            count++;
        }
    })
    
    
    return ret;
}

function getLORACategories(){
    return Object.keys(_LORAS_)
}



export async function getPromptTopics(prompt) {
    const configuration = new Configuration({
        apiKey: process.env.OPEN_AI_APIKEY,
    });
    const openai = new OpenAIApi(configuration);

    const categories = getLORACategories();

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Analyze the following prompt and try to match as many of the following categories as possible using the exact name of each category: " + categories.join(",") + ". If you can't figure it out, tell me that as well and use the following template for your response: \n Topics: [topic list here] \n Elements: [element list here] . \n Sentence: " + prompt + "  ",
        temperature: 0,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
    });
    
    
    console.log(response.data)
    let resp = response.data.choices[0].text
    const topics = resp.split("\n")[2].replace("Topics: ", "").split(",").map( t => t.trim().toLowerCase())
    const elements = resp.split("\n")[3].replace("Elements: ", "").split(",").map( t => t.trim().toLowerCase())
    return [...topics, ...elements];
    /*
    let totalLoras = 0;
    topics.forEach(t => {
        if(_LORAS_[t]) {
            totalLoras++;

        }
    })
    console.log(topics)
    */
}


