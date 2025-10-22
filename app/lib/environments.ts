import * as THREE from 'three'

export interface EnvironmentConfig {
  id: string
  name: string
  skyColor: number
  groundColor: number
  fogColor: number
  fogDensity: number
  ambientLight: number
  directionalLightColor: number
  directionalLightIntensity: number
}

export const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  rooftop: {
    id: 'rooftop',
    name: 'Urban Rooftop',
    skyColor: 0x87ceeb,
    groundColor: 0x555555,
    fogColor: 0xa0a0a0,
    fogDensity: 0.02,
    ambientLight: 0x404040,
    directionalLightColor: 0xffffff,
    directionalLightIntensity: 1.0,
  },
  desert: {
    id: 'desert',
    name: 'Desert Range',
    skyColor: 0xffd700,
    groundColor: 0xdaa520,
    fogColor: 0xffebcd,
    fogDensity: 0.015,
    ambientLight: 0x606060,
    directionalLightColor: 0xfff8dc,
    directionalLightIntensity: 1.2,
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Complex',
    skyColor: 0x2f4f4f,
    groundColor: 0x3a3a3a,
    fogColor: 0x696969,
    fogDensity: 0.025,
    ambientLight: 0x303030,
    directionalLightColor: 0xccccff,
    directionalLightIntensity: 0.8,
  },
}

export function createEnvironment(
  scene: THREE.Scene,
  envId: string
): THREE.Group {
  const env = ENVIRONMENTS[envId]
  const group = new THREE.Group()

  // Ground
  const groundGeo = new THREE.PlaneGeometry(100, 100)
  const groundMat = new THREE.MeshStandardMaterial({
    color: env.groundColor,
    roughness: 0.8,
    metalness: 0.2,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  group.add(ground)

  // Low-poly obstacles/cover
  const coverCount = 8
  for (let i = 0; i < coverCount; i++) {
    const boxGeo = new THREE.BoxGeometry(
      Math.random() * 3 + 1,
      Math.random() * 2 + 1,
      Math.random() * 3 + 1
    )
    const boxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
      flatShading: true,
    })
    const box = new THREE.Mesh(boxGeo, boxMat)
    box.position.set(
      (Math.random() - 0.5) * 40,
      box.geometry.parameters.height / 2,
      (Math.random() - 0.5) * 40
    )
    box.castShadow = true
    box.receiveShadow = true
    group.add(box)
  }

  // Lighting
  scene.background = new THREE.Color(env.skyColor)
  scene.fog = new THREE.FogExp2(env.fogColor, env.fogDensity)

  const ambientLight = new THREE.AmbientLight(env.ambientLight)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(
    env.directionalLightColor,
    env.directionalLightIntensity
  )
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  return group
}
