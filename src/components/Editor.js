import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Editor.css';
import frame from '../assets/frame6.png';
import imgGracias from '../assets/img-gracias.png';
import logo1 from '../assets/logo-allianz-azul.png';
import logo2 from '../assets/logo2-azul.png';
import './styles/Header.css';
import { uploadPhoto } from '../services/upload';
import html2canvas from 'html2canvas';
import { onValue, ref, set } from 'firebase/database';
import { db }  from '../services/firebase';

const Editor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const participationNumberRef = useRef(null);

  const [message, setMessage] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [personalEmail, setPersonalEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const [userName, setUserName] = useState("");
  const [participationNumber, setParticipationNumber] = useState('');
  const [showLoader, setShowLoader] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const fileData = location.state?.fileData;

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || "";
    setUserName(storedName);

    const photosRef = ref(db, "photos");
    onValue(photosRef, (snapshot) => {
      const photoCount = snapshot.size;
      // ✅ corregido: usar template string
      setParticipationNumber(`Participante Nº ${String(photoCount + 1).padStart(3, '0')}`);
    });
  }, []);

  useEffect(() => {
    const source = localStorage.getItem('imageSource');
    if (source === 'file') {
      const uploaded = fileData;
      if (uploaded) {
        setImageSrc(uploaded);
        setCapturedImage(uploaded);
      }
    }
  }, [fileData]);

  const startCamera = async () => {
    try {
      setCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS: activar cuando meta-datos estén listos
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          videoRef.current.play().catch(() => {});
        };
      }
      setStreaming(true);
      setCapturedImage(null);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No pudimos acceder a la cámara. Revisa permisos del navegador.");
    }
  };

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCapture = () => {
    if (!cameraReady || !videoRef.current) return;
    const video = videoRef.current;
    const ctx = canvasRef.current.getContext('2d');

    canvasRef.current.width = video.videoWidth || 1080;
    canvasRef.current.height = video.videoHeight || 1920;
    ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

    const dataUrl = canvasRef.current.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const handleSend = async () => {
    if (!containerRef.current) return;

    const imgs = containerRef.current.querySelectorAll('img');
    await Promise.all(Array.from(imgs).map(img =>
      img.complete ? Promise.resolve() : new Promise(res => (img.onload = res))
    ));

    // mostrar número para que quede en el render del canvas
    participationNumberRef.current.style.display = 'block';

    const canvas = await html2canvas(containerRef.current, { useCORS: true });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

    participationNumberRef.current.style.display = 'block';

    try {
      setShowLoader(true);
      await uploadPhoto(personalEmail, blob);
      setShowLoader(false);
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

      await emailjs.send('service_id4vphb', 'template_gs26uzq', {
        email: personalEmail,
        image: dataUrl,
        name: userName // 👈 aquí va el nombre
      }, 'Aln0IHevlG2HrTWwB');

      console.log('Correo enviado');

    } catch (error) {
      console.error('Error enviando email:', error);
      alert('Error al enviar el correo.');
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setMessage('');
    const source = localStorage.getItem('imageSource');
    if (source === "file") {
      navigate('/');
      return;
    }
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
            // 👇 playsInline+muted evita fullscreen en iOS y permite botones superpuestos
            <video
              ref={videoRef}
              className="video-feed"
              autoPlay
              playsInline
              muted
            />
          )}

          {/* Nombre del usuario sobre todo */}
          <div className="username-overlay">{userName}</div>

          {/* Texto sobre la foto */}
          <div className="message-overlay">{message}</div>

          {/* Número de participación */}
          <div className="participation-number" ref={participationNumberRef}>
            <div>{participationNumber}</div>
          </div>
        </div>

        <input
          maxLength={108}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-input"
          placeholder="Escribe dos o tres características que te representen"
        />

        {/*<div className="email-input">
          <label htmlFor="personalEmail">Correo personal (opcional):</label>
          <input
            type="email"
            id="personalEmail"
            placeholder="tucorreo@gmail.com"
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
          />
        </div>*/}

        <div className="button-container">
          {!streaming && !imageSrc && (
            <button className="editor-button" onClick={startCamera}>
              Activar Cámara
            </button>
          )}

          {/* Botón textual de respaldo (se mantiene) */}
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

        <canvas ref={canvasRef} style={{ display: 'none' }} />
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

      {/* POPUP de agradecimiento */}
      {showPopup && (
        <div className="popup-overlay">
          <img src={imgGracias} alt="Allianz Logo" className="popup-image" />
        </div>
      )}

      { showLoader && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default Editor;
