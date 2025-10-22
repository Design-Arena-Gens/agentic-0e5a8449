import * as THREE from 'three'

export function createHitEffect(
  scene: THREE.Scene,
  position: THREE.Vector3,
  color: number
): void {
  const particleCount = 20
  const geometry = new THREE.BufferGeometry()
  const positions: number[] = []
  const velocities: THREE.Vector3[] = []

  for (let i = 0; i < particleCount; i++) {
    positions.push(position.x, position.y, position.z)
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      )
    )
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color,
    size: 0.2,
    transparent: true,
    opacity: 1,
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  let life = 1.0
  const animate = () => {
    life -= 0.05
    if (life <= 0) {
      scene.remove(particles)
      geometry.dispose()
      material.dispose()
      return
    }

    const positions = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      positions[idx] += velocities[i].x * 0.05
      positions[idx + 1] += velocities[i].y * 0.05
      positions[idx + 2] += velocities[i].z * 0.05
      velocities[i].y -= 0.5
    }
    geometry.attributes.position.needsUpdate = true
    material.opacity = life

    requestAnimationFrame(animate)
  }
  animate()
}

export function createMuzzleFlash(
  scene: THREE.Scene,
  position: THREE.Vector3,
  direction: THREE.Vector3
): void {
  const geometry = new THREE.ConeGeometry(0.2, 0.5, 8)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 1,
  })
  const flash = new THREE.Mesh(geometry, material)
  flash.position.copy(position)
  flash.lookAt(position.clone().add(direction))
  flash.rotateX(Math.PI / 2)
  scene.add(flash)

  let life = 1.0
  const animate = () => {
    life -= 0.2
    if (life <= 0) {
      scene.remove(flash)
      geometry.dispose()
      material.dispose()
      return
    }
    material.opacity = life
    requestAnimationFrame(animate)
  }
  animate()
}
