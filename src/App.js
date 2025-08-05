import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Editor from './components/Editor'
import { CollageProvider } from './components/CollageContext'

function App() {
  return (
    <CollageProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between bg-white text-black">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor" element={<Editor />} />
          </Routes>
        </div>
      </Router>
    </CollageProvider>
  )
}

export default App
