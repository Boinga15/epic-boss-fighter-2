import { Actor, Game } from "unreal-pixijs";
import { Player } from "./persistant/player";
import { Graphics } from "pixi.js";
import { PlayerProjectile } from "./projectile";

export class PlayerCharacter extends Actor {
    playerRef: Player

    speed: number
    nextShot: number = 0
    
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

    private handleFiring(deltaTime: number) {
        this.nextShot -= deltaTime;

        if (this.nextShot > 0 || !this.game.mouseDown[0]) {
            return;
        }

        const fireAngle = this.game.getAngle({x: this.x, y: this.y}, {x: this.game.level!.mousePos.x, y: this.game.level!.mousePos.y});
        const newProjectile = new PlayerProjectile(this.game, 1200, fireAngle, 10, "#fff200ff", 0);
        
        newProjectile.x = this.x;
        newProjectile.y = this.y;

        this.game.level!.addActor(newProjectile);
        this.nextShot = 0.05;
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

        this.handleFiring(deltaTime)
    }
}