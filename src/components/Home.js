// src/components/Home.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
import logo1 from '../assets/logo-allianz-azul.png';
import logo2 from '../assets/logo2-azul.png';
import './styles/Header.css';

import { ref, onChildAdded } from "firebase/database";
import { db } from '../services/firebase';


function Home() {
  const [userName, setUserName] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [collageImages, setCollageImages] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    const photosRef = ref(db, "photos");
    onChildAdded(photosRef, (snapshot) => {
      const photo = snapshot.val();
      setCollageImages((prev) => [...prev, { dataUrl: photo.url }]);
    });
  }, []);

  // recalcula layout (cols/rows) para que el grid ocupe 100% ancho/alto
  useEffect(() => {
    const container = backgroundRef.current;
    if (!container) return;

    const computeLayout = () => {
      const n = Math.max(1, collageImages.length);
      const rect = container.getBoundingClientRect();
      const W = rect.width || window.innerWidth;
      const H = rect.height || window.innerHeight;
      const R = W / H || 1;

      // fórmula para columnas: aproxima distribución "cuadrada" teniendo en cuenta el aspecto del contenedor
      let cols = Math.max(1, Math.round(Math.sqrt(n * R)));
      if (cols > n) cols = n;

      const rows = Math.max(1, Math.ceil(n / cols));
      const gapPx = 4; // gap en px (ajústalo si quieres)

      container.style.setProperty('--cols', cols.toString());
      container.style.setProperty('--rows', rows.toString());
      container.style.setProperty('--gap', `${gapPx}px`);
    };

    // recalcular cuando cambien imágenes y cuando cambie el tamaño de la ventana
    const t = setTimeout(computeLayout, 40);
    window.addEventListener('resize', computeLayout);

    // si hay imágenes nuevas, queremos recomputar después de que carguen
    const imgs = Array.from(container.querySelectorAll('img'));
    imgs.forEach(img => {
      if (!img.complete) img.onload = computeLayout;
    });

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', computeLayout);
    };
  }, [collageImages]);

  const handleTakePhoto = () => {
    if (!authorized) return;
    localStorage.setItem('userName', userName);
    localStorage.setItem('imageSource', 'camera');
    navigate('/editor');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && authorized) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('userName', userName);
        localStorage.setItem('imageSource', 'file');
        navigate('/editor', { state: { fileData: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="home-static-bg">
      <div className="custom-header" onClick={() => navigate('/')}>
        <img src={logo1} alt="Logo 1" className="custom-header-logo" />
        <img src={logo2} alt="Logo 2" className="custom-header-logo" />
      </div>

      <div className="home-container">
        {/* grid del collage: posicion fija para cubrir toda la ventana */}
        <div className="home-background" ref={backgroundRef}>
          {collageImages.map((img, idx) => (
            <img
              key={idx}
              src={img.dataUrl}
              alt={`photo-${idx}`}
              style={{ animationDelay: `${(idx % 12) * 0.12}s` }} /* delay por imagen */
            />
          ))}
        </div>

        <div className="home-content">
          <h1 className="home-title">Semana de la Inclusión Allianz</h1>
          <p className="home-description">
            Celebra con nosotros la diversidad en la Semana de la Inclusión.
          </p>

          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Escribe tu nombre"
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: '1px solid #ccc',
              marginBottom: '1rem',
              paddingRight: '0rem'
            }}
          />
          <label className="home-checkbox">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
            />{' '}
            Autorizo el tratamiento de mis datos personales.
          </label>

          <div className="home-buttons">
            <button
              onClick={handleTakePhoto}
              disabled={!authorized}
              className="take-photo"
            >
              Tomar foto
            </button>
            <button
              onClick={() => authorized && fileInputRef.current.click()}
              disabled={!authorized}
              className="upload-photo"
            >
              Subir foto
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="footer">
          <a href="https://www.allianz.co/seguridad-y-politica-de-datos/politicas-de-privacidad.html" target="_blank" rel="noopener noreferrer">
            Política de privacidad
          </a>{' '}
          |{' '}
          <a href="https://www.allianz.co/cookie-policy.html" target="_blank" rel="noopener noreferrer">
            Política de cookies
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
