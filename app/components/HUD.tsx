'use client'

import { GameState } from '../types/game'

interface HUDProps {
  gameState: GameState
  onMenuToggle: () => void
}

export default function HUD({ gameState, onMenuToggle }: HUDProps) {
  const comboBarWidth = (gameState.bulletTimeCharge / 100) * 100

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        <div className="bg-black bg-opacity-60 px-4 py-2 rounded-lg">
          <div className="text-yellow-400 text-2xl font-bold">
            {gameState.score.toLocaleString()}
          </div>
          <div className="text-gray-300 text-sm">Score</div>
        </div>

        <div className="bg-black bg-opacity-60 px-4 py-2 rounded-lg text-center">
          <div className="text-white text-xl font-bold">Wave {gameState.wave}</div>
          <div className="text-gray-300 text-sm">
            Targets: {gameState.targetsRemaining}
          </div>
        </div>

        <button
          onClick={onMenuToggle}
          className="bg-blue-600 bg-opacity-80 px-4 py-2 rounded-lg pointer-events-auto hover:bg-opacity-100 transition-all"
        >
          <div className="text-white text-xl font-bold">☰</div>
        </button>
      </div>

      {/* Combo Display */}
      {gameState.combo > 0 && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-full animate-pulse">
            <div className="text-white text-3xl font-bold">
              {gameState.combo}x COMBO!
            </div>
          </div>
          <div className="mt-2 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-100"
              style={{ width: `${(gameState.comboTimer / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bullet Time Bar */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <div className="w-8 h-64 bg-black bg-opacity-60 rounded-full overflow-hidden border-2 border-cyan-400">
          <div
            className={`w-full bg-gradient-to-t transition-all duration-300 ${
              gameState.bulletTimeActive
                ? 'from-cyan-400 to-blue-600 animate-pulse'
                : 'from-cyan-600 to-blue-800'
            }`}
            style={{
              height: `${comboBarWidth}%`,
              position: 'absolute',
              bottom: 0,
            }}
          />
        </div>
        <div className="text-center text-cyan-400 text-xs mt-2 font-bold">
          {gameState.bulletTimeActive ? 'ACTIVE!' : 'BULLET TIME'}
        </div>
      </div>

      {/* Bottom Bar - Weapon Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
        <div className="bg-black bg-opacity-60 px-4 py-2 rounded-lg">
          <div className="text-green-400 text-2xl font-bold">
            ${gameState.currency.toLocaleString()}
          </div>
          <div className="text-gray-300 text-sm">Currency</div>
        </div>

        <div className="bg-black bg-opacity-60 px-6 py-3 rounded-lg">
          <div className="text-white text-xl font-bold mb-1">
            {gameState.currentWeapon.name} Lv.{gameState.currentWeapon.level}
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`text-2xl font-bold ${
                gameState.ammo <= 3 ? 'text-red-500 animate-pulse' : 'text-white'
              }`}
            >
              {gameState.ammo} / {gameState.currentWeapon.magazineSize}
            </div>
            {gameState.reloading && (
              <div className="text-yellow-400 text-sm font-bold animate-pulse">
                RELOADING...
              </div>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div>DMG: {gameState.currentWeapon.damage}</div>
            <div>ACC: {(gameState.currentWeapon.accuracy * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="bg-black bg-opacity-60 px-4 py-2 rounded-lg text-center">
          <div className="text-white text-sm">Two-Finger Tap</div>
          <div className="text-gray-400 text-xs">Switch Weapon</div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-8 h-8">
          <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-white -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-white -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-white -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-white -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  )
}
