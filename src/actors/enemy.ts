import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";

export class BaseEnemy extends Actor {
    maxHealth: number;
    health: number;

    boss: boolean;
    colour: string;
    size: number;
    friction: number;

    velocity: {x: number, y: number} = {x: 0, y: 0};

    constructor(game: Game, x: number, y: number, boss: boolean, health: number, colour: string, size: number, friction: number) {
        super(game, x, y, 1);

        this.maxHealth = health;
        this.health = health;
        
        this.boss = boss;
        this.colour = colour;
        this.size = size;
        this.friction = friction;

        this.addChild(new Graphics().rect(-Math.floor(this.size / 2), -Math.floor(this.size / 2), this.size, this.size).fill(this.colour));
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        this.velocity.x = this.velocity.x * (1 - this.friction)**(deltaTime);
        this.velocity.y = this.velocity.y * (1 - this.friction)**(deltaTime);

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    takeDamage(damage: number, angle: number, knockback: number) {
        this.health -= damage;
        const knockbackVector = this.game.angleToVector(angle, knockback);

        this.velocity.x += knockbackVector.x;
        this.velocity.y += knockbackVector.y;
    }
}