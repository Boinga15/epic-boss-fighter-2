import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";
import { BaseEnemy } from "./enemy";

export class Projectile extends Actor {
    speed: number;
    pAngle: number;
    size: number;
    colour: string;
    knockback: number;

    lifetime: number;

    circleGraphics: Graphics;

    constructor(game: Game, speed: number, angle: number, size: number, colour: string, lifetime: number, knockback: number) {
        super(game);

        this.speed = speed;
        this.pAngle = angle;

        this.size = size;
        this.colour = colour;

        this.lifetime = lifetime;
        this.knockback = knockback * 2;

        this.circleGraphics = new Graphics().circle(0, 0, this.size).fill(this.colour);
        this.addChild(this.circleGraphics);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        const vectorSpeed = this.game.angleToVector(this.pAngle, this.speed);

        this.x += vectorSpeed.x * deltaTime;
        this.y += vectorSpeed.y * deltaTime;

        this.lifetime -= deltaTime;

        if (this.x > 500 + this.size || this.x < -500 - this.size || this.y > 500 + this.size || this.y < -500 - this.size || this.lifetime <= 0) {
            this.remove();
        }
    }
}


export class PlayerProjectile extends Projectile {
    pierce: number;
    explosive: boolean;
    damage: number;

    hitEnemies: BaseEnemy[] = []

    constructor(game: Game, speed: number, angle: number, size: number, colour: string, lifetime: number = 60, damage: number = 1, pierce: number = 0, explosive: boolean = false, knockback: number = 1) {
        super(game, speed, angle, size, colour, lifetime, knockback);
        this.pierce = pierce;
        this.explosive = explosive
        this.damage = damage
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        for (const enemy of this.game.level!.getActorsOfClass(BaseEnemy)) {
            if (this.game.pointToRectCollision({ x: this.x, y: this.y }, {x: enemy.x - Math.floor(enemy.size / 2), y: enemy.y - Math.floor(enemy.size / 2), xSize: enemy.size, ySize: enemy.size}) && !(this.hitEnemies.includes(enemy))) {
                this.hitEnemies.push(enemy);
                enemy.takeDamage(this.damage, this.pAngle, this.knockback);

                this.pierce -= 1;

                if (this.pierce < 0) {
                    this.remove();
                }
            }
        }
    }
}