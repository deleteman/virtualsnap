import { PRICING_PLANS } from "@/utils/consts";
import {updateUserCustomerID, setUserCreditsAndPlan, cancelUserSubscription} from '@/utils/userUtils'

function getPlanCode(data) {
    let plan_id = data.plan.id
    let user_plan = PRICING_PLANS.find( p => p.id == plan_id)
    if(user_plan) {
        return user_plan.code
    } else{
        console.log("ERROR: plan not found for plan_id: ", plan_id)
        return -1;
    }
}

function getPlanCredits(data) {
    let plan_id = data.plan.id
    let user_plan = PRICING_PLANS.find( p => p.id == plan_id)
    if(user_plan) {
        return user_plan.credits
    } else{
        console.log("ERROR: plan not found for plan_id: ", plan_id)
        return -1;
    }
}


export default async function handler(req, res) {

    if(req.body.type == 'payment_method.attached') {
        console.log("---------------- ATTACHED ------------------")
        console.log(req.body.data.object.billing_details.email)
        console.log(req.body.data.object.customer)
        console.log("---------------- /ATTACHED ------------------")
        let result = await updateUserCustomerID(
                req.body.data.object.billing_details.email,
                req.body.data.object.customer
            )
        if(result) {
            res.statusCode = 200;
            return res.end(JSON.stringify({
                success: true
            }));
        }
        
    } else if(req.body.type == 'invoice.paid') {
        console.log("----------- invoice paid---------------")
        console.log(req.body.data.object.customer)
        console.log(req.body.data.object.lines.data)
        let itemData = req.body.data.object.lines.data.find( d => d.amount > 0)
        let result = await setUserCreditsAndPlan(
                    req.body.data.object.customer_email, 
                    getPlanCredits(itemData), 
                    getPlanCode(itemData),
                    itemData.subscription)
        if(result) {
            res.statusCode = 200;
            return res.end(JSON.stringify({
                success: true
            }));
        } else {
            res.statusCode = 500;
            console.log("ERROR while trying to set the credits for the user..")
            return res.end(JSON.stringify({
                success: flase
            }));
 
        }

    } else if(req.body.type == 'customer.subscription.updated') {
        console.log("-------- subscription udpated -------------")
        console.log(req.body.data.object)
        let subscriptionData = req.body.data.object

        if(subscriptionData.cancel_at != null) {
            try {
                let cancelRes = await cancelUserSubscription(subscriptionData.id)
                if(cancelRes) {
                    res.statusCode = 200;
                    return res.end(JSON.stringify({
                        success: true
                    }));
       
                } else {
                    res.statusCode = 500;
                    console.log("ERROR while trying to cancel a user's subscription")
                    return res.end(JSON.stringify({
                        success: false
                    }));
                }
            } catch(e) {
                res.statusCode = 500;
                console.log("ERROR while trying to cancel a user's subscription")
                return res.end(JSON.stringify({
                    success: false
                }));

            }

        } else {
            let itemData = req.body.data.object
            let result = await setUserCreditsAndPlan(
                    null,
                    getPlanCredits(itemData), 
                    getPlanCode(itemData),
                    itemData.id)
    
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({
            success: true
        }));

        console.log("-------- subscription udpated -------------")
    } else {
        console.log("Ignoring ", req.body.type)
        res.statusCode = 200;
        return res.end(JSON.stringify({}))
    }
    //console.log(req.body)
}