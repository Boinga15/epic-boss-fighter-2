import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";
import { PlayerProjectile } from "./projectile";
import { PlayerCharacter } from "./player_character";

export class PlayerSentry extends Actor {
    attackAngle: number
    nextShot: number = 0
    health: number = 100

    constructor(game: Game, x: number, y: number, attackAngle: number, zOrder: number = 0) {
        super(game, x, y, zOrder);

        this.attackAngle = attackAngle;

        this.addChild(new Graphics().rect(-20, -20, 40, 40).fill("#b1fa8fff"));
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        this.health -= 10 * deltaTime;

        if (this.health <= 0) {
            this.remove();
            return;
        }

        this.nextShot -= deltaTime;

        if (this.nextShot > 0) {
            return;
        }

        this.nextShot = 0.1;

        // Fire a new shot.
        let fireAngle = this.attackAngle;
        
        // Adjust angle for spread.
        const adjustmentFactor = (Math.random() * 2) - 1;
        fireAngle += (2 * Math.PI / 180) * adjustmentFactor;

        const newProjectile: PlayerProjectile = new PlayerProjectile(this.game, 1300, fireAngle, 10, "#1fdfd6ff", 60, 1 * this.game.level!.getActorOfClass(PlayerCharacter)!.getDamageMultiplier(), 0, false, 1);

        newProjectile.x = this.x;
        newProjectile.y = this.y;

        this.game.level!.addActor(newProjectile);
    }
}