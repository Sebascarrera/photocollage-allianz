import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Editor.css';
import frame from '../assets/Frame2.png';
import logoAllianz from '../assets/logo-allianz.png'; // 👈 Asegúrate de tener este archivo

const Editor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [personalEmail, setPersonalEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false); // 👈 nuevo estado
  const navigate = useNavigate();

  useEffect(() => {
    const source = localStorage.getItem('imageSource');
    if (source === 'file') {
      const uploaded = localStorage.getItem('uploadedImage');
      if (uploaded) {
        setImageSrc(uploaded);
        setCapturedImage(uploaded);
      }
    }
  }, []);

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
        setCameraReady(true);
        setCapturedImage(null);
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
      });
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const context = canvasRef.current.getContext('2d');
    const video = videoRef.current;

    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const handleSend = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const imgSrc = capturedImage || imageSrc;

    if (imgSrc) {
      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;

        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        context.font = "30px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText(message, canvas.width / 2, canvas.height - 50);

        const marco = new Image();
        marco.src = frame;
        marco.onload = async () => {
          context.drawImage(marco, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');

          try {
            await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
              to_email: personalEmail || 'sebascarreramoya@gmail.com',
              final_photo: dataUrl,
              message: message
            }, 'YOUR_PUBLIC_KEY');

            console.log('Correo enviado');

            const collage = JSON.parse(localStorage.getItem('collageImages') || '[]');
            collage.push({ dataUrl });
            localStorage.setItem('collageImages', JSON.stringify(collage));

            localStorage.removeItem('uploadedImage');
            localStorage.removeItem('imageSource');

            // Mostrar popup de agradecimiento
            setShowPopup(true);

            setTimeout(() => {
              setShowPopup(false);
              navigate('/');
            }, 5000);

          } catch (error) {
            console.error('Error enviando email:', error);
            alert('Error al enviar el correo.');
          }
        };
      };
      img.src = imgSrc;
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setImageSrc(null);
    setMessage('');
    if (streaming) startCamera();
  };

  const showCaptured = capturedImage || imageSrc;

  return (
    <div className="editor-container">
      <div className="frame-container">
        <img src={frame} alt="Frame" className="frame-img" />
        {showCaptured ? (
          <img src={showCaptured} alt="Captured" className="photo-preview" />
        ) : (
          <video ref={videoRef} className="video-feed" />
        )}
        <div className="message-overlay">{message}</div>
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="message-input"
        placeholder="Escribe tu mensaje aquí"
      />

      <div className="email-input">
        <label htmlFor="personalEmail">Correo personal (opcional):</label>
        <input
          type="email"
          id="personalEmail"
          placeholder="tucorreo@gmail.com"
          value={personalEmail}
          onChange={(e) => setPersonalEmail(e.target.value)}
        />
      </div>

      <div className="button-container">
        {!streaming && !imageSrc && (
          <button className="editor-button" onClick={startCamera}>
            Activar Cámara
          </button>
        )}
        {streaming && !capturedImage && cameraReady && (
          <button className="editor-button" onClick={handleCapture}>
            Tomar Foto
          </button>
        )}

        {showCaptured && (
          <>
            <button className="editor-button" onClick={handleSend}>
              Enviar
            </button>
            <button className="editor-button" onClick={handleRetry}>
              Repetir
            </button>
          </>
        )}
      </div>

      <footer className="footer">
        <p>
          <a href="https://www.allianz.co/seguridad-y-politica-de-datos/politicas-de-privacidad.html" target="_blank" rel="noopener noreferrer">
            Política de privacidad
          </a>
          {' '}|{' '}
          <a href="https://www.allianz.co/cookie-policy.html" target="_blank" rel="noopener noreferrer">
            Política de cookies
          </a>
        </p>
      </footer>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* POPUP de agradecimiento */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          zIndex: 9999,
          color: '#fff',
          textAlign: 'center',
          padding: '30px'
        }}>
          <img src={logoAllianz} alt="Allianz Logo" style={{ maxWidth: '180px', marginBottom: '20px' }} />
          <h2>Allianzers, muchas gracias por participar en el photocollage de la Semana de la Inclusión.</h2>
        </div>
      )}
    </div>
  );
};

export default Editor;
