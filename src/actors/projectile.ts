import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";

export class Projectile extends Actor {
    speed: number;
    pAngle: number;
    size: number;
    colour: string;

    circleGraphics: Graphics;

    constructor(game: Game, speed: number, angle: number, size: number, colour: string) {
        super(game);

        this.speed = speed;
        this.pAngle = angle;

        this.size = size;
        this.colour = colour;

        this.circleGraphics = new Graphics().circle(0, 0, this.size).fill(this.colour);
        this.addChild(this.circleGraphics);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        const vectorSpeed = this.game.angleToVector(this.pAngle, this.speed);

        this.x += vectorSpeed.x * deltaTime;
        this.y += vectorSpeed.y * deltaTime;

        //console.log(`x: ${this.x}, y: ${this.y}`)

        if (this.x > 500 + this.size || this.x < -500 - this.size || this.y > 500 + this.size || this.y < -500 - this.size) {
            this.remove();
        }
    }
}


export class PlayerProjectile extends Projectile {
    pierce: number = 0;

    constructor(game: Game, speed: number, angle: number, size: number, colour: string, pierce: number = 0) {
        super(game, speed, angle, size, colour);
        this.pierce = pierce;
    }
}