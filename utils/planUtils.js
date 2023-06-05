import { PRICING_PLANS } from "./consts";

export function getPlanName(plan_code) {
    let plan = PRICING_PLANS.find( p => p.code == plan_code)
    if(plan) {
        return plan.name;
    }
    console.log("No plan data found for ", plan_code)
    return "FREE";
}