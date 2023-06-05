import { useState } from "react";
import {   Form } from 'react-bootstrap';
import NoSSR from "./NoSSR";
import { Tooltip } from 'react-tooltip'

export const DEFAULT_LIKENESS = 0.2

export default function LikenessSlider({disabled, outterRef}) {
    const [likeness, setLikeness] = useState(DEFAULT_LIKENESS);

    return (
        <>
      <Form.Label>Likeness to selected image (more/less)
        <a className="fas fa-question-circle" data-tooltip-id="likeness-tooltip" data-tooltip-html="Select how similar is your <br />new image to the sample one."   data-bs-placement="top" >
        </a>

      <NoSSR>
        <Tooltip id="likeness-tooltip" />
      </NoSSR >



      </Form.Label>
       <input type="range" 
        id="likeness" 
        name="likeness" 
        min="0" 
        max="1" 
        step="0.01" 
        value={likeness} 
        ref={outterRef}
        disabled={disabled}
        onChange={(e) => setLikeness(e.target.value)}
        />
        </>
    )
}