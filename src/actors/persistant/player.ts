import { Actor, Game } from "unreal-pixijs";
import { Armour, Special, Weapon } from "../../data/types";

export class Player extends Actor {
    equippedWeapons: Weapon[] = ["Machine Gun", "Shotgun"]
    equippedArmour: Armour = "Battle Armour";
    equippedSpecial: Special = "Power Shot";

    health: number = 100;

    specialAmount: number = 0;
    chargedSpecials: number = 0;

    constructor(game: Game) {
        super(game);
    }
}