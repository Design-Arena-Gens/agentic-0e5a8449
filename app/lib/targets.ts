import * as THREE from 'three'
import { Target } from '../types/game'

export function createTarget(
  position: THREE.Vector3,
  movementPattern: Target['movementPattern']
): Target {
  const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff]
  const color = colors[Math.floor(Math.random() * colors.length)]

  const geometry = new THREE.ConeGeometry(0.5, 1, 6)
  const material = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    emissive: color,
    emissiveIntensity: 0.3,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)
  mesh.castShadow = true

  const velocity = new THREE.Vector3()
  if (movementPattern === 'linear') {
    velocity.set((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5)
  } else if (movementPattern === 'erratic') {
    velocity.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 8)
  }

  const basePoints = movementPattern === 'static' ? 50 : movementPattern === 'linear' ? 100 : 150
  const health = movementPattern === 'static' ? 50 : 100

  return {
    id: Math.random().toString(36).substr(2, 9),
    mesh,
    position: position.clone(),
    velocity,
    points: basePoints,
    movementPattern,
    health,
    maxHealth: health,
  }
}

export function spawnWave(waveNumber: number): Target[] {
  const targets: Target[] = []
  const targetCount = Math.min(5 + waveNumber * 2, 20)

  for (let i = 0; i < targetCount; i++) {
    const angle = (i / targetCount) * Math.PI * 2
    const radius = 15 + Math.random() * 10
    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.random() * 3 + 1,
      Math.sin(angle) * radius
    )

    let pattern: Target['movementPattern']
    const rand = Math.random()
    if (rand < 0.3) pattern = 'static'
    else if (rand < 0.7) pattern = 'linear'
    else if (rand < 0.85) pattern = 'circular'
    else pattern = 'erratic'

    targets.push(createTarget(position, pattern))
  }

  return targets
}

export function updateTarget(target: Target, deltaTime: number): void {
  if (target.movementPattern === 'linear') {
    target.position.add(target.velocity.clone().multiplyScalar(deltaTime))
    target.mesh.position.copy(target.position)

    // Bounce off boundaries
    if (Math.abs(target.position.x) > 30) {
      target.velocity.x *= -1
    }
    if (Math.abs(target.position.z) > 30) {
      target.velocity.z *= -1
    }
  } else if (target.movementPattern === 'circular') {
    const time = Date.now() * 0.001
    const radius = 20
    target.position.x = Math.cos(time + target.id.charCodeAt(0)) * radius
    target.position.z = Math.sin(time + target.id.charCodeAt(0)) * radius
    target.mesh.position.copy(target.position)
  } else if (target.movementPattern === 'erratic') {
    target.velocity.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 10
      ).multiplyScalar(deltaTime)
    )
    target.velocity.multiplyScalar(0.95)
    target.position.add(target.velocity.clone().multiplyScalar(deltaTime))
    target.mesh.position.copy(target.position)

    // Keep in bounds
    target.position.clampLength(0, 30)
    if (target.position.y < 1) target.position.y = 1
    if (target.position.y > 8) target.position.y = 8
  }

  target.mesh.rotation.y += deltaTime * 2
}
