

export default function ProductPreview({src}) {

    return (
        <div className="product-preview-photo-wrapper">
         <img src={src} className="product-preview-photo"/>
        </div>
    )
}