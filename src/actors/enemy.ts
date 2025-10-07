import { Graphics } from "pixi.js";
import { Actor, Game } from "unreal-pixijs";
import { PlayerCharacter } from "./player_character";
import { EnemyProjectile } from "./projectile";

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

        if (this.health <= 0) {
            return;
        }

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


// Regular Enemies
export class RunnerEnemy extends BaseEnemy {
    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Runner", difficulty, boss, 10, "#d30000ff", 40, 0.999, 15);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        const speed = [140, 170, 200, 230, 280][this.difficulty];
        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;
    }
}


export class GunnerEnemy extends BaseEnemy {
    nextShot: number = 0.7

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Gunner", difficulty, boss, 7, "#670000ff", 40, 0.99, 10);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        if (this.game.getSquaredDistance({x: this.x, y: this.y}, {x: player.x, y: player.y}) > 300 ** 2 || this.x >= 520 || this.x <= -520 || this.y >= 520 || this.y <= -520) {
            const speed = [140, 170, 200, 230, 280][this.difficulty];
            const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y }), speed);

            this.x += movementVector.x * deltaTime;
            this.y += movementVector.y * deltaTime;
        }

        this.nextShot -= deltaTime * [0.8, 1, 1, 1.4, 2][this.difficulty];

        if (this.nextShot <= 0) {
            this.nextShot = 0.7;

            const pAngle = this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y });
            const newProjectile = new EnemyProjectile(this.game, 400, pAngle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
            newProjectile.x = this.x;
            newProjectile.y = this.y;
            
            this.game.level!.addActor(newProjectile);
        }
    }
}


export class FlankingEnemy extends BaseEnemy {
    destination: {x: number, y: number};
    destinationFlop = false;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Runner", difficulty, boss, 15, "#f49c37ff", 40, 0.999, 25);
        this.destination = {x: this.x, y: this.y};
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        const speed = [160, 200, 230, 260, 300][this.difficulty];
        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, this.destination), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        if (this.game.getSquaredDistance({x: this.x, y: this.y}, this.destination) <= 2500) {
            this.destinationFlop = !this.destinationFlop;

            if (this.destinationFlop) {
                this.destination = {
                    x: player.x - 400 + (Math.random() * 800),
                    y: player.y - 400 + (Math.random() * 800)
                }
            } else {
                this.destination = {
                    x: player.x,
                    y: player. y
                }
            }
        }
    }
}


// Boss Set #1
export class Tank extends BaseEnemy {
    nextShot: number = 0.5
    nextRing: number = 0.7

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Tank", difficulty, boss, 160, "#a40000ff", 100, 1, 20);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        const speed = [100, 150, 150, 200, 250][this.difficulty];
        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        // Firing
        this.nextShot -= deltaTime;
        this.nextRing -= deltaTime;

        if (this.nextShot <= 0 && this.difficulty >= 1) {
            this.nextShot = 0.5;

            const pAngle = this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y });
            const newProjectile = new EnemyProjectile(this.game, 500, pAngle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
            newProjectile.x = this.x;
            newProjectile.y = this.y;
            
            this.game.level!.addActor(newProjectile);

            if (this.difficulty >= 2) {
                for (const position of [{x: this.x - 50, y: this.y - 50}, {x: this.x + 50, y: this.y - 50}, {x: this.x - 50, y: this.y + 50}, {x: this.x + 50, y: this.y + 50}]) {
                    const pAngle = this.game.getAngle({ x: position.x, y: position.y }, { x: player.x, y: player.y });
                    const newProjectile = new EnemyProjectile(this.game, 400, pAngle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                    newProjectile.x = position.x;
                    newProjectile.y = position.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            }

            if (this.difficulty >= 4) {
                this.nextShot = 0.25;
            }
        }

        if (this.nextRing <= 0 && this.difficulty >= 3) {
            this.nextRing = 0.7;

            for (let i = 0; i < 8; i++) {
                const newProjectile = new EnemyProjectile(this.game, 200, (i * (Math.PI / 4)), 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                newProjectile.x = this.x;
                newProjectile.y = this.y;
                
                this.game.level!.addActor(newProjectile);

                if (this.difficulty >= 4) {
                    const newProjectile = new EnemyProjectile(this.game, 500, (i * (Math.PI / 4)), 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            }
        }
    }
}


export class Sprinter extends BaseEnemy {
    destination: {x: number, y: number};
    nextSpawn: number = 1;
    spawnedEnemies: BaseEnemy[] = [];
    shotRotation: number = 0
    nextShot: number = 0.4

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Sprinter", difficulty, boss, 120, "#d9a817ff", 60, 0.999999999, 15);
        this.destination = {x: this.x, y: this.y};
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Handle movement
        const speed = [120, 140, 160, 180, 250][this.difficulty];

        if (this.game.getSquaredDistance({x: this.x, y: this.y}, this.destination) <= 2500) {
            this.destination = {
                x: -400 + (Math.random() * 800),
                y: -400 + (Math.random() * 800)
            }

            if (this.difficulty >= 1) {
                for (let i = 0; i < 8; i++) {
                    const newProjectile = new EnemyProjectile(this.game, 300, (i * (Math.PI / 4)), 10, "#ff0000", 60, 8 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);

                    if (this.difficulty >= 4) {
                        const newProjectile = new EnemyProjectile(this.game, 500, (i * (Math.PI / 4)), 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                        newProjectile.x = this.x;
                        newProjectile.y = this.y;
                        
                        this.game.level!.addActor(newProjectile);
                    }
                }
            }
        }

        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: this.destination.x, y: this.destination.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        this.nextSpawn -= deltaTime;

        if (this.nextSpawn <= 0 && this.spawnedEnemies.length < [2, 3, 4, 4, 10][this.difficulty]) {
            this.nextSpawn = 1;

            const targetPosition = {x: -520, y: -520};

            if (Math.random() <= 0.5) {
                if (Math.random() <= 0.5) {
                    targetPosition.y = 520;
                }

                targetPosition.x = -520 + (Math.random() * 1040);
            } else {
                if (Math.random() <= 0.5) {
                    targetPosition.x = 520;
                }

                targetPosition.y = -520 + (Math.random() * 1040);
            }

            let newEnemy: RunnerEnemy | FlankingEnemy = new RunnerEnemy(this.game, targetPosition.x, targetPosition.y, this.difficulty, false)
            
            if (this.difficulty >= 3) {
                newEnemy = new FlankingEnemy(this.game, targetPosition.x, targetPosition.y, this.difficulty, false)
            }
            
            this.game.level!.addActor(newEnemy);
            this.spawnedEnemies.push(newEnemy);
        }

        this.spawnedEnemies = this.spawnedEnemies.filter((enemy) => enemy.health > 0);

        this.nextShot -= deltaTime;

        if (this.nextShot <= 0 && this.difficulty >= 2) {
            this.nextShot = 0.2;
            this.shotRotation += 1;

            if (this.shotRotation >= 8) {
                this.shotRotation = 0;
            }

            const newProjectile = new EnemyProjectile(this.game, 500, (this.shotRotation * (Math.PI / 4)), 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
            newProjectile.x = this.x;
            newProjectile.y = this.y;
            
            this.game.level!.addActor(newProjectile);
        }
    }
}


// Boss Set #2
export class Sweep extends BaseEnemy {
    nextShot: number = 0.5;
    nextWall: number = 2;
    wallFlip: number = 1;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Sweep", difficulty, boss, 200, "#727272ff", 100, 1, 40);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        const speed = [110, 130, 150, 180, 220][this.difficulty];
        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        this.nextShot -= deltaTime * [0.8, 1, 1.3, 1.5, 3][this.difficulty]
        this.nextWall -= deltaTime * [0.8, 1, 1, 1.2, 1.5][this.difficulty]

        if (this.nextShot <= 0) {
            this.nextShot = 0.25

            const targetPosition = {x: -510, y: -510};
            let shotAngle = 0;

            if (Math.random() <= 0.5) {
                shotAngle = Math.PI / 2;
                if (Math.random() <= 0.5) {
                    targetPosition.y = 510;
                    shotAngle = 3 * Math.PI / 2;
                }

                targetPosition.x = -500 + (Math.random() * 1040);
            } else {
                if (Math.random() <= 0.5) {
                    targetPosition.x = 510;
                    shotAngle = Math.PI;
                }

                targetPosition.y = -500 + (Math.random() * 1040);
            }

            const projectileSpeed = [200, 250, 300, 400, 500][this.difficulty] * 0.4

            const newProjectile = new EnemyProjectile(this.game, projectileSpeed, shotAngle, 10, "#ff0000", 60, 8 * this.getDamageMultiplier());
            newProjectile.x = targetPosition.x;
            newProjectile.y = targetPosition.y;
            
            this.game.level!.addActor(newProjectile);
        }

        const projectileSpeed = [200, 250, 300, 450, 600][this.difficulty] * 0.4
        
        if (this.nextWall <= 0 && this.difficulty >= 2) {
            this.nextWall = 6;

            if (this.difficulty >= 4) {
                if (this.wallFlip >= 2) {
                    this.nextWall = 0.5;
                    this.wallFlip = 0;
                } else {
                    this.wallFlip++;
                }
            }

            const targetPosition = {x: -510, y: -510};
            let shotAngle = 0;

            if (Math.random() <= 0.5) {
                shotAngle = Math.PI / 2;
                if (Math.random() <= 0.5) {
                    targetPosition.y = 510;
                    shotAngle = 3 * Math.PI / 2;
                }
                
                for (let i = -500; i <= 500; i += 20) {
                    const newProjectile = new EnemyProjectile(this.game, projectileSpeed, shotAngle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                    newProjectile.x = i;
                    newProjectile.y = targetPosition.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            } else {
                if (Math.random() <= 0.5) {
                    targetPosition.x = 510;
                    shotAngle = Math.PI;
                }

                targetPosition.y = -500 + (Math.random() * 1040);

                for (let i = -500; i <= 500; i += 20) {
                    const newProjectile = new EnemyProjectile(this.game, projectileSpeed, shotAngle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                    newProjectile.x = targetPosition.x;
                    newProjectile.y = i;
                    
                    this.game.level!.addActor(newProjectile);
                }
            }
        }
    }
}


export class Station extends BaseEnemy {
    auraCircle: Graphics;
    auraAmount: number = 0;

    nextSpawn: number = 1;
    spawnedEnemies: BaseEnemy[] = [];

    ringRotation: number = 0;
    nextRing: number = 0.7;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Station", difficulty, boss, 320, "#0f4b04ff", 200, 1, 70);

        this.auraCircle = new Graphics().circle(0, 0, this.auraAmount).fill("#10e3ffff");
        this.auraCircle.zIndex = -1;
        this.addChild(this.auraCircle);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            this.auraAmount = 0;
            this.auraCircle.clear().circle(0, 0, this.auraAmount).fill("#10e3ffff");
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        this.auraAmount += [5, 6, 8, 9, 12][this.difficulty] * deltaTime * 10;
        this.auraCircle.clear().circle(0, 0, this.auraAmount).fill("#10e3ffff");

        if (this.game.getDistance({x: this.x, y: this.y}, {x: player.x, y: player.y}) <= this.auraAmount) {
            this.playerObject?.takeDamage(20 * deltaTime * this.getDamageMultiplier());
        }

        this.nextSpawn -= deltaTime;

        if (this.nextSpawn <= 0 && this.spawnedEnemies.length < [2, 3, 4, 5, 6][this.difficulty]) {
            this.nextSpawn = 1;

            const targetPosition = {x: -520, y: -520};

            if (Math.random() <= 0.5) {
                if (Math.random() <= 0.5) {
                    targetPosition.y = 520;
                }

                targetPosition.x = -520 + (Math.random() * 1040);
            } else {
                if (Math.random() <= 0.5) {
                    targetPosition.x = 520;
                }

                targetPosition.y = -520 + (Math.random() * 1040);
            }

            let newEnemy: GunnerEnemy | FlankingEnemy = new GunnerEnemy(this.game, targetPosition.x, targetPosition.y, this.difficulty, false)
            
            if (this.difficulty >= 2 && Math.random() >= 0.6) {
                newEnemy = new FlankingEnemy(this.game, targetPosition.x, targetPosition.y, this.difficulty, false)
            }
            
            this.game.level!.addActor(newEnemy);
            this.spawnedEnemies.push(newEnemy);
        }

        this.spawnedEnemies = this.spawnedEnemies.filter((enemy) => enemy.health > 0);

        // Rings
        this.nextRing -= deltaTime * [0, 1, 1, 1.2, 1.5][this.difficulty];
        this.ringRotation += Math.PI * deltaTime;

        if (this.ringRotation > (Math.PI * 2)) {
            this.ringRotation = 0;
        }

        if (this.nextRing <= 0 && this.difficulty >= 1) {
            this.nextRing = 0.7;

            for (let i = 0; i < 8; i++) {

                if (this.difficulty >= 4) {                    
                    const newProjectile2 = new EnemyProjectile(this.game, (100), (i * (Math.PI / 4)) + (this.ringRotation), 10, "#ff0000", 60, 10 * this.getDamageMultiplier());
                    newProjectile2.x = this.x;
                    newProjectile2.y = this.y;
                    
                    this.game.level!.addActor(newProjectile2);
                } else {
                    const newProjectile = new EnemyProjectile(this.game, (this.difficulty >= 3 ? 400 : 300), (i * (Math.PI / 4)) + (this.ringRotation), 10, "#ff0000", 60, 10 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            }
        }
    }

    takeDamage(damage: number, angle: number, knockback: number): void {
        super.takeDamage(damage, angle, knockback);

        this.auraAmount = Math.max(0, this.auraAmount - damage * 8);
    }
}


// Boss Set #3
export class Shadow extends BaseEnemy {
    nextTeleport: number = 25;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Shadow", difficulty, boss, 150, "#2f2f2fff", 30, 0.9999, 30);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        const speed = [160, 250, 260, 300, 320][this.difficulty] * 1.2;
        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;
    }

    takeDamage(damage: number, angle: number, knockback: number): void {
        super.takeDamage(damage, angle, knockback);

        if (this.health <= 0) {
            return;
        }

        this.nextTeleport -= damage;

        if (this.nextTeleport <= 0) {
            this.nextTeleport = 25;

            let newLocation = {x: -9999, y: -9999};
            const player = this.game.level!.getActorOfClass(PlayerCharacter)!;

            while ((newLocation.x <= -500 || newLocation.x >= 500 || newLocation.y <= -500 || newLocation.y >= 500) || this.game.getSquaredDistance(newLocation, {x: player.x, y: player.y}) <= 300**2) {
                newLocation = {
                    x: -500 + Math.random() * 1000,
                    y: -500 + Math.random() * 1000
                }
            }

            if (this.difficulty >= 1) {
                for (let i = 0; i < 8; i++) {
                    const newProjectile = new EnemyProjectile(this.game, 400, (i * (Math.PI / 4)), 10, "#ff0000", 60, 10 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            }

            this.x = newLocation.x;
            this.y = newLocation.y;

            if (this.difficulty >= 2) {
                for (let i = 0; i < 8; i++) {
                    const newProjectile = new EnemyProjectile(this.game, 400, (i * (Math.PI / 4)), 10, "#ff0000", 60, 10 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }

                if (this.difficulty >= 3) {
                    for (let i = 0; i < 8; i++) {
                        const newProjectile = new EnemyProjectile(this.game, 400, (i * (Math.PI / 4) + (Math.PI / 8)), 10, "#ff0000", 60, 10 * this.getDamageMultiplier());
                        newProjectile.x = this.x;
                        newProjectile.y = this.y;
                        
                        this.game.level!.addActor(newProjectile);
                    }
                }
            }

            if (this.difficulty >= 4) {
                for (let k = 0; k < 3; k++) {
                    let newLocation = {x: -9999, y: -9999};

                    while ((newLocation.x <= -500 || newLocation.x >= 500 || newLocation.y <= -500 || newLocation.y >= 500) || this.game.getSquaredDistance(newLocation, {x: player.x, y: player.y}) <= 300**2) {
                        newLocation = {
                            x: -500 + Math.random() * 1000,
                            y: -500 + Math.random() * 1000
                        }
                    }

                    for (let i = 0; i < 8; i++) {
                        const newProjectile = new EnemyProjectile(this.game, 100, (i * (Math.PI / 4)), 10, "#ff0000", 60, 10 * this.getDamageMultiplier());
                        newProjectile.x = newLocation.x;
                        newProjectile.y = newLocation.y;
                        
                        this.game.level!.addActor(newProjectile);
                    }
                }
            }
        }
    }
}


export class Commando extends BaseEnemy {
    destination: {x: number, y: number};
    nextShot: number = 0.05;
    nextWall: number = 2;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Commando", difficulty, boss, 150, "#9c17d9ff", 50, 0.99999999, 20);
        this.destination = {x: this.x, y: this.y};
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Handle movement
        const speed = [100, 110, 130, 160, 220][this.difficulty];

        if (this.game.getSquaredDistance({x: this.x, y: this.y}, this.destination) <= 2500) {
            this.destination = {
                x: -400 + (Math.random() * 800),
                y: -400 + (Math.random() * 800)
            }
        }

        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: this.destination.x, y: this.destination.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        // Handle Firing.
        this.nextShot -= deltaTime;

        if (this.nextShot <= 0) {
            this.nextShot = 0.02;

            let pAngle = this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y });
            const newProjectile = new EnemyProjectile(this.game, 400, pAngle, 10, "#ff0000", 60, 2 * this.getDamageMultiplier());
            newProjectile.x = this.x;
            newProjectile.y = this.y;
            
            this.game.level!.addActor(newProjectile);

            if (this.difficulty >= 3) {
                pAngle += Math.PI;
                const newProjectile = new EnemyProjectile(this.game, 150, pAngle, 10, "#ff0000", 60, 2 * this.getDamageMultiplier());
                newProjectile.x = this.x;
                newProjectile.y = this.y;
                
                this.game.level!.addActor(newProjectile);
            }
        }

        // Handle Walls
        this.nextWall -= deltaTime;

        if (this.nextWall <= 0 && this.difficulty >= 1) {
            let didWalls = false;
            this.nextWall = (this.difficulty >= 4 ? 7 : 10)

            if (Math.random() <= 0.5 || this.difficulty >= 2) {
                didWalls = true;

                for (const data of [{pos: -510, angle: 0}, {pos: 510, angle: Math.PI}]) {
                    for (let adjustment = -510; adjustment <= 510; adjustment += 20) {
                        const newProjectile = new EnemyProjectile(this.game, 100, data.angle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                        newProjectile.x = data.pos;
                        newProjectile.y = adjustment;
                        
                        this.game.level!.addActor(newProjectile);
                    }
                }
            }

            if (!didWalls || this.difficulty >= 2) {
                for (const data of [{pos: -510, angle: Math.PI / 2}, {pos: 510, angle: Math.PI * 3/2}]) {
                    for (let adjustment = -510; adjustment <= 510; adjustment += 20) {
                        const newProjectile = new EnemyProjectile(this.game, 100, data.angle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                        newProjectile.y = data.pos;
                        newProjectile.x = adjustment;
                        
                        this.game.level!.addActor(newProjectile);
                    }
                }
            }
        }
    }
}


// Boss Set #4
export class Feral extends BaseEnemy {
    destination: {x: number, y: number} = {x: 550, y: 0};
    hasFired: boolean = false;
    hasFired2: boolean = false;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Feral", difficulty, boss, 180, "#954624ff", 100, 1, 30);
        this.randomiseDestination();
    }

    private randomiseDestination() {
        const targetPosition = {x: -600, y: -600};

        if (Math.random() <= 0.5) {
            this.y = 600
            if (Math.random() <= 0.5) {
                targetPosition.y = 600;
                this.y = -600
            }

            targetPosition.x = -600 + (Math.random() * 1200);
            this.x = targetPosition.x * -1;
        } else {
            this.x = 600
            if (Math.random() <= 0.5) {
                targetPosition.x = 600;
                this.x = -600
            }

            targetPosition.y = -600 + (Math.random() * 1200);
            this.y = targetPosition.y * -1;
        }

        this.destination = targetPosition;
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Handle movement
        const speed = [300, 320, 350, 400, 500][this.difficulty];

        if (this.game.getSquaredDistance({x: this.x, y: this.y}, this.destination) <= 2500) {
            this.randomiseDestination();

            this.hasFired = false;
            this.hasFired2 = false;
        }

        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: this.destination.x, y: this.destination.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        // Shoot Rings
        if (!this.hasFired && (Math.abs(this.y - player.y) <= 50 || Math.abs(this.x - player.x) <= 50) && (this.x >= -500 && this.y >= -500 && this.x <= 500 && this.y <= 500)) {
            this.hasFired = true;

            if (this.difficulty >= 4) {
                for (let i = 0; i < 16; i++) {
                    const newProjectile = new EnemyProjectile(this.game, 450, (i * (Math.PI / 8)), 10, "#ff0000", 60, 11 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }

                for (let i = 0; i < 16; i++) {
                    const newProjectile = new EnemyProjectile(this.game, 120, (i * (Math.PI / 8)), 10, "#ff0000", 60, 11 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            } else {
                for (let i = 0; i < 8; i++) {
                    const newProjectile = new EnemyProjectile(this.game, (this.difficulty == 0 ? 300 : 400), (i * (Math.PI / 4)), 10, "#ff0000", 60, 11 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }

                if (this.difficulty >= 3) {
                    for (let i = 0; i < 8; i++) {
                        const newProjectile = new EnemyProjectile(this.game, 120, (i * (Math.PI / 4)), 10, "#ff0000", 60, 11 * this.getDamageMultiplier());
                        newProjectile.x = this.x;
                        newProjectile.y = this.y;
                        
                        this.game.level!.addActor(newProjectile);
                    }
                }
            }
        }

        // Shoot Center Ring
        if (this.difficulty >= 2 && !this.hasFired2 && (Math.abs(this.y) <= 20 || Math.abs(this.x) <= 20) && (this.x >= -500 && this.y >= -500 && this.x <= 500 && this.y <= 500)) {
            this.hasFired2 = true;

            if (this.difficulty >= 4) {
                this.hasFired = false;
            }

            for (let i = 0; i < 16; i++) {
                const newProjectile = new EnemyProjectile(this.game, 120, (i * (Math.PI / 8)), 10, "#ff0000", 60, 11 * this.getDamageMultiplier());
                newProjectile.x = this.x;
                newProjectile.y = this.y;
                
                this.game.level!.addActor(newProjectile);
            }
        }
    }
}


export class Unstable extends BaseEnemy {
    nextShot: number = 0.1;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Unstable", difficulty, boss, 250, "#23743cff", 60, 0.9999999999, 40);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        let speed = [50, 80, 110, 140, 200][this.difficulty];

        if (this.difficulty >= 1) {
            speed *= 1 + 2 *(1 - (this.health / this.maxHealth));
        }

        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        // Firing
        this.nextShot -= deltaTime;

        if (this.nextShot <= 0) {
            this.nextShot = 0.1;

            for (let i = 0; i < [1, 1, 2, 2, 3][this.difficulty]; i++) {
                const pAngle = Math.random() * (Math.PI * 2);

                const newProjectile = new EnemyProjectile(this.game, 120 + (Math.random() * (this.difficulty >= 3 ? 300 : 200)), pAngle, 10, "#ff0000", 60, 8 * this.getDamageMultiplier());
                newProjectile.x = this.x;
                newProjectile.y = this.y;
                
                this.game.level!.addActor(newProjectile);
            }
        }
    }
}


export class Amalgamation extends BaseEnemy {
    nextRing: number = 1;

    nextWall: number = 3;
    wallFlip: number = 0;

    auraCircle: Graphics;
    auraAmount: number = 0;

    nextTeleport: number = 40;

    nextShot: number = 0.05;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Amalgamation", difficulty, boss, 200, "#4b574fff", 100, 1, 50);

        this.auraCircle = new Graphics().circle(0, 0, this.auraAmount).fill("#10e3ffff");
        this.auraCircle.zIndex = -1;
        this.addChild(this.auraCircle);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Movement
        let speed = [140, 150, 160, 200, 250][this.difficulty];

        if (this.difficulty >= 3) {
            speed *= 1 + 2 * (1 - (this.health / this.maxHealth));
        }

        const movementVector = this.game.angleToVector(this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y }), speed);

        this.x += movementVector.x * deltaTime;
        this.y += movementVector.y * deltaTime;

        // Rings
        this.nextRing -= deltaTime;

        if (this.nextRing <= 0) {
            this.nextRing = 0.7;

            for (let i = 0; i < (this.difficulty >= 4 ? 16 : 8); i++) {
                const newProjectile = new EnemyProjectile(this.game, 400, (i * (Math.PI / (this.difficulty >= 4 ? 8 : 4))), 10, "#ff0000", 60, 8 * this.getDamageMultiplier());
                newProjectile.x = this.x;
                newProjectile.y = this.y;
                
                this.game.level!.addActor(newProjectile);
            }

            // Feral Ring
            if (this.difficulty >= 3) {
                for (let i = 0; i < (this.difficulty >= 4 ? 16 : 8); i++) {
                    const newProjectile = new EnemyProjectile(this.game, 150, (i * (Math.PI / (this.difficulty >= 4 ? 8 : 4))), 10, "#ff0000", 60, 8 * this.getDamageMultiplier());
                    newProjectile.x = this.x;
                    newProjectile.y = this.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            }
        }

        // Walls
        this.nextWall -= deltaTime;

        if (this.nextWall <= 0 && this.difficulty >= 1) {
            this.nextWall = 6;

            if (this.difficulty >= 4) {
                if (this.wallFlip >= 2) {
                    this.nextWall = 0.5;
                    this.wallFlip = 0;
                } else {
                    this.wallFlip++;
                }
            }

            const targetPosition = {x: -510, y: -510};
            let shotAngle = 0;

            if (Math.random() <= 0.5) {
                shotAngle = Math.PI / 2;
                if (Math.random() <= 0.5) {
                    targetPosition.y = 510;
                    shotAngle = 3 * Math.PI / 2;
                }
                
                for (let i = -500; i <= 500; i += 20) {
                    const newProjectile = new EnemyProjectile(this.game, 200, shotAngle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                    newProjectile.x = i;
                    newProjectile.y = targetPosition.y;
                    
                    this.game.level!.addActor(newProjectile);
                }
            } else {
                if (Math.random() <= 0.5) {
                    targetPosition.x = 510;
                    shotAngle = Math.PI;
                }

                targetPosition.y = -500 + (Math.random() * 1040);

                for (let i = -500; i <= 500; i += 20) {
                    const newProjectile = new EnemyProjectile(this.game, 200, shotAngle, 10, "#ff0000", 60, 5 * this.getDamageMultiplier());
                    newProjectile.x = targetPosition.x;
                    newProjectile.y = i;
                    
                    this.game.level!.addActor(newProjectile);
                }
            }
        }

        // Station Aura
        if (this.difficulty >= 1) {
            this.auraAmount += [6, 6, 6, 6, 8][this.difficulty] * deltaTime * 10;
            this.auraCircle.clear().circle(0, 0, this.auraAmount).fill("#10e3ffff");

            if (this.game.getDistance({x: this.x, y: this.y}, {x: player.x, y: player.y}) <= this.auraAmount) {
                this.playerObject?.takeDamage(20 * deltaTime * this.getDamageMultiplier());
            }
        }

        // Commando Gatling.
        this.nextShot -= deltaTime;

        if (this.nextShot <= 0 && this.difficulty >= 2) {
            this.nextShot = 0.02;

            let pAngle = this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y });
            const newProjectile = new EnemyProjectile(this.game, 400, pAngle, 10, "#ff0000", 60, 2 * this.getDamageMultiplier());
            newProjectile.x = this.x;
            newProjectile.y = this.y;
            
            this.game.level!.addActor(newProjectile);

            if (this.difficulty >= 4) {
                pAngle += Math.PI;
                const newProjectile = new EnemyProjectile(this.game, 150, pAngle, 10, "#ff0000", 60, 2 * this.getDamageMultiplier());
                newProjectile.x = this.x;
                newProjectile.y = this.y;
                
                this.game.level!.addActor(newProjectile);
            }
        }
    }

    takeDamage(damage: number, angle: number, knockback: number): void {
        super.takeDamage(damage, angle, knockback);

        this.auraAmount = Math.max(0, this.auraAmount - damage * 8);

        if (this.health <= 0) {
            return;
        }

        this.nextTeleport -= damage;

        if (this.nextTeleport <= 0 && this.difficulty >= 2) {
            this.nextTeleport = (this.difficulty >= 4 ? 25 : 40);

            let newLocation = {x: -9999, y: -9999};
            const player = this.game.level!.getActorOfClass(PlayerCharacter)!;

            while ((newLocation.x <= -500 || newLocation.x >= 500 || newLocation.y <= -500 || newLocation.y >= 500) || this.game.getSquaredDistance(newLocation, {x: player.x, y: player.y}) <= 300**2) {
                newLocation = {
                    x: -500 + Math.random() * 1000,
                    y: -500 + Math.random() * 1000
                }
            }

            this.x = newLocation.x;
            this.y = newLocation.y;
        }
    }
}


export class InfinityBoss extends BaseEnemy {
    currentAttack: "None" | "Field" | "Cone" | "Ring" = "None";
    nextAttack: number = 0;
    attackDelay: number = 1;
    nextShot: number = 0;

    ringRotation: number = 0;

    constructor(game: Game, x: number, y: number, difficulty: number, boss: boolean) {
        super(game, x, y, "Infinity", difficulty, boss, 500, "#fcfcfcff", 250, 1, 100);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.health <= 0 && this.boss) {
            return;
        }

        const player = this.game.level!.getActorOfClass(PlayerCharacter);

        if (player === undefined) {
            return;
        }

        // Handle Changing Attacks
        this.nextAttack -= deltaTime;

        if (this.nextAttack <= 0) {
            this.currentAttack = "None";
            this.attackDelay -= deltaTime;

            if (this.attackDelay <= 0) {
                this.nextAttack = (3 + Math.random() * 5) * (this.difficulty >= 4 ? 0.25 : 1);
                this.attackDelay = (this.difficulty >= 4 ? 0 : 2);
                this.nextShot = 0;

                const chosenAttack = Math.random();

                if (chosenAttack >= 0.67 && this.difficulty >= 2) {
                    this.currentAttack = "Cone";
                } else if ((chosenAttack >= 0.34 && this.difficulty >= 2) || (chosenAttack >= 0.5 && this.difficulty >= 1)) {
                    this.currentAttack = "Ring";
                } else {
                    this.currentAttack = "Field";
                }
            }
        }

        // Handle Attacks
        const baseProjectileSpeed = [200, 250, 300, 400, 550][this.difficulty]
        this.nextShot -= deltaTime;

        this.ringRotation += Math.PI * deltaTime * 0.8;

        if (this.ringRotation > (Math.PI * 2)) {
            this.ringRotation = 0;
        }

        if (this.nextShot <= 0) {
            switch (this.currentAttack) {
                case "None":
                    break;
                
                case "Field":
                    this.fieldAttack(baseProjectileSpeed);
                    break;
                
                case "Cone":
                    this.coneAttack(baseProjectileSpeed, player);
                    break;
                
                case "Ring":
                    this.ringAttack(baseProjectileSpeed);
                    break;
            }
        }
    }

    private fieldAttack(baseProjectileSpeed: number) {
        this.nextShot = 0.2 * (this.difficulty >= 3 ? 0.5 : 1);

        const targetPosition = {x: -510, y: -510};
        let shotAngle = 0;

        if (Math.random() <= 0.5) {
            shotAngle = Math.PI / 2;
            if (Math.random() <= 0.5) {
                targetPosition.y = 510;
                shotAngle = 3 * Math.PI / 2;
            }

            targetPosition.x = -500 + (Math.random() * 1040);
        } else {
            if (Math.random() <= 0.5) {
                targetPosition.x = 510;
                shotAngle = Math.PI;
            }

            targetPosition.y = -500 + (Math.random() * 1040);
        }

        const newProjectile = new EnemyProjectile(this.game, baseProjectileSpeed, shotAngle, 10, "#ff0000", 60, 12 * this.getDamageMultiplier());
        newProjectile.x = targetPosition.x;
        newProjectile.y = targetPosition.y;
        
        this.game.level!.addActor(newProjectile);
    }

    private coneAttack(baseProjectileSpeed: number, player: PlayerCharacter) {
        this.nextShot = 0.2;

        const pAngle = this.game.getAngle({ x: this.x, y: this.y }, { x: player.x, y: player.y });

        for (const angleAdjustment of [0, Math.PI / 12, Math.PI / 6, -Math.PI / 12, -Math.PI / 6]) {
            const newProjectile2 = new EnemyProjectile(this.game, baseProjectileSpeed * 1.5, pAngle + angleAdjustment, 10, "#ff0000", 60, 10 * this.getDamageMultiplier());
            newProjectile2.x = this.x;
            newProjectile2.y = this.y;
            
            this.game.level!.addActor(newProjectile2);
        }
    }

    private ringAttack(baseProjectileSpeed: number) {
        this.nextShot = 0.2;

        for (let i = 0; i < 16; i++) {
            const newProjectile = new EnemyProjectile(this.game, baseProjectileSpeed * 1.2, (i * (Math.PI / 8) + this.ringRotation), 10, "#ff0000", 60, 8 * this.getDamageMultiplier());
            newProjectile.x = this.x;
            newProjectile.y = this.y;
            
            this.game.level!.addActor(newProjectile);
        }
    }
}