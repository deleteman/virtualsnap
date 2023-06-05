import { useState, useEffect } from "react"
import { COSTS_SINGLE_GENERATION } from '@/utils/consts';
import {  Form } from 'react-bootstrap';


export default function PhotoCountSelector({outterRef}) {

    const [photoCount, setNumber] = useState(4)
  const [currentCost, setCurrentCost] = useState(0)

    useEffect(() => {
        setCurrentCost(COSTS_SINGLE_GENERATION * photoCount)
    },[photoCount])



    return (
        <>
    <Form.Select 
        className='form-control'
        ref={outterRef}
        id="number_photos"
        onChange={(evt) => setNumber(evt.target.value)}
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4" selected>4</option>
      </Form.Select>
      <div className='generation-cost'>This generation will cost you <span className='costs'>{currentCost}</span> tokens</div>
    </>
    )

}