import React, { useRef, useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Editor.css';
import frame from '../assets/Frame3.png';
import imgGracias from '../assets/img-gracias.png'; // 👈 Asegúrate de tener este archivo
import logo1 from '../assets/logo-allianz-azul.png';
import logo2 from '../assets/logo2-azul.png'; // tu segundo logo
import './styles/Header.css';
import { uploadPhoto } from '../services/upload';
import html2canvas from 'html2canvas';

const Editor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [personalEmail, setPersonalEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false); // 👈 nuevo estado
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

useEffect(() => {
  const storedName = localStorage.getItem('userName') || "";
  setUserName(storedName);
}, []);

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

    if (!containerRef.current) return;

    const imgs = containerRef.current.querySelectorAll('img');
        await Promise.all(Array.from(imgs).map(img => 
        img.complete ? Promise.resolve() : new Promise(resolve => img.onload = resolve)
    ));

    const canvas = await html2canvas(containerRef.current, { useCORS: true });

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    try {
      await uploadPhoto(personalEmail, blob);
      
      // Mostrar popup de agradecimiento
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        navigate('/');
      }, 5000);
    } catch (error) {
      console.error('Error al subir la foto:', error);
      alert('Error al subir la foto.');
    }

    if (!personalEmail || personalEmail.trim() === '') {
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');

      await uploadPhoto(personalEmail, blob, userName); // si tu servicio lo admite
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        to_email: personalEmail || 'sebascarreramoya@gmail.com',
        final_photo: dataUrl,
        message: message,
        name: userName // 👈 aquí va el nombre
      }, 'YOUR_PUBLIC_KEY');

      console.log('Correo enviado'); 

    } catch (error) {
      console.error('Error enviando email:', error);
      alert('Error al enviar el correo.');
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setImageSrc(null);
    setMessage('');
    if (streaming) startCamera();
  };

  return (
    <div className="home-static-bg">
      <div className="custom-header" onClick={() => navigate('/')}>
       <img src={logo1} alt="Logo 1" className="custom-header-logo" />
       <img src={logo2} alt="Logo 2" className="custom-header-logo" />
      </div>
      <div className="editor-container">
        <div className="frame-container" ref={containerRef}>
          <img src={frame} alt="Frame" className="frame-img" />
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="photo-preview" />
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

          {capturedImage && (
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
          <div className="popup-overlay">
            <img src={imgGracias} alt="Allianz Logo" className="popup-image" />
          </div>
        )}
      </div>
      </div>
  );
};

export default Editor;
