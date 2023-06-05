import { ERROR_CODE_NO_CREDITS, COSTS_PER_PRODUCT, COSTS_SINGLE_GENERATION, COSTS_UPSCALER, ACTION_PRODUCT_GEN, ACTION_SINGLE_GEN, ACTION_UPSCALE } from "@/utils/consts";
import { getUserCredits } from "@/utils/userUtils";

function getActionCost(action) {
  if(action == ACTION_PRODUCT_GEN) {
    return COSTS_PER_PRODUCT
  }

  if(action == ACTION_SINGLE_GEN) {
    return COSTS_SINGLE_GENERATION
  }

  if(action == ACTION_UPSCALE) {
    return COSTS_UPSCALER
  }
}

export function enoughCredits(handler, action) {
  return async (req, res) => {
    try {
      let credits = getActionCost(action)
      console.log("---------- COSTS ")
 console.log("COSTS_SINGLE_GENERATION", COSTS_SINGLE_GENERATION)
 console.log("COSTS_UPSCALER", COSTS_UPSCALER)
 console.log("COSTS_PER_PRODUCT",COSTS_PER_PRODUCT )




      console.log("Validating credits... cost: ", credits)
      //console.log("Validating token...: ", req.headers)
      let creditsLeft = await getUserCredits(req.user.id)

      if(req.body && req.body.numberPhotos) {
        credits = credits * (+req.body.numberPhotos)
      }
      console.log("Validating if ", creditsLeft, " >= ", credits)

      if(creditsLeft >= credits) {
        return await handler(req, res)
      } else {
        return res.status(401).json({ message: "You don't have enough tokens", error_code: ERROR_CODE_NO_CREDITS});
      }
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Error while validating credits for this action' });
    }
    
  };
}
