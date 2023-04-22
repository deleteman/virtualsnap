import  React from "react"
import {useState} from 'react'

export default function ProductList({products}) {
    //const [list, setList] = useState(products)

    let list = products;
console.log("product list: ", list)

    return (
        <ul className="product-list">
        {(list && list.length > 0) && list.map((p, idx) => (
                <li key={p.id} className={idx % 2 == 0? "odd" : "even"}>
                    <div className="product-name">{p.name}</div>
                    <div className={["product-status", p.status].join(" ")}><span>{p.status}</span></div>
                    <div className="product-photos">{
                    p.photos.map(url=> <img src={(url.url ? url.url : url)} key={(url.url? url.url: url)}/>)
                    }</div>
                </li>
            ))}
            {(list && list.length == 0) && (
                <div className="alert">There are no products created yet...</div>
            )}
        </ul>
    )
}