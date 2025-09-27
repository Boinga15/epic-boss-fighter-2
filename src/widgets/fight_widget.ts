import { Game, Widget } from "unreal-pixijs";
import { Player } from "../actors/persistant/player";
import { PlayerCharacter } from "../actors/player_character";
import { Graphics } from "pixi.js";

export class FightWidget extends Widget {
    playerReference: Player | undefined;
    playerObjectReference: PlayerCharacter | undefined;

    healthBar: Graphics;
    dashBar: Graphics;

    constructor(game: Game) {
        super(game, 0, 0, 0);

        this.addChild(new Graphics().rect(0, 970, 200, 50).fill("#171717ff"));
        this.addChild(new Graphics().rect(5, 970, 190, 20).fill("rgba(97, 0, 0, 1)"));

        this.healthBar = new Graphics().rect(5, 970, 190, 20).fill("#11ff00ff");
        this.dashBar = new Graphics().rect(5, 990, 190, 5).fill("#003cffff");

        this.addChild(this.healthBar);
        this.addChild(this.dashBar);
    }

    onConstruct(): void {
        super.onConstruct();

        this.playerReference = this.game.getPersistantActorOfClass(Player);
        this.playerObjectReference = this.game.level!.getActorOfClass(PlayerCharacter);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        // Setting bars.
        if (this.playerReference !== undefined) {
            this.healthBar.clear().rect(5, 970, 190 * (this.playerReference.health / 100), 20).fill("#11ff00ff");
        }

        if (this.playerObjectReference !== undefined) {
            this.dashBar.clear().rect(5, 990, 190 * (this.playerObjectReference.dashBar / 100), 5).fill((this.playerObjectReference.dashBar >= 100 ? "#003cffff" : "#ff0000e8"));
        }
    }
}