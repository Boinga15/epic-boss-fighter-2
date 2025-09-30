import { Actor, Game } from "unreal-pixijs";
import { Armour, Weapon } from "../../data/types";

export class Player extends Actor {
    equippedWeapons: Weapon[] = ["Machine Gun", "Rocket Launcher"]
    equippedArmour: Armour = "Battle Armour";
    
    health: number = 100;

    constructor(game: Game) {
        super(game);
    }
}