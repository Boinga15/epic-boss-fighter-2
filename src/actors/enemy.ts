import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";
import { PlayerCharacter } from "./player_character";

export class BaseEnemy extends Actor {
    maxHealth: number;
    health: number;

    name: string;
    difficulty: number

    boss: boolean;
    colour: string;
    size: number;
    friction: number;
    contactDamage: number;

    velocity: {x: number, y: number} = {x: 0, y: 0};

    playerObject: PlayerCharacter | undefined;

    constructor(game: Game, x: number, y: number, name: string, difficulty: number, boss: boolean, health: number, colour: string, size: number, friction: number, contactDamage: number) {
        super(game, x, y, 1);

        this.maxHealth = health;
        this.health = health;

        this.name = name;
        this.difficulty = difficulty;
        
        this.boss = boss;
        this.colour = colour;
        this.size = size;
        this.friction = friction;
        this.contactDamage = contactDamage;

        this.addChild(new Graphics().rect(-Math.floor(this.size / 2), -Math.floor(this.size / 2), this.size, this.size).fill(this.colour));
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.playerObject === undefined) {
            this.playerObject = this.game.level!.getActorOfClass(PlayerCharacter);
        }

        this.velocity.x = this.velocity.x * (1 - this.friction)**(deltaTime);
        this.velocity.y = this.velocity.y * (1 - this.friction)**(deltaTime);

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Contact Damage
        if (this.playerObject !== undefined) {
            if (this.game.rectToRectCollision({x: this.x - (this.size / 2), y: this.y - (this.size / 2), xSize: this.size, ySize: this.size}, {x: this.playerObject.x - 20, y: this.playerObject.y - 20, xSize: 40, ySize: 40})) {
                this.playerObject.takeDamage(this.contactDamage * this.getDamageMultiplier() * deltaTime)
            }
        }
    }

    takeDamage(damage: number, angle: number, knockback: number) {
        this.health -= damage * [1.2, 1, 0.8, 0.6, 0.4][this.difficulty];
        const knockbackVector = this.game.angleToVector(angle, knockback);

        this.velocity.x += knockbackVector.x;
        this.velocity.y += knockbackVector.y;

        if (this.health <= 0 && !this.boss) {
            this.remove();
        }
    }

    getDamageMultiplier() {
        return [0.7, 1, 1.2, 1.5, 2][this.difficulty]
    }
}