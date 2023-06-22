

async function go() {

    /*
curl -X POST \
    -H "Authorization: Token a9d79f86a033827c2891df34185ec267aec6f40b" \
    -H "Content-Type: application/json" \
    -d '{
            "input": {
                "instance_prompt": "a photo of a cjw toy car",
                "class_prompt": "a photo of a toy car",
                "instance_data": "s3://virtual-snap-dreambooth/coche.zip",
                "max_train_steps": 2000
            },
            "model": "deleteman/toycar",
            "trainer_version": "a8ba568da0313951a6b311b43b1ea3bf9f2ef7b9fd97ed94cebd7ffd2da66654",
            "ckpt_base": "https://replicate.com/mcai/deliberate-v2/versions/8431dfba7ba601d1db4fc1eeca919a7fbbe91854a18ab25234c2c523b56b866b",
            "webhook_completed": "https://example.com/dreambooth-webhook"
        }' \
    https://dreambooth-api-experimental.replicate.com/v1/trainings
    */

    //trainer:
    //let trainer = "a8ba568da0313951a6b311b43b1ea3bf9f2ef7b9fd97ed94cebd7ffd2da66654"
    let trainer = "a8ba568da0313951a6b311b43b1ea3bf9f2ef7b9fd97ed94cebd7ffd2da66654" //9c41656f8ae2e3d2af4c1b46913d7467cd891f2c1c5f3d97f1142e876e63ed7a"

    let resp = await fetch("https://dreambooth-api-experimental.replicate.com/v1/trainings", {
        method: 'POST',
        headers: {
            "Authorization": "Token a9d79f86a033827c2891df34185ec267aec6f40b",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "input": {
                "instance_prompt": "a cjw toy car",
                "class_prompt": "a toy car",
                "instance_data": "https://virtual-snap-dreambooth.s3.eu-north-1.amazonaws.com/coche-2.zip", //https://virtual-snap-dreambooth.s3.eu-north-1.amazonaws.com/coche.zip",
                "max_train_steps": 800,
                "ckpt_base": "https://huggingface.co/XpucT/Deliberate/resolve/main/deliberate_v2.ckpt",
                "train_text_encoder": true,
                "learning_rate": 0.000002
            },
            "model": "deleteman/toycar-160623",
            "trainer_version": trainer,
            "webhook_completed": "https://example.com/dreambooth-webhook"
        })
    })

    console.log(await resp.json())
}

(async () => {
    await go()
})()