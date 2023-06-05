import { getPromptObject as realisticVision } from "./realisticVision";
import { getPromptObject as deliberate } from "./deliberate";

export function getPromptObject(prompt, negatives, guidanceNumber, numberPhotos, imgSource, seed) {

    if( (prompt.lora && prompt.lora.length > 0) || (imgSource.source!= null)) {
        return realisticVision(prompt, negatives, guidanceNumber, numberPhotos, imgSource, seed)
    } else {
        return deliberate(prompt, negatives, guidanceNumber, numberPhotos)
    }
}