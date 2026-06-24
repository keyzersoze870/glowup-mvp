'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default function HoloBody({ score = 72 }: { score?: number }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth || 390
    const H = mount.clientHeight || 600

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(0, 1.4, 4.2)
    camera.lookAt(0, 1.0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const pivot = new THREE.Group()
    scene.add(pivot)

    // HOLOGRAPHIC MATERIALS
    const skinMat = new THREE.MeshPhongMaterial({
      color: 0x0055cc,
      emissive: 0x001155,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    })

    // LOAD GLB
    const loader = new GLTFLoader()
    loader.load(
      '/human.glb',
      (gltf) => {
        const model = gltf.scene

        // Scale et centrage
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2.2 / maxDim
        model.scale.setScalar(scale)
        model.position.x = -center.x * scale
        model.position.y = -center.y * scale + 0.15
        model.position.z = -center.z * scale

        // Appliquer effet holo + wireframe
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            const geo = mesh.geometry

            // Skin translucide
            mesh.material = skinMat.clone()

            // Wireframe séparé (pas de clone du mesh)
            const wireframe = new THREE.LineSegments(
              new THREE.WireframeGeometry(geo),
              new THREE.LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.15 })
            )
            mesh.add(wireframe)
          }
        })

        pivot.add(model)
      },
      undefined,
      (err) => console.error('GLB load error:', err)
    )

    // SOL
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 0.015, 64),
      new THREE.MeshPhongMaterial({ color: 0x0044ff, emissive: 0x002288, transparent: true, opacity: 0.3 })
    )
    platform.position.y = -1.05
    scene.add(platform)

    for (let i = 0; i < 16; i++) {
      const ray = new THREE.Mesh(
        new THREE.PlaneGeometry(0.012, 1.3),
        new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
      )
      ray.rotation.x = -Math.PI / 2
      ray.rotation.z = (i / 16) * Math.PI * 2
      ray.position.set(Math.cos((i / 16) * Math.PI * 2) * 0.55, -1.04, Math.sin((i / 16) * Math.PI * 2) * 0.55)
      scene.add(ray)
    }

    // ANNEAUX
    const rings: { mesh: THREE.Mesh; speed: number }[] = []
    ;[
      { r: 0.9, y: 1.0, c: 0x00ffff, o: 0.6, s: 0.5 },
      { r: 1.1, y: 0.4, c: 0x0088ff, o: 0.3, s: -0.3 },
      { r: 1.25, y: -0.1, c: 0x4444ff, o: 0.2, s: 0.2 },
    ].forEach(({ r, y, c, o, s }) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.009, 8, 90),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o })
      )
      mesh.position.y = y
      mesh.rotation.x = Math.PI / 2
      scene.add(mesh)
      rings.push({ mesh, speed: s })
      for (let i = 0; i < 6; i++) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x00ffff })
        )
        const a = (i / 6) * Math.PI * 2
        dot.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
        scene.add(dot)
      }
    })

    // SCAN LINE
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.015), scanMat)
    scene.add(scanLine)

    // PARTICULES
    const pCount = 150
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.6 + Math.random() * 1.0
      pPos[i * 3] = Math.cos(a) * r
      pPos[i * 3 + 1] = -1.0 + Math.random() * 3.2
      pPos[i * 3 + 2] = Math.sin(a) * r
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x0088ff, size: 0.02, transparent: true, opacity: 0.5 }))
    scene.add(particles)

    // LUMIÈRES
    scene.add(new THREE.AmbientLight(0x002244, 3))
    const key = new THREE.PointLight(0x0088ff, 5, 10)
    key.position.set(0, 3, 3)
    scene.add(key)
    const rim = new THREE.PointLight(0x00ffff, 3, 8)
    rim.position.set(-2, 1.5, -1)
    scene.add(rim)
    const bot = new THREE.PointLight(0x00aaff, 5, 4)
    bot.position.set(0, -0.8, 0)
    scene.add(bot)

    // ANIMATION
    let frame: number
    let t = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      t += 0.016
      pivot.rotation.y += 0.007
      rings.forEach(({ mesh, speed }) => { mesh.rotation.z += speed * 0.012 })
      const scanY = -1.0 + ((Math.sin(t * 0.6) + 1) / 2) * 3.0
      scanLine.position.y = scanY
      scanLine.rotation.y = pivot.rotation.y
      scanMat.opacity = 0.3 + Math.sin(t * 2.5) * 0.2
      particles.rotation.y -= 0.0015
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
}
