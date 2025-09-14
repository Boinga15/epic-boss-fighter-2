import { Actor, Game } from "unreal-pixijs";
import { Player } from "./persistant/player";
import { Graphics } from "pixi.js";

export class PlayerCharacter extends Actor {
    playerRef: Player
    
    constructor(game: Game, x: number, y: number) {
        super(game);

        this.x = x;
        this.y = y;

        this.playerRef = game.getPersistantActorOfClass(Player)!;

        // Graphics
        this.addChild(new Graphics().rect(-20, -20, 40, 40).fill("#00ff4cff"));
    }
}