import { updateTrainingStatus} from '@/utils/productUtils';
import {withAuth} from '../middleware/auth'

export default withAuth(async function handler(req, res) {
    const response = await fetch(
      "https://api.replicate.com/v1/predictions/" + req.query.id,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status !== 200) {
      let error = await response.json();
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }
  
    const prediction = await response.json();

    if(prediction.status == "succeeded" || prediction.status == "failed") {
        console.log("Updating status of the training ...")
        console.log(prediction.output)
       updateTrainingStatus(req.query.id, prediction.status, prediction.output) 
    }
    res.end(JSON.stringify(prediction));
  }
)