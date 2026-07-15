// Il libro 3D: copertine rigide + pagine che si curvano mentre girano.
// Ogni "foglio" (leaf) ruota attorno alla rilegatura (asse y, x=0);
// la curvatura è ottenuta deformando i vertici con un angolo che
// varia lungo la larghezza della pagina.
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'

export const PAGE_W = 1.15
export const PAGE_H = 1.58
const COVER_TH = 0.03
const PAGE_TH = 0.012
const SEG_X = 30
const { damp, clamp } = THREE.MathUtils

function computeZTargets(spread, thicknesses) {
  const z = new Array(thicknesses.length)
  let acc = 0
  for (let i = spread - 1; i >= 0; i--) {
    z[i] = -(acc + thicknesses[i] / 2)
    acc += thicknesses[i]
  }
  acc = 0
  for (let i = spread; i < thicknesses.length; i++) {
    z[i] = -(acc + thicknesses[i] / 2)
    acc += thicknesses[i]
  }
  return z
}

function Leaf({ index, isCover, frontTex, backTex, turned, zTarget }) {
  const meshRef = useRef()
  const angleRef = useRef(turned ? Math.PI : 0)
  const w = isCover ? PAGE_W * 1.035 : PAGE_W
  const h = isCover ? PAGE_H * 1.03 : PAGE_H
  const th = isCover ? COVER_TH : PAGE_TH

  const { geometry, original } = useMemo(() => {
    const geo = new THREE.BoxGeometry(w, h, th, isCover ? 1 : SEG_X, 1, 1)
    geo.translate(w / 2, 0, 0)
    return { geometry: geo, original: geo.attributes.position.array.slice() }
  }, [w, h, th, isCover])

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({
      color: isCover ? '#2c1246' : '#efe0d2',
      roughness: 0.9,
    })
    const face = (tex) =>
      new THREE.MeshStandardMaterial({
        map: tex || null,
        color: tex ? '#ffffff' : isCover ? '#3b1a5e' : '#fdf6ee',
        roughness: isCover ? 0.55 : 0.85,
        metalness: isCover ? 0.08 : 0,
      })
    return [edge, edge, edge, edge, face(frontTex), face(backTex)]
  }, [isCover, frontTex, backTex])

  useEffect(() => () => {
    geometry.dispose()
    materials.forEach((m) => m.dispose())
  }, [geometry, materials])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const mesh = meshRef.current
    if (!mesh) return
    const target = turned ? Math.PI : 0
    const prev = angleRef.current
    const angle = damp(prev, target, 3.4 + (index % 3) * 0.35, dt)
    angleRef.current = angle
    mesh.position.z = damp(mesh.position.z, zTarget, 5, dt)

    if (isCover) {
      mesh.rotation.y = -angle
      return
    }
    // salta la deformazione quando la pagina è ferma
    if (Math.abs(angle - prev) < 0.00003 && Math.abs(angle - target) < 0.002) return

    const bend = Math.sin(clamp(angle, 0, Math.PI)) * 0.24
    const pos = geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const ox = original[i * 3]
      const oy = original[i * 3 + 1]
      const oz = original[i * 3 + 2]
      const phi = angle + bend * Math.sin((ox / w) * Math.PI * 0.85)
      const cos = Math.cos(phi)
      const sin = Math.sin(phi)
      pos.setXYZ(i, ox * cos - oz * sin, oy, ox * sin + oz * cos)
    }
    pos.needsUpdate = true
    geometry.computeVertexNormals()
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={materials}
      position-z={zTarget}
      castShadow
      receiveShadow
    />
  )
}

export function Book3D({ mode, spread, faceTextures, onCoverClick, editFaces, onEdit }) {
  const outerRef = useRef()
  const innerRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { viewport, size } = useThree()

  const leavesCount = faceTextures.length / 2
  const thicknesses = useMemo(
    () =>
      Array.from({ length: leavesCount }, (_, i) =>
        i === 0 || i === leavesCount - 1 ? COVER_TH : PAGE_TH
      ),
    [leavesCount]
  )
  const zTargets = useMemo(() => computeZTargets(spread, thicknesses), [spread, thicknesses])

  const isMobile = size.width < 760
  const landing = mode === 'landing'

  useEffect(() => {
    document.body.style.cursor = hovered && landing ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, landing])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    let px, py, pz, rx, ry, rz, scale
    if (landing) {
      px = isMobile ? 0 : viewport.width * 0.29
      py = (isMobile ? -viewport.height * 0.21 : -0.05) + Math.sin(t * 1.1) * 0.045
      pz = 0
      rx = 0.06 + Math.sin(t * 0.9) * 0.02
      ry = -0.5 + Math.sin(t * 0.6) * 0.07
      rz = -0.05
      scale = isMobile
        ? clamp(Math.min((viewport.width * 0.62) / PAGE_W, (viewport.height * 0.34) / PAGE_H), 0.4, 1)
        : clamp((viewport.height * 0.55) / PAGE_H, 0.5, 1.1)
      if (hovered) scale *= 1.05
    } else {
      px = 0
      py = isMobile ? 0.12 : 0
      pz = 0.25
      rx = -0.1
      ry = 0
      rz = 0
      scale = clamp(
        Math.min((viewport.width * 0.88) / (PAGE_W * 2), (viewport.height * 0.76) / PAGE_H),
        0.4,
        1.5
      )
    }

    const λ = 2.4
    outer.position.x = damp(outer.position.x, px, λ, dt)
    outer.position.y = damp(outer.position.y, py, λ, dt)
    outer.position.z = damp(outer.position.z, pz, λ, dt)
    outer.rotation.x = damp(outer.rotation.x, rx, λ, dt)
    outer.rotation.y = damp(outer.rotation.y, ry, λ, dt)
    outer.rotation.z = damp(outer.rotation.z, rz, λ, dt)
    const s = damp(outer.scale.x, scale, λ, dt)
    outer.scale.setScalar(s)

    // da chiuso il baricentro è a metà copertina; da aperto è sulla rilegatura
    inner.position.x = damp(inner.position.x, spread > 0 ? 0 : -PAGE_W / 2, λ, dt)
  })

  return (
    <group
      ref={outerRef}
      onClick={(e) => {
        if (landing) {
          e.stopPropagation()
          onCoverClick()
        }
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={innerRef} position-x={-PAGE_W / 2}>
        {Array.from({ length: leavesCount }, (_, i) => (
          <Leaf
            key={i}
            index={i}
            isCover={i === 0 || i === leavesCount - 1}
            frontTex={faceTextures[i * 2]}
            backTex={faceTextures[i * 2 + 1]}
            turned={i < spread}
            zTarget={zTargets[i]}
          />
        ))}

        {/* pulsanti ✎ ancorati agli angoli delle pagine aperte */}
        {mode === 'book' && spread >= 1 && editFaces?.left !== null && (
          <Html position={[-PAGE_W * 0.8, -PAGE_H * 0.395, 0.06]} center zIndexRange={[5, 0]}>
            <button
              className="page-edit-btn"
              title="Scrivi questa pagina"
              onClick={() => onEdit(editFaces.left)}
            >
              ✎
            </button>
          </Html>
        )}
        {mode === 'book' && spread >= 1 && editFaces?.right !== null && (
          <Html position={[PAGE_W * 0.8, -PAGE_H * 0.395, 0.06]} center zIndexRange={[5, 0]}>
            <button
              className="page-edit-btn"
              title="Scrivi questa pagina"
              onClick={() => onEdit(editFaces.right)}
            >
              ✎
            </button>
          </Html>
        )}
      </group>
    </group>
  )
}
