

export async function trainLORA(seed, zip_url, task = "object", resolution = 512 ) {
    let response = null;
    console.log("Training LORA...")
    const payload = {
            "version": "b2a308762e36ac48d16bfadc03a65493fe6e799f429f7941639a6acec5b276cc", 
           "input": {
                seed,
                task,
                resolution,
                "instance_data": zip_url
            }
        }
    console.log(payload)
   try {
        response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        });

    } catch (err) {
        console.error("Error sending request to Replicate")
        console.log(err)
        res.statusCode = 500;
        return res.end(JSON.stringify({ detail: err.detail }));
    }
    return await response.json()
}