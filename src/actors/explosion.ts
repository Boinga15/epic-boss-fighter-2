import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";
import { BaseEnemy } from "./enemy";

export class Explosion extends Actor {
    colour: string;
    size: number;
    decayRate: number;
    damage: number;
    alignment: number;

    circleGraphic: Graphics;
    
    constructor(game: Game, x: number, y: number, colour: string, size: number, decayRate: number, damage: number, alignment: number) {
        super(game, x, y, 0);

        this.colour = colour;
        this.size = size;
        this.decayRate = decayRate;
        this.damage = damage;
        this.alignment = alignment;

        this.circleGraphic = new Graphics().circle(0, 0, this.size).fill(this.colour);
        this.addChild(this.circleGraphic);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        this.size -= this.decayRate * deltaTime;

        if (this.size <= 0) {
            this.remove();
            return;
        }

        this.circleGraphic.clear().circle(0, 0, this.size).fill(this.colour);

        if (this.alignment >= 0) {
            for (const enemy of this.game.level!.getActorsOfClass(BaseEnemy)) {
                if (this.game.getDistance({x: this.x, y: this.y}, {x: enemy.x, y: enemy.y}) <= this.size) {
                    const angleOfDamage = this.game.getAngle({x: this.x, y: this.y}, {x: enemy.x, y: enemy.y});
                    enemy.takeDamage(this.damage * deltaTime, angleOfDamage, 10 * deltaTime);
                }
            }
        }
    }
}