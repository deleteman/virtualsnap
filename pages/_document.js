import { Html, Head, Main, NextScript } from 'next/document'


export default function Document({data}) {
 return (
    <Html lang="en">
    <title>VirtualSnap - Your virtual product photography studio</title>
    <Head >
    
    <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css"
    integrity="sha512-Ry/v8gELj9U6doklsoH+TlTz8WpFpvv+jz0LyD1SYGcqO8W6Q9i6vmZM6TcT6rBVw0e3KczBRuvf6QlTD6iAjg=="
    crossOrigin="anonymous"
    />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-J58JNQ33ZKj+gSTrPZ7HdZezGIt8PT+egxMxb+WefRU/1fWf5l5v/s9SNO5C+YKjw2tSkSSg4Im4OKOavjKtHg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <script
    src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
    integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
    crossOrigin="anonymous"
    async
    ></script>
    <script
    src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"
    integrity="sha384-S0EZu1Fp5Z5jS9kH5abCnEl1q+hEzEn4Q4N4bPzl8tD7oZjDd+AHLLNCJ1mYQSPm"
    crossOrigin="anonymous"
    async
    ></script>
    <script
    src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/js/bootstrap.min.js"
    integrity="sha512-WoAzOThjsImtu0l5P9SDhGB5NG0Om5th3akE+N4xarBgktPbPhAbD0q3hrZrE/A9V7ug+IATeIdV7n/6gRzV7w=="
    crossOrigin="anonymous"
    async
    ></script>
    </Head>
      <body>
        <Main  />
        <NextScript />
      </body>
    </Html>
    )
  }
  