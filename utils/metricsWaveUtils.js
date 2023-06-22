
export const EVENT_TYPES = {
    login: "login",
    generation: "gen"
}

const EVENTS = {
    "login": "https://metricswave.com/webhooks/e0da607b-ac91-4868-ba40-9212d0eb7f17?email={value}&timestamp={value}&plan={value}&result={value}",
    "gen": "https://metricswave.com/webhooks/7fae27da-5fde-47d1-a98d-d09d81b98760"
}

export async function logEvent(eventType, payload) {
    let notifyResp = null;
    console.log("Sending an event to metricswave...")
    if(eventType == "login") {
        notifyResp = await fetch(EVENTS[eventType]
                        .replace("{value}", payload.email)
                        .replace("{value}", (new Date()).getTime())
                        .replace("{value}", (payload.plan))
                        .replace("{value}", (payload.result))
                    )
    }

    if(eventType == EVENT_TYPES.generation) {
        notifyResp = await fetch(EVENTS[eventType], {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        })    
    }

    console.log("----")
    console.log(await notifyResp.text())
    console.log("----")

}