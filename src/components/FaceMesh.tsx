'use client'
import { useEffect, useRef, useState } from 'react'

interface FaceMeshProps {
  imgSrc: string
  visible: boolean
  width: number
  height: number
}

export default function FaceMesh({ imgSrc, visible, width, height }: FaceMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!visible) return

    const run = async () => {
      try {
        const faceapi = await import('face-api.js')
        
        // Charger les modèles si pas encore fait
        if (!faceapi.nets.tinyFaceDetector.isLoaded) {
          await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        }
        if (!faceapi.nets.faceLandmark68Net.isLoaded) {
          await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        }

        // Créer un élément image temporaire
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imgSrc

        await new Promise((res, rej) => {
          img.onload = res
          img.onerror = rej
        })

        // Détecter le visage + landmarks
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }))
          .withFaceLandmarks()

        if (!detection) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Scale des landmarks à la taille du canvas
        const scaleX = width / img.naturalWidth
        const scaleY = height / img.naturalHeight
        const landmarks = detection.landmarks.positions

        ctx.clearRect(0, 0, width, height)

        // Dessiner les connexions du mesh
        const CONNECTIONS = [
          // Mâchoire 0-16
          ...Array.from({length:16}, (_,i) => [i, i+1]),
          // Sourcil gauche 17-21
          ...Array.from({length:4}, (_,i) => [17+i, 18+i]),
          // Sourcil droit 22-26
          ...Array.from({length:4}, (_,i) => [22+i, 23+i]),
          // Nez vertical 27-30
          ...Array.from({length:3}, (_,i) => [27+i, 28+i]),
          // Nez horizontal 31-35
          ...Array.from({length:4}, (_,i) => [31+i, 32+i]),
          // Oeil gauche 36-41
          [36,37],[37,38],[38,39],[39,40],[40,41],[41,36],
          // Oeil droit 42-47
          [42,43],[43,44],[44,45],[45,46],[46,47],[47,42],
          // Bouche extérieure 48-59
          ...Array.from({length:11}, (_,i) => [48+i, 49+i]), [59,48],
          // Bouche intérieure 60-67
          ...Array.from({length:7}, (_,i) => [60+i, 61+i]), [67,60],
        ]

        ctx.strokeStyle = 'rgba(0,245,255,0.55)'
        ctx.lineWidth = 0.8
        CONNECTIONS.forEach(([a, b]) => {
          const pa = landmarks[a], pb = landmarks[b]
          if (!pa || !pb) return
          ctx.beginPath()
          ctx.moveTo(pa.x * scaleX, pa.y * scaleY)
          ctx.lineTo(pb.x * scaleX, pb.y * scaleY)
          ctx.stroke()
        })

        // Points
        ctx.fillStyle = '#00F5FF'
        landmarks.forEach(pt => {
          ctx.beginPath()
          ctx.arc(pt.x * scaleX, pt.y * scaleY, 2, 0, Math.PI * 2)
          ctx.fill()
        })

        setReady(true)
      } catch (e) {
        console.log('Face detection skipped:', e)
      }
    }

    run()
  }, [imgSrc, visible])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none',
        opacity: ready && visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        filter: 'drop-shadow(0 0 3px #00F5FF)',
      }}
    />
  )
}
