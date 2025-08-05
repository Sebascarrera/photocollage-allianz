import React from 'react'

function Footer() {
  return (
    <footer className="text-center text-sm text-gray-600 p-4 mt-8">
      <a
        href="https://www.allianz.co/seguridad-y-politica-de-datos/politicas-de-privacidad.html"
        target="_blank"
        rel="noopener noreferrer"
        className="underline mx-2"
      >
        Política de privacidad
      </a>
      |
      <a
        href="https://www.allianz.co/cookie-policy.html"
        target="_blank"
        rel="noopener noreferrer"
        className="underline mx-2"
      >
        Política de cookies
      </a>
    </footer>
  )
}

export default Footer
