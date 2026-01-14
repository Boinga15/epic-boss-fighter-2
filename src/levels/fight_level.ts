import { Game, Level } from "unreal-pixijs";
import { PlayerCharacter } from "../actors/player_character";
import { FightWidget } from "../widgets/fight_widget";
import { BaseEnemy, Edge } from "../actors/enemy";
import { Player } from "../actors/persistant/player";

export class FightLevel extends Level {
    spawnX: number
    spawnY: number

    bosses: BaseEnemy[]

    timeMultiplier: number
    realDeltaTime: number = 0

    constructor(game: Game, playerX: number =-400, playerY: number = 0, bosses: BaseEnemy[] = []) {
        super(game);

        this.spawnX = playerX;
        this.spawnY = playerY;
        this.bosses = bosses
        this.timeMultiplier = 1.0;
    }

    onLoad(): void {
        super.onLoad();

        this.addActor(new PlayerCharacter(this.game, this.spawnX, this.spawnY));

        const newBoss = new  Edge(this.game, 0, 0, 1, true);
        this.bosses.push(newBoss);
        this.addActor(newBoss);

        this.addWidget(new FightWidget(this.game));
    }

    update (deltaTime: number) {
        this.realDeltaTime = deltaTime
        deltaTime *= this.timeMultiplier
        console.log(this.timeMultiplier)
        console.log(deltaTime)

        super.update(deltaTime);

        if (this.game.keys["KeyR"]) {
            this.game.removeAllPersistantActors();
            this.game.addPersistantActor(new Player(this.game));

            this.game.loadLevel(new FightLevel(this.game));
        }
    }
}