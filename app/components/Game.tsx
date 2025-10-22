'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GameState, Target, TouchState, WeaponStats } from '../types/game'
import { WEAPONS, upgradeWeapon, getUpgradeCost } from '../lib/weapons'
import { createEnvironment } from '../lib/environments'
import { spawnWave, updateTarget } from '../lib/targets'
import { createHitEffect, createMuzzleFlash } from '../lib/particles'
import HUD from './HUD'
import Menu from './Menu'

export default function Game() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const targetsRef = useRef<Target[]>([])
  const environmentRef = useRef<THREE.Group | null>(null)
  const lastFireTimeRef = useRef<number>(0)
  const touchStateRef = useRef<TouchState>({
    aimActive: false,
    aimStartPos: { x: 0, y: 0 },
    aimCurrentPos: { x: 0, y: 0 },
    shootTouches: 0,
  })
  const cameraRotationRef = useRef({ x: 0, y: 0 })

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    comboTimer: 0,
    comboMultiplier: 1,
    bulletTimeActive: false,
    bulletTimeCharge: 0,
    currentWeapon: WEAPONS[0],
    unlockedWeapons: [WEAPONS[0]],
    currency: 0,
    wave: 1,
    targetsRemaining: 0,
    currentEnvironment: 'rooftop',
    ammo: WEAPONS[0].magazineSize,
    reloading: false,
    sensitivity: 1.0,
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || gameStarted) return

    // Initialize Three.js
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1.6, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    canvasRef.current.appendChild(renderer.domElement)

    // Create environment
    const env = createEnvironment(scene, gameState.currentEnvironment)
    environmentRef.current = env
    scene.add(env)

    // Spawn initial wave
    const initialTargets = spawnWave(1)
    initialTargets.forEach((target) => scene.add(target.mesh))
    targetsRef.current = initialTargets
    setGameState((prev) => ({ ...prev, targetsRemaining: initialTargets.length }))

    // Animation loop
    let lastTime = performance.now()
    const animate = () => {
      requestAnimationFrame(animate)

      const now = performance.now()
      const deltaTime = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      // Update targets
      targetsRef.current.forEach((target) => {
        updateTarget(target, deltaTime * (gameState.bulletTimeActive ? 0.3 : 1.0))
      })

      // Update combo timer
      setGameState((prev) => {
        if (prev.comboTimer > 0) {
          const newComboTimer = Math.max(0, prev.comboTimer - deltaTime)
          if (newComboTimer === 0) {
            return { ...prev, combo: 0, comboTimer: 0, comboMultiplier: 1 }
          }
          return { ...prev, comboTimer: newComboTimer }
        }
        return prev
      })

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [gameStarted, gameState.currentEnvironment, gameState.bulletTimeActive])

  // Touch controls
  useEffect(() => {
    if (!gameStarted) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1) {
        // Single touch - aiming
        touchStateRef.current.aimActive = true
        touchStateRef.current.aimStartPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      } else if (e.touches.length === 2) {
        // Two-finger tap - weapon switch
        cycleWeapon()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1 && touchStateRef.current.aimActive) {
        const deltaX = e.touches[0].clientX - touchStateRef.current.aimStartPos.x
        const deltaY = e.touches[0].clientY - touchStateRef.current.aimStartPos.y

        cameraRotationRef.current.y -= deltaX * 0.002 * gameState.sensitivity
        cameraRotationRef.current.x -= deltaY * 0.002 * gameState.sensitivity
        cameraRotationRef.current.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, cameraRotationRef.current.x)
        )

        if (cameraRef.current) {
          cameraRef.current.rotation.order = 'YXZ'
          cameraRef.current.rotation.y = cameraRotationRef.current.y
          cameraRef.current.rotation.x = cameraRotationRef.current.x
        }

        touchStateRef.current.aimStartPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 0) {
        if (touchStateRef.current.aimActive) {
          // Tap to shoot
          shoot()
          touchStateRef.current.aimActive = false
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })

    // Mouse controls for testing
    let mouseDown = false
    const handleMouseDown = (e: MouseEvent) => {
      mouseDown = true
      shoot()
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return
      cameraRotationRef.current.y -= e.movementX * 0.002 * gameState.sensitivity
      cameraRotationRef.current.x -= e.movementY * 0.002 * gameState.sensitivity
      cameraRotationRef.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, cameraRotationRef.current.x)
      )

      if (cameraRef.current) {
        cameraRef.current.rotation.order = 'YXZ'
        cameraRef.current.rotation.y = cameraRotationRef.current.y
        cameraRef.current.rotation.x = cameraRotationRef.current.x
      }
    }
    const handleMouseUp = () => {
      mouseDown = false
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [gameStarted, gameState.sensitivity])

  const shoot = () => {
    if (
      !cameraRef.current ||
      !sceneRef.current ||
      gameState.reloading ||
      gameState.ammo <= 0
    )
      return

    const now = performance.now()
    if (now - lastFireTimeRef.current < gameState.currentWeapon.fireRate) return
    lastFireTimeRef.current = now

    // Raycast
    const raycaster = new THREE.Raycaster()
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyQuaternion(cameraRef.current.quaternion)

    // Apply accuracy
    const spread = (1 - gameState.currentWeapon.accuracy) * 0.1
    direction.x += (Math.random() - 0.5) * spread
    direction.y += (Math.random() - 0.5) * spread
    direction.normalize()

    raycaster.set(cameraRef.current.position, direction)

    // Muzzle flash
    createMuzzleFlash(
      sceneRef.current,
      cameraRef.current.position.clone().add(direction.clone().multiplyScalar(0.5)),
      direction
    )

    // Check hits
    const meshes = targetsRef.current.map((t) => t.mesh)
    const intersects = raycaster.intersectObjects(meshes)

    setGameState((prev) => ({ ...prev, ammo: prev.ammo - 1 }))

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh
      const targetIndex = targetsRef.current.findIndex((t) => t.mesh === hitMesh)

      if (targetIndex !== -1) {
        const target = targetsRef.current[targetIndex]
        target.health -= gameState.currentWeapon.damage

        createHitEffect(
          sceneRef.current,
          intersects[0].point,
          (target.mesh.material as THREE.MeshStandardMaterial).color.getHex()
        )

        if (target.health <= 0) {
          // Remove target
          sceneRef.current.remove(target.mesh)
          targetsRef.current.splice(targetIndex, 1)

          // Update score and combo
          setGameState((prev) => {
            const newCombo = prev.combo + 1
            const newMultiplier = Math.min(Math.floor(newCombo / 5) + 1, 5)
            const points = Math.floor(target.points * newMultiplier)
            const newScore = prev.score + points
            const newComboTimer = 3.0

            // Bullet time charge
            let newBulletTimeCharge = prev.bulletTimeCharge + 5
            let bulletTimeActive = prev.bulletTimeActive

            if (newBulletTimeCharge >= 100 && !bulletTimeActive) {
              bulletTimeActive = true
              setTimeout(() => {
                setGameState((p) => ({
                  ...p,
                  bulletTimeActive: false,
                  bulletTimeCharge: 0,
                }))
              }, 5000)
            }

            const targetsRemaining = targetsRef.current.length

            // Check wave complete
            if (targetsRemaining === 0) {
              setTimeout(() => nextWave(), 2000)
            }

            return {
              ...prev,
              score: newScore,
              combo: newCombo,
              comboTimer: newComboTimer,
              comboMultiplier: newMultiplier,
              bulletTimeCharge: Math.min(newBulletTimeCharge, 100),
              bulletTimeActive,
              targetsRemaining,
              currency: prev.currency + Math.floor(points * 0.1),
            }
          })
        }
      }
    }

    // Auto reload
    if (gameState.ammo - 1 <= 0) {
      reload()
    }
  }

  const reload = () => {
    if (gameState.reloading) return
    setGameState((prev) => ({ ...prev, reloading: true }))
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        ammo: prev.currentWeapon.magazineSize,
        reloading: false,
      }))
    }, gameState.currentWeapon.reloadSpeed * 1000)
  }

  const cycleWeapon = () => {
    setGameState((prev) => {
      const currentIndex = prev.unlockedWeapons.findIndex(
        (w) => w.id === prev.currentWeapon.id
      )
      const nextIndex = (currentIndex + 1) % prev.unlockedWeapons.length
      const nextWeapon = prev.unlockedWeapons[nextIndex]
      return {
        ...prev,
        currentWeapon: nextWeapon,
        ammo: nextWeapon.magazineSize,
      }
    })
  }

  const nextWave = () => {
    if (!sceneRef.current) return

    setGameState((prev) => {
      const newWave = prev.wave + 1
      const newTargets = spawnWave(newWave)
      newTargets.forEach((target) => sceneRef.current?.add(target.mesh))
      targetsRef.current = newTargets

      return {
        ...prev,
        wave: newWave,
        targetsRemaining: newTargets.length,
        currency: prev.currency + 50,
      }
    })
  }

  const purchaseWeapon = (weapon: WeaponStats) => {
    if (gameState.currency >= weapon.cost) {
      setGameState((prev) => ({
        ...prev,
        currency: prev.currency - weapon.cost,
        unlockedWeapons: [...prev.unlockedWeapons, weapon],
      }))
    }
  }

  const upgradeCurrentWeapon = () => {
    const cost = getUpgradeCost(gameState.currentWeapon)
    if (gameState.currency >= cost) {
      const upgraded = upgradeWeapon(gameState.currentWeapon)
      setGameState((prev) => ({
        ...prev,
        currency: prev.currency - cost,
        currentWeapon: upgraded,
        unlockedWeapons: prev.unlockedWeapons.map((w) =>
          w.id === upgraded.id ? upgraded : w
        ),
      }))
    }
  }

  if (!gameStarted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">TARGET SHOOTER</h1>
          <button
            onClick={() => setGameStarted(true)}
            className="px-12 py-4 bg-yellow-500 text-black text-2xl font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            START GAME
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={canvasRef} className="w-full h-full" />
      <HUD gameState={gameState} onMenuToggle={() => setMenuOpen(!menuOpen)} />
      {menuOpen && (
        <Menu
          gameState={gameState}
          weapons={WEAPONS}
          onClose={() => setMenuOpen(false)}
          onPurchaseWeapon={purchaseWeapon}
          onUpgradeWeapon={upgradeCurrentWeapon}
          onSensitivityChange={(value) =>
            setGameState((prev) => ({ ...prev, sensitivity: value }))
          }
        />
      )}
    </div>
  )
}
