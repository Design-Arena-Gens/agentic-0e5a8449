import { WeaponStats } from '../types/game'

export const WEAPONS: WeaponStats[] = [
  {
    id: 'pistol_basic',
    name: 'Pistol',
    damage: 25,
    fireRate: 300,
    reloadSpeed: 1.5,
    accuracy: 0.95,
    magazineSize: 12,
    type: 'pistol',
    level: 1,
    cost: 0,
  },
  {
    id: 'smg_basic',
    name: 'SMG',
    damage: 15,
    fireRate: 100,
    reloadSpeed: 2.0,
    accuracy: 0.85,
    magazineSize: 30,
    type: 'smg',
    level: 1,
    cost: 500,
  },
  {
    id: 'shotgun_basic',
    name: 'Shotgun',
    damage: 60,
    fireRate: 800,
    reloadSpeed: 2.5,
    accuracy: 0.7,
    magazineSize: 6,
    type: 'shotgun',
    level: 1,
    cost: 750,
  },
  {
    id: 'rifle_basic',
    name: 'Rifle',
    damage: 40,
    fireRate: 150,
    reloadSpeed: 2.2,
    accuracy: 0.98,
    magazineSize: 20,
    type: 'rifle',
    level: 1,
    cost: 1000,
  },
]

export function upgradeWeapon(weapon: WeaponStats): WeaponStats {
  const newLevel = weapon.level + 1
  return {
    ...weapon,
    level: newLevel,
    damage: Math.floor(weapon.damage * 1.2),
    fireRate: Math.max(50, weapon.fireRate * 0.95),
    reloadSpeed: Math.max(0.8, weapon.reloadSpeed * 0.9),
    accuracy: Math.min(0.99, weapon.accuracy + 0.02),
    cost: Math.floor(weapon.cost * 1.5),
  }
}

export function getUpgradeCost(weapon: WeaponStats): number {
  return weapon.level * 250
}
