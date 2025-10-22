import * as THREE from 'three'

export interface WeaponStats {
  id: string
  name: string
  damage: number
  fireRate: number
  reloadSpeed: number
  accuracy: number
  magazineSize: number
  type: 'pistol' | 'shotgun' | 'rifle' | 'smg'
  level: number
  cost: number
}

export interface Target {
  id: string
  mesh: THREE.Mesh
  position: THREE.Vector3
  velocity: THREE.Vector3
  points: number
  movementPattern: 'static' | 'linear' | 'circular' | 'erratic'
  health: number
  maxHealth: number
}

export interface GameState {
  score: number
  combo: number
  comboTimer: number
  comboMultiplier: number
  bulletTimeActive: boolean
  bulletTimeCharge: number
  currentWeapon: WeaponStats
  unlockedWeapons: WeaponStats[]
  currency: number
  wave: number
  targetsRemaining: number
  currentEnvironment: 'rooftop' | 'desert' | 'industrial'
  ammo: number
  reloading: boolean
  sensitivity: number
}

export interface TouchState {
  aimActive: boolean
  aimStartPos: { x: number; y: number }
  aimCurrentPos: { x: number; y: number }
  shootTouches: number
}
