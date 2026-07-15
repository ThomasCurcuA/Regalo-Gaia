// La scena Three.js: luci, scintille e il libro.
import { Sparkles, ContactShadows } from '@react-three/drei'
import { Book3D } from './Book3D.jsx'

export function Experience({ mode, spread, faceTextures, onCoverClick, editFaces, onEdit, focusSide }) {
  return (
    <>
      <ambientLight intensity={0.55} color="#e8d5ff" />
      <directionalLight
        position={[2.5, 3.5, 4]}
        intensity={1.7}
        color="#fff0f5"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3.5, 1.5, 2.5]} intensity={9} color="#f7a8c9" />
      <pointLight position={[3.5, -1.5, 2]} intensity={7} color="#c9a8f7" />

      <Sparkles count={70} scale={[9, 5.5, 3]} position={[0, 0, -1.4]} size={2.6} speed={0.3} color="#f7a8c9" opacity={0.5} />
      <Sparkles count={50} scale={[8, 5, 2.5]} position={[0, 0.4, -0.9]} size={2} speed={0.22} color="#d9c2ff" opacity={0.45} />

      <Book3D
        mode={mode}
        spread={spread}
        faceTextures={faceTextures}
        onCoverClick={onCoverClick}
        editFaces={editFaces}
        onEdit={onEdit}
        focusSide={focusSide}
      />

      <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={8} blur={2.6} far={2.4} color="#12071f" />
    </>
  )
}
