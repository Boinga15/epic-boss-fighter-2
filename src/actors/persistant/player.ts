import { Actor, Game } from "unreal-pixijs";
import { Weapon } from "../../data/types";

export class Player extends Actor {
    equippedWeapons: Weapon[] = ["Chaingun", "Machine Gun"]

    constructor(game: Game) {
        super(game);
    }
}