'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HoloBody({ score = 72 }: { score?: number }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth || 390
    const H = mount.clientHeight || 500

    // SCENE
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(0, 1.2, 4.5)
    camera.lookAt(0, 0.8, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // MATERIALS
    const holoMat = new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      emissive: 0x0044aa,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      wireframe: false,
      depthWrite: false,
    })
    const skelMat = new THREE.MeshPhongMaterial({
      color: 0x00ddff,
      emissive: 0x0088cc,
      transparent: true,
      opacity: 0.85,
      shininess: 120,
    })
    const glowMat = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ccff,
      transparent: true,
      opacity: 0.6,
      shininess: 200,
    })

    // PIVOT pour rotation
    const pivot = new THREE.Group()
    scene.add(pivot)

    // ---- BODY SILHOUETTE ----
    const bodyGroup = new THREE.Group()
    pivot.add(bodyGroup)

    function addPart(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) {
      const m = new THREE.Mesh(geo, mat)
      m.position.set(x, y, z)
      bodyGroup.add(m)
      return m
    }

    // Torse
    addPart(new THREE.CylinderGeometry(0.22, 0.18, 0.7, 16), holoMat, 0, 1.05, 0)
    // Épaules
    addPart(new THREE.SphereGeometry(0.12, 12, 8), holoMat, -0.32, 1.35, 0)
    addPart(new THREE.SphereGeometry(0.12, 12, 8), holoMat, 0.32, 1.35, 0)
    // Bassin
    addPart(new THREE.CylinderGeometry(0.2, 0.15, 0.35, 16), holoMat, 0, 0.62, 0)
    // Tête
    addPart(new THREE.SphereGeometry(0.18, 16, 12), holoMat, 0, 1.88, 0)
    // Cou
    addPart(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 10), holoMat, 0, 1.65, 0)
    // Bras gauche
    addPart(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 10), holoMat, -0.44, 1.18, 0).rotation.z = 0.35
    addPart(new THREE.CylinderGeometry(0.045, 0.035, 0.38, 10), holoMat, -0.62, 0.87, 0).rotation.z = 0.15
    // Bras droit
    addPart(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 10), holoMat, 0.44, 1.18, 0).rotation.z = -0.35
    addPart(new THREE.CylinderGeometry(0.045, 0.035, 0.38, 10), holoMat, 0.62, 0.87, 0).rotation.z = -0.15
    // Mains
    addPart(new THREE.SphereGeometry(0.06, 8, 6), holoMat, -0.75, 0.69, 0)
    addPart(new THREE.SphereGeometry(0.06, 8, 6), holoMat, 0.75, 0.69, 0)
    // Cuisses
    addPart(new THREE.CylinderGeometry(0.1, 0.08, 0.55, 12), holoMat, -0.14, 0.22, 0)
    addPart(new THREE.CylinderGeometry(0.1, 0.08, 0.55, 12), holoMat, 0.14, 0.22, 0)
    // Genoux
    addPart(new THREE.SphereGeometry(0.09, 10, 8), holoMat, -0.14, -0.08, 0)
    addPart(new THREE.SphereGeometry(0.09, 10, 8), holoMat, 0.14, -0.08, 0)
    // Tibias
    addPart(new THREE.CylinderGeometry(0.07, 0.055, 0.5, 12), holoMat, -0.14, -0.38, 0)
    addPart(new THREE.CylinderGeometry(0.07, 0.055, 0.5, 12), holoMat, 0.14, -0.38, 0)
    // Pieds
    addPart(new THREE.BoxGeometry(0.12, 0.07, 0.22), holoMat, -0.14, -0.66, 0.04)
    addPart(new THREE.BoxGeometry(0.12, 0.07, 0.22), holoMat, 0.14, -0.66, 0.04)

    // ---- SKELETON ----
    const skelGroup = new THREE.Group()
    pivot.add(skelGroup)

    function bone(x1: number, y1: number, x2: number, y2: number) {
      const dx = x2 - x1, dy = y2 - y1
      const len = Math.sqrt(dx*dx + dy*dy)
      const geo = new THREE.CylinderGeometry(0.018, 0.012, len, 6)
      const m = new THREE.Mesh(geo, skelMat)
      m.position.set((x1+x2)/2, (y1+y2)/2, 0)
      m.rotation.z = Math.atan2(dx, dy)
      skelGroup.add(m)
    }
    function joint(x: number, y: number, r = 0.035) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), glowMat)
      m.position.set(x, y, 0)
      skelGroup.add(m)
    }

    // Colonne vertébrale
    bone(0, 1.65, 0, 0.55)
    // Thorax
    bone(-0.2, 1.42, 0.2, 1.42)
    bone(-0.18, 1.25, 0.18, 1.25)
    bone(-0.16, 1.08, 0.16, 1.08)
    bone(-0.15, 0.92, 0.15, 0.92)
    // Clavicules
    bone(0, 1.52, -0.3, 1.38)
    bone(0, 1.52, 0.3, 1.38)
    // Bras G
    bone(-0.3, 1.38, -0.52, 1.1)
    bone(-0.52, 1.1, -0.68, 0.82)
    // Bras D
    bone(0.3, 1.38, 0.52, 1.1)
    bone(0.52, 1.1, 0.68, 0.82)
    // Bassin
    bone(-0.18, 0.62, 0.18, 0.62)
    bone(0, 0.62, -0.16, 0.44)
    bone(0, 0.62, 0.16, 0.44)
    // Jambes G
    bone(-0.14, 0.44, -0.14, -0.06)
    bone(-0.14, -0.06, -0.14, -0.56)
    // Jambes D
    bone(0.14, 0.44, 0.14, -0.06)
    bone(0.14, -0.06, 0.14, -0.56)
    // Crâne
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), skelMat)
    skull.position.set(0, 1.88, 0)
    skelGroup.add(skull)
    // Joints clés
    joint(0, 1.65, 0.025) // cou
    joint(-0.3, 1.38); joint(0.3, 1.38) // épaules
    joint(-0.52, 1.1); joint(0.52, 1.1) // coudes
    joint(-0.16, 0.44); joint(0.16, 0.44) // hanches
    joint(-0.14, -0.06); joint(0.14, -0.06) // genoux
    joint(-0.14, -0.56); joint(0.14, -0.56) // chevilles

    // ---- SOL HOLOGRAPHIQUE ----
    const platformGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.012, 64)
    const platformMat = new THREE.MeshPhongMaterial({
      color: 0x00aaff, emissive: 0x004488,
      transparent: true, opacity: 0.25,
    })
    const platform = new THREE.Mesh(platformGeo, platformMat)
    platform.position.y = -0.72
    scene.add(platform)

    // Rayons du sol
    for (let i = 0; i < 12; i++) {
      const rGeo = new THREE.PlaneGeometry(0.015, 1.2)
      const rMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
      const r = new THREE.Mesh(rGeo, rMat)
      r.rotation.x = -Math.PI / 2
      r.rotation.z = (i / 12) * Math.PI * 2
      r.position.set(Math.cos((i/12)*Math.PI*2)*0.5, -0.71, Math.sin((i/12)*Math.PI*2)*0.5)
      scene.add(r)
    }

    // ---- ANNEAUX ORBITAUX ----
    function addRing(radius: number, y: number, color: number, opacity: number, speed: number) {
      const geo = new THREE.TorusGeometry(radius, 0.008, 8, 80)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = y
      mesh.rotation.x = Math.PI / 2
      scene.add(mesh)
      return { mesh, speed }
    }

    const rings = [
      addRing(0.85, 0.9, 0x00ffff, 0.5, 0.4),
      addRing(1.05, 0.3, 0x00aaff, 0.3, -0.25),
      addRing(1.2, -0.1, 0x4488ff, 0.2, 0.15),
    ]

    // Petits points sur l'anneau principal
    const dotsMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    for (let i = 0; i < 8; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), dotsMat)
      const a = (i / 8) * Math.PI * 2
      dot.position.set(Math.cos(a) * 0.85, 0.9, Math.sin(a) * 0.85)
      scene.add(dot)
    }

    // ---- SCAN LINE ----
    const scanLineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.012), scanLineMat)
    scene.add(scanLine)

    // ---- PARTICULES ----
    const particleCount = 120
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.5 + Math.random() * 0.9
      positions[i*3] = Math.cos(a) * r
      positions[i*3+1] = -0.7 + Math.random() * 2.8
      positions[i*3+2] = Math.sin(a) * r
    }
    const partGeo = new THREE.BufferGeometry()
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const partMat = new THREE.PointsMaterial({ color: 0x00aaff, size: 0.018, transparent: true, opacity: 0.6 })
    const particles = new THREE.Points(partGeo, partMat)
    scene.add(particles)

    // ---- LUMIÈRES ----
    scene.add(new THREE.AmbientLight(0x001133, 2))
    const keyLight = new THREE.PointLight(0x00aaff, 3, 8)
    keyLight.position.set(0, 2.5, 2)
    scene.add(keyLight)
    const rimLight = new THREE.PointLight(0x0044ff, 2, 6)
    rimLight.position.set(-2, 1, -1)
    scene.add(rimLight)
    const bottomLight = new THREE.PointLight(0x00ffff, 4, 3)
    bottomLight.position.set(0, -0.5, 0)
    scene.add(bottomLight)

    // ---- ANIMATION ----
    let frame: number
    let t = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      t += 0.016

      pivot.rotation.y += 0.008

      rings.forEach(({ mesh, speed }) => {
        mesh.rotation.z += speed * 0.01
      })

      // scan line qui monte et descend
      const scanY = -0.68 + ((Math.sin(t * 0.5) + 1) / 2) * 2.6
      scanLine.position.y = scanY
      scanLine.position.x = 0
      scanLine.rotation.y = pivot.rotation.y
      ;(scanLineMat as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2) * 0.2

      particles.rotation.y -= 0.002

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
  )
}
