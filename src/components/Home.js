import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
import logo1 from '../assets/logo-allianz.png';
import logo2 from '../assets/logo2.png'; // tu segundo logo
import './styles/Header.css';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onChildAdded } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDnPdCa_Z7V5qxvnE8Mk_nsnVZHz_4UXbw",
  authDomain: "collage-5507d.firebaseapp.com",
  databaseURL: "https://collage-5507d-default-rtdb.firebaseio.com",
  projectId: "collage-5507d",
  storageBucket: "collage-5507d.firebasestorage.app",
  messagingSenderId: "515067725517",
  appId: "1:515067725517:web:6c8a1423d7af3860930b84",
  measurementId: "G-NR7QPKVHPP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


function Home() {
  const [authorized, setAuthorized] = useState(false);
  const [collageImages, setCollageImages] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const photosRef = ref(db, "photos");

    onChildAdded(photosRef, (snapshot) => {
      const photo = snapshot.val();
      setCollageImages((prev) => [...prev, { dataUrl: photo.url }]);
    });
  }, []);

  const handleTakePhoto = () => {
    if (!authorized) return;
    localStorage.setItem('imageSource', 'camera');
    navigate('/editor');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && authorized) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('uploadedImage', reader.result);
        localStorage.setItem('imageSource', 'file');
        navigate('/editor');
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
        <div className="home-background">
          {collageImages.map((img, idx) => (
            <img key={idx} src={img.dataUrl} alt={`photo-${idx}`} />
          ))}
        </div>

        <div className="home-content">
          <h1 className="home-title">Semana de la Inclusión Allianz</h1>
          <p className="home-description">
            Celebra con nosotros la diversidad en la Semana de la Inclusión.
          </p>

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
          <a
            href="https://www.allianz.co/seguridad-y-politica-de-datos/politicas-de-privacidad.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de privacidad
          </a>{' '}
          |{' '}
          <a
            href="https://www.allianz.co/cookie-policy.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de cookies
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
