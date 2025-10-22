'use client'

import { GameState, WeaponStats } from '../types/game'
import { getUpgradeCost } from '../lib/weapons'

interface MenuProps {
  gameState: GameState
  weapons: WeaponStats[]
  onClose: () => void
  onPurchaseWeapon: (weapon: WeaponStats) => void
  onUpgradeWeapon: () => void
  onSensitivityChange: (value: number) => void
}

export default function Menu({
  gameState,
  weapons,
  onClose,
  onPurchaseWeapon,
  onUpgradeWeapon,
  onSensitivityChange,
}: MenuProps) {
  const upgradeCost = getUpgradeCost(gameState.currentWeapon)
  const unlockedIds = gameState.unlockedWeapons.map((w) => w.id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">ARMORY</h2>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Currency Display */}
        <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-6">
          <div className="text-green-400 text-2xl font-bold">
            ${gameState.currency.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Available Currency</div>
        </div>

        {/* Current Weapon */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            Current Weapon
          </h3>
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 border-2 border-yellow-400">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-white text-2xl font-bold">
                  {gameState.currentWeapon.name}
                </div>
                <div className="text-gray-300 text-sm">
                  Level {gameState.currentWeapon.level}
                </div>
              </div>
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                {gameState.currentWeapon.type.toUpperCase()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="text-gray-300">
                <span className="text-white font-bold">
                  {gameState.currentWeapon.damage}
                </span>{' '}
                Damage
              </div>
              <div className="text-gray-300">
                <span className="text-white font-bold">
                  {(gameState.currentWeapon.accuracy * 100).toFixed(0)}%
                </span>{' '}
                Accuracy
              </div>
              <div className="text-gray-300">
                <span className="text-white font-bold">
                  {gameState.currentWeapon.magazineSize}
                </span>{' '}
                Magazine
              </div>
              <div className="text-gray-300">
                <span className="text-white font-bold">
                  {gameState.currentWeapon.reloadSpeed.toFixed(1)}s
                </span>{' '}
                Reload
              </div>
            </div>
            <button
              onClick={onUpgradeWeapon}
              disabled={gameState.currency < upgradeCost}
              className={`w-full py-3 rounded-lg font-bold transition-all ${
                gameState.currency >= upgradeCost
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              UPGRADE - ${upgradeCost.toLocaleString()}
            </button>
          </div>
        </div>

        {/* Available Weapons */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            Available Weapons
          </h3>
          <div className="space-y-3">
            {weapons.map((weapon) => {
              const isUnlocked = unlockedIds.includes(weapon.id)
              const canAfford = gameState.currency >= weapon.cost

              return (
                <div
                  key={weapon.id}
                  className={`rounded-lg p-4 border-2 ${
                    isUnlocked
                      ? 'bg-gray-700 border-green-500'
                      : 'bg-gray-800 border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white text-xl font-bold">
                        {weapon.name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {weapon.type.toUpperCase()}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        isUnlocked
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {isUnlocked ? 'UNLOCKED' : `$${weapon.cost}`}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-3">
                    <div>DMG: {weapon.damage}</div>
                    <div>ACC: {(weapon.accuracy * 100).toFixed(0)}%</div>
                    <div>MAG: {weapon.magazineSize}</div>
                    <div>RLD: {weapon.reloadSpeed.toFixed(1)}s</div>
                  </div>
                  {!isUnlocked && (
                    <button
                      onClick={() => onPurchaseWeapon(weapon)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-bold transition-all ${
                        canAfford
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'PURCHASE' : 'INSUFFICIENT FUNDS'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-xl font-bold text-yellow-400 mb-3">Settings</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <label className="text-white block mb-2">
              Aim Sensitivity: {gameState.sensitivity.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={gameState.sensitivity}
              onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
              className="w-full pointer-events-auto"
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
