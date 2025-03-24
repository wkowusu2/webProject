import React from 'react'
import { useNavigate } from 'react-router-dom'; 

export default function Network() {
  const navigate = useNavigate();
  const handleGo = () => {
    navigate('/connections')
  }
  return (
    <div>Network
      <button onClick={handleGo}>Go</button>
    </div>
  )
}
