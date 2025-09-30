import { Armour, Weapon } from "./types";

export const weaponDescriptions: Record<Weapon, string> = {
    "Chaingun": "A fast-firing weapon with high knockback. Perfect for crowd control.",
    "Flamethrower": "A short-range but powerful weapon that shreds enemy health.",
    "Machine Gun": "A standard all-purpose weapon. Good at everything, great at nothing.",
    "Rifle": "A slow-firing weapon with pierce, capable of hitting up to five targets at once.",
    "Rocket Launcher": "A heavy weapon that fires explosive rounds, fantastic for dealing with crowds.",
    "Shotgun": "A powerful shotgun that does more damage close-up and excels at dealing high damage quickly."
};

export const armourDescriptions: Record<Armour, string> = {
    "Battle Armour": "Standard armour similar to what you wore last time.",
    "Leech Armour": "Reduced defence and damage, but each hit regenerates health and special.",
    "Raider Armour": "Greatly reduced defence, but you deal more damage and your dash recharges faster.",
    "Tank Armour": "Slows you down slightly and reduces dash recharge and length, but increases defence and damage.",
    "Viking Armour": "Reduced defence but higher natural movement speed. You also deal more damage the lower your health is.",
    "Worn Armour": "Battered and broken armour from your first battle. The memories of this armour "
}

export const difficulties: string[] = [
    "Easy",
    "Normal",
    "Hard",
    "Impossible",
    "Not Even Remotely Fair"
]