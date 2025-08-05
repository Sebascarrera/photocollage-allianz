import React, { createContext, useContext, useState } from 'react'

const CollageContext = createContext()

export function useCollage() {
  return useContext(CollageContext)
}

export function CollageProvider({ children }) {
  const [images, setImages] = useState([])
  const [counter, setCounter] = useState(1)

  const addImage = (dataUrl) => {
    const newNumber = counter.toString().padStart(3, '0')
    setImages([...images, { dataUrl, number: newNumber }])
    setCounter(counter + 1)
  }

  return (
    <CollageContext.Provider value={{ images, addImage }}>
      {children}
    </CollageContext.Provider>
  )
}
