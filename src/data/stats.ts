import { Special, Weapon } from "./types";

export const weaponStats: Record<Weapon, {
    speed: number,
    size: number,
    colour: string,
    lifetime: number,
    damage: number,
    pierce: number,
    explosive: boolean,
    spread: number,
    fireRate: number,
    projectileCount: number,
    knockback: number
}> = {
    "Chaingun": {
        speed: 1200,
        size: 10,
        colour: "#fff200ff",
        lifetime: 60,
        damage: 0.7,
        pierce: 0,
        explosive: false,
        spread: 20,
        fireRate: 0.03,
        projectileCount: 2,
        knockback: 1.2
    },
    "Flamethrower": {
        speed: 1400,
        size: 10,
        colour: "#ff8800ff",
        lifetime: 2,
        damage: 0.4,
        pierce: 10000,
        explosive: false,
        spread: 20,
        fireRate: 0.02,
        projectileCount: 3,
        knockback: 0.1
    },
    "Machine Gun": {
        speed: 1200,
        size: 10,
        colour: "#fff200ff",
        lifetime: 60,
        damage: 1,
        pierce: 0,
        explosive: false,
        spread: 2,
        fireRate: 0.05,
        projectileCount: 1,
        knockback: 1.2
    },
    "Rifle": {
        speed: 1400,
        size: 10,
        colour: "#fff200ff",
        lifetime: 60,
        damage: 3,
        pierce: 5,
        explosive: false,
        spread: 0,
        fireRate: 0.2,
        projectileCount: 1,
        knockback: 3
    },
    "Rocket Launcher": {
        speed: 800,
        size: 10,
        colour: "#b1b1b1ff",
        lifetime: 60,
        damage: 2,
        pierce: 0,
        explosive: true,
        spread: 0,
        fireRate: 0.3
        ,projectileCount: 1,
        knockback: 3
    },
    "Shotgun": {
        speed: 1200,
        size: 10,
        colour: "#fff200ff",
        lifetime: 60,
        damage: 0.6,
        pierce: 1,
        explosive: false,
        spread: 30,
        fireRate: 0.15,
        projectileCount: 6,
        knockback: 1.1
    }
}


export const specialStats: Record<Special, {
    chargeSpeed: number,
    drainSpeed: number,
    maxCharges: number
}> = {
    "Burst": {chargeSpeed: 15, drainSpeed: 0, maxCharges: 3},
    "Invincibility": {chargeSpeed: 6, drainSpeed: 30, maxCharges: 1},
    "Overcharge": {chargeSpeed: 7, drainSpeed: 20, maxCharges: 1},
    "Power Shot": {chargeSpeed: 10, drainSpeed: 0, maxCharges: 3},
    "Restore": {chargeSpeed: 20, drainSpeed: 0, maxCharges: 5},
    "Sentry": {chargeSpeed: 15, drainSpeed: 0, maxCharges: 5}
}