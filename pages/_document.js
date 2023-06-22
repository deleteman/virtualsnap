import { Html, Head, Main, NextScript } from 'next/document'


export default function Document({data}) {
 return (
    <Html lang="en">
    <title>VirtualSnap - Your virtual product photography studio</title>
    <Head >
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" 
    crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css"
    crossOrigin="anonymous"
    />

    <link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet" />
    <link href="https://cdn.quilljs.com/1.3.7/quill.core.css" rel="stylesheet" />

    
    <script
    src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
    crossOrigin="anonymous"
    async
    ></script>
    <script
    src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"
    crossOrigin="anonymous"
    async
    ></script>
    <script
    src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/js/bootstrap.min.js"
    crossOrigin="anonymous"
    async
    ></script>
    <script defer event-uuid="69b3e0bf-3e02-4d4d-8334-7fcdfdd919bd" src="https://metricswave.com/js/visits.js"></script>
    </Head>
      <body>
        <Main  />
        <NextScript />
      </body>
    </Html>
    )
  }
  