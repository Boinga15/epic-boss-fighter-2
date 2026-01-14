import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";
import { BaseEnemy } from "./enemy";
import { Explosion } from "./explosion";
import { Player } from "./persistant/player";
import { specialStats } from "../data/stats";
import { PlayerCharacter } from "./player_character";

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

                if (this.game.getPersistantActorOfClass(Player)!.equippedArmour === "Leech Armour") {
                    const playerRef = this.game.getPersistantActorOfClass(Player)!;
                    playerRef.health = Math.max(0, Math.min(100, playerRef.health + this.damage));
                    
                    if (playerRef.chargedSpecials < specialStats[playerRef.equippedSpecial].maxCharges) {
                        playerRef.specialAmount = Math.max(0, Math.min(100, playerRef.specialAmount + this.damage));
                    }
                }

                this.pierce -= 1;

                if (this.explosive) {
                    this.game.level!.addActor(new Explosion(this.game, this.x, this.y, "#ff8c00ff", 200, 500, 5, 1));
                }

                if (this.pierce < 0) {
                    this.remove();
                }
            }
        }
    }
}


export class PlayerPowerProjectile extends Projectile {
    damage: number;

    hitEnemies: BaseEnemy[] = []

    constructor(game: Game, speed: number, angle: number, size: number, colour: string, lifetime: number = 60, damage: number = 1, knockback: number = 1) {
        super(game, speed, angle, size, colour, lifetime, knockback);
        this.damage = damage;
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        for (const enemy of this.game.level!.getActorsOfClass(BaseEnemy)) {
            if (this.game.rectToRectCollision({ x: this.x - this.size, y: this.y - this.size, xSize: this.size * 2, ySize: this.size * 2 }, {x: enemy.x - Math.floor(enemy.size / 2), y: enemy.y - Math.floor(enemy.size / 2), xSize: enemy.size, ySize: enemy.size})) {
                enemy.takeDamage(this.damage * deltaTime, this.pAngle, this.knockback * deltaTime);
            }
        }
    }
}


export class PlayerLingeringProjectile extends Projectile {
    damage: number;

    hitEnemies: BaseEnemy[] = []

    constructor(game: Game, speed: number, angle: number, size: number, colour: string, lifetime: number = 60, damage: number = 1) {
        super(game, speed, angle, size, colour, lifetime, 0);
        this.damage = damage;
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        for (const enemy of this.game.level!.getActorsOfClass(BaseEnemy)) {
            if (this.game.rectToRectCollision({ x: this.x - this.size, y: this.y - this.size, xSize: this.size * 2, ySize: this.size * 2 }, {x: enemy.x - Math.floor(enemy.size / 2), y: enemy.y - Math.floor(enemy.size / 2), xSize: enemy.size, ySize: enemy.size})) {
                enemy.takeDamage(this.damage * deltaTime, this.pAngle, this.knockback * deltaTime);
            }
        }

        // Reduce speed.
        this.speed = this.speed * 0.02**(deltaTime)
    }
}


export class EnemyProjectile extends Projectile {
    damage: number;
    accelerationSpeed: number;

    constructor(game: Game, speed: number, angle: number, size: number, colour: string, lifetime: number = 60, damage: number = 1, accelerationSpeed = 0.0) {
        super(game, speed, angle, size, colour, lifetime, 0);
        this.damage = damage
        this.accelerationSpeed = accelerationSpeed
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        this.speed += this.accelerationSpeed * deltaTime

        for (const enemy of this.game.level!.getActorsOfClass(PlayerCharacter)) {
            if (this.game.pointToRectCollision({ x: this.x, y: this.y }, {x: enemy.x - 20, y: enemy.y - 20, xSize: 40, ySize: 40}) && !enemy.isDashing) {
                enemy.takeDamage(this.damage);
                this.remove();
            }
        }
    }
}