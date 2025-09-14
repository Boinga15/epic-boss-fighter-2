import { Actor, Game } from "unreal-pixijs";
import { Player } from "./persistant/player";
import { Graphics } from "pixi.js";

export class PlayerCharacter extends Actor {
    playerRef: Player

    speed: number
    
    constructor(game: Game, x: number, y: number) {
        super(game);

        this.x = x;
        this.y = y;

        this.playerRef = game.getPersistantActorOfClass(Player)!;

        // Graphics
        this.addChild(new Graphics().rect(-20, -20, 40, 40).fill("#00ff4cff"));

        // Statistics
        this.speed = 400;
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.game.keys["KeyD"]) {
            this.x = Math.min(480, Math.max(-480, this.x + (this.speed * deltaTime)));
        } else if (this.game.keys["KeyA"]) {
            this.x = Math.min(480, Math.max(-480, this.x - (this.speed * deltaTime)));
        }

        if (this.game.keys["KeyW"]) {
            this.y = Math.min(480, Math.max(-480, this.y - (this.speed * deltaTime)));
        } else if (this.game.keys["KeyS"]) {
            this.y = Math.min(480, Math.max(-480, this.y + (this.speed * deltaTime)));
        }
    }
}