import { Actor, Game } from "unreal-pixijs";
import { Player } from "./persistant/player";
import { Graphics } from "pixi.js";
import { PlayerProjectile } from "./projectile";
import { weaponStats } from "../data/stats";

export class PlayerCharacter extends Actor {
    playerRef: Player;

    baseSpeed: number = 400;
    speed: number = 400;
    nextShot: number = 0;
    dashBar: number = 100;

    isDashing: boolean = false;
    
    constructor(game: Game, x: number, y: number) {
        super(game, x, y, 2);

        this.playerRef = game.getPersistantActorOfClass(Player)!;

        // Graphics
        this.addChild(new Graphics().rect(-20, -20, 40, 40).fill("#00ff4cff"));
    }

    private handleFiring(deltaTime: number) {
        this.nextShot -= deltaTime;

        if (this.nextShot > 0) {
            return;
        }

        let chosenWeapon = -1;

        if (this.game.mouseDown[0]) {
            chosenWeapon = 0;
        } else if (this.game.mouseDown[2]) {
            chosenWeapon = 1;
        }

        if (chosenWeapon == -1) {
            return;
        }

        const selectedWeapon = this.playerRef.equippedWeapons[chosenWeapon];
        const projectileStatistics = weaponStats[selectedWeapon];

        for (let i = 0; i < projectileStatistics.projectileCount; i++) {
            let fireAngle = this.game.getAngle({x: this.x, y: this.y}, {x: this.game.level!.mousePos.x, y: this.game.level!.mousePos.y});
            
            // Adjust angle for spread.
            const adjustmentFactor = (Math.random() * 2) - 1;
            fireAngle += (projectileStatistics.spread * Math.PI / 180) * adjustmentFactor;
            
            const newProjectile = new PlayerProjectile(this.game, projectileStatistics.speed, fireAngle, projectileStatistics.size, projectileStatistics.colour, projectileStatistics.lifetime, projectileStatistics.damage, projectileStatistics.pierce, projectileStatistics.explosive, projectileStatistics.knockback);
            
            newProjectile.x = this.x;
            newProjectile.y = this.y;

            this.game.level!.addActor(newProjectile);
        }

        this.nextShot = projectileStatistics.fireRate;
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

        this.handleFiring(deltaTime);

        // Handle Dashing
        let dashRecoveryRate = 100;
        let dashLossRate = 400;

        if (!this.isDashing) {
            this.dashBar = Math.max(0, Math.min(100, this.dashBar + (dashRecoveryRate * deltaTime)));
            this.speed = this.baseSpeed
        } else {
            this.dashBar = Math.max(0, Math.min(100, this.dashBar - (dashLossRate * deltaTime)));
            this.speed = this.baseSpeed * 3;

            if (this.dashBar <= 0) {
                this.isDashing = false;
            }
        }

        if (this.game.keys["Space"]) {
            this.isDashing = true;
        }
    }
}