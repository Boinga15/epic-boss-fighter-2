import { Actor, Game } from "unreal-pixijs";
import { Player } from "./persistant/player";
import { Graphics } from "pixi.js";
import { PlayerLingeringProjectile, PlayerPowerProjectile, PlayerProjectile } from "./projectile";
import { specialStats, weaponStats } from "../data/stats";
import { Armour } from "../data/types";
import { Explosion } from "./explosion";
import { PlayerSentry } from "./sentry";

export class PlayerCharacter extends Actor {
    playerRef: Player;

    baseSpeed: number = 400;
    speed: number = 400;
    nextShot: number = 0;
    dashBar: number = 100;

    isDashing: boolean = false;
    usingSpecial: boolean = false;
    specialKeyHeld: boolean = false;
    
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
            
            let newProjectile: PlayerProjectile | PlayerLingeringProjectile = new PlayerProjectile(this.game, projectileStatistics.speed, fireAngle, projectileStatistics.size, projectileStatistics.colour, projectileStatistics.lifetime, projectileStatistics.damage * this.getDamageMultiplier(), projectileStatistics.pierce, projectileStatistics.explosive, projectileStatistics.knockback);
            
            if (selectedWeapon === "Flamethrower") {
                newProjectile = new PlayerLingeringProjectile(this.game, projectileStatistics.speed * (0.5 * Math.random() + 0.6), fireAngle, projectileStatistics.size, projectileStatistics.colour, projectileStatistics.lifetime, projectileStatistics.damage * this.getDamageMultiplier());
            }

            newProjectile.x = this.x;
            newProjectile.y = this.y;

            this.game.level!.addActor(newProjectile);
        }

        this.nextShot = projectileStatistics.fireRate;
    }

    takeDamage(damage: number) {
        const armourDefence: Record<Armour, number> = {
            "Battle Armour": 1,
            "Leech Armour": 1.6,
            "Raider Armour": 1.4,
            "Tank Armour": 0.6,
            "Viking Armour": 1.1,
            "Worn Armour": 3
        }

        if (this.isDashing || (this.usingSpecial && this.playerRef.equippedSpecial === "Invincibility")) {
            return;
        }

        this.playerRef.health = Math.min(100, Math.max(0, this.playerRef.health - (damage * armourDefence[this.playerRef.equippedArmour])))
    }

    getDamageMultiplier() {
        const armourDamage: Record<Armour, number> = {
            "Battle Armour": 1,
            "Leech Armour": 0.7,
            "Raider Armour": 1.2,
            "Tank Armour": 1.1,
            "Viking Armour": 1 + (1 - (this.playerRef.health / 100)),
            "Worn Armour": 0.5
        };

        let multiplier = armourDamage[this.playerRef.equippedArmour];

        if (this.playerRef.equippedSpecial === "Overcharge" && this.usingSpecial) {
            multiplier *= 2;
        }

        return multiplier;
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.playerRef.equippedArmour === "Viking Armour") {
            this.baseSpeed = 500;
        }

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

        if (this.playerRef.equippedArmour === "Raider Armour") {
            dashRecoveryRate = 160;
        } else if (this.playerRef.equippedArmour === "Tank Armour") {
            dashRecoveryRate = 70;
            dashLossRate = 500;
        }

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

        if (this.game.keys["Space"] && this.dashBar >= 100) {
            this.isDashing = true;
        }

        // Charging Special
        const specialStat = specialStats[this.playerRef.equippedSpecial];

        if (this.usingSpecial) {
            this.playerRef.specialAmount -= specialStat.drainSpeed * deltaTime;

            if (this.playerRef.specialAmount <= 0) {
                this.usingSpecial = false;
            }
        } else {
            if (this.playerRef.chargedSpecials < specialStat.maxCharges) {
                this.playerRef.specialAmount += specialStat.chargeSpeed * deltaTime;

                if (this.playerRef.specialAmount >= 100) {
                    this.playerRef.specialAmount = 0;
                    this.playerRef.chargedSpecials += 1;
                }
            }
        }

        // Using Special
        if (this.game.keys["KeyQ"] && this.playerRef.chargedSpecials >= 1 && !this.usingSpecial && !this.specialKeyHeld) {
            this.specialKeyHeld = true;
            this.playerRef.chargedSpecials -= 1;

            const fireAngle = this.game.getAngle({x: this.x, y: this.y}, {x: this.game.level!.mousePos.x, y: this.game.level!.mousePos.y});

            switch (this.playerRef.equippedSpecial) {
                case "Burst":
                    const newExplosion = new Explosion(this.game, this.x, this.y, "#0eace0ff", 500, 800, 30, 1);
                    this.game.level!.addActor(newExplosion);
                    break;
                
                case "Overcharge":
                    this.usingSpecial = true;
                    this.playerRef.specialAmount = 100;
                    break;
                
                case "Invincibility":
                    this.usingSpecial = true;
                    this.playerRef.specialAmount = 100;
                    break;
                
                case "Power Shot":
                    
                    const newProjectile = new PlayerPowerProjectile(this.game, 200, fireAngle, 100, "#009d2fff", 180, 10, 10);
                    
                    newProjectile.x = this.x + 20;
                    newProjectile.y = this.y + 20;
                    
                    this.game.level!.addActor(newProjectile);
                    
                    break;
                
                case "Restore":
                    this.playerRef.health = Math.max(0, Math.min(100, this.playerRef.health + 15));
                    break;
                
                case "Sentry":
                    this.game.level!.addActor(new PlayerSentry(this.game, this.x, this.y, fireAngle));
                    break;
                
            }
        } else if (!this.game.keys["KeyQ"]) {
            this.specialKeyHeld = false;
        }
    }
}