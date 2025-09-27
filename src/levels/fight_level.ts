import { Actor, Game, Level } from "unreal-pixijs";
import { PlayerCharacter } from "../actors/player_character";
import { FightWidget } from "../widgets/fight_widget";

export class FightLevel extends Level {
    spawnX: number
    spawnY: number

    constructor(game: Game, playerX: number =-400, playerY: number = 0, bosses: Actor[] = []) {
        super(game);

        this.spawnX = playerX;
        this.spawnY = playerY;
    }

    onLoad(): void {
        super.onLoad();

        this.addActor(new PlayerCharacter(this.game, this.spawnX, this.spawnY));
        this.addWidget(new FightWidget(this.game));
    }

    update (deltaTime: number) {
        super.update(deltaTime);
    }
}