import React, { useRef, useEffect } from 'react'
import marco from '../assets/marco.png'

function ImageEditor({ image, userName }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.src = image

    const marcoImg = new Image()
    marcoImg.src = marco

    img.onload = () => {
      canvas.width = 600
      canvas.height = 750

      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Foto del usuario
      ctx.drawImage(img, 50, 100, 500, 500)

      // Cargar el marco encima
      marcoImg.onload = () => {
        ctx.drawImage(marcoImg, 0, 0, 600, 750)

        // Texto del mensaje
        ctx.fillStyle = '#000'
        ctx.font = '20px sans-serif'
        ctx.fillText('“Yo soy inclusión”', 100, 600)

        // Número ficticio
        ctx.textAlign = "center"; // Centra horizontalmente el texto
        ctx.textBaseline = "bottom"; // Alinea verticalmente por la parte inferior
        ctx.fillText('Participación Nº 001', canvas.width / 2, canvas.height - 10)

// --- AHORA dibujamos el nombre POR ENCIMA DE TODO ---
let fontSize = 18
ctx.font = `${fontSize}px sans-serif`
ctx.fillStyle = '#000'

const maxWidth = 200
while (ctx.measureText(userName).width > maxWidth && fontSize > 8) {
  fontSize--
  ctx.font = `${fontSize}px sans-serif`
}

ctx.textAlign = "right"
ctx.textBaseline = "top"
ctx.fillText(userName, canvas.width - 20, 20)

      }
    }
  }, [image])

  return (
    <div className="mt-6">
      <canvas ref={canvasRef} className="border shadow-lg mx-auto" />
      <div className="mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Enviar
        </button>
      </div>
    </div>
  )
}

export default ImageEditor
