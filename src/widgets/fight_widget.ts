import { Game, Widget, WidgetText } from "unreal-pixijs";
import { Player } from "../actors/persistant/player";
import { PlayerCharacter } from "../actors/player_character";
import { Graphics } from "pixi.js";
import { FightLevel } from "../levels/fight_level";
import { difficulties } from "../data/descriptions";
import { specialStats } from "../data/stats";

export class FightWidget extends Widget {
    playerReference: Player | undefined;
    playerObjectReference: PlayerCharacter | undefined;

    healthBar: Graphics;
    dashBar: Graphics;
    specialBar: Graphics;

    bossBars: Graphics[] = [];
    bossText: WidgetText[] = [];

    specialCards: Graphics[] = [];

    constructor(game: Game) {
        super(game, 0, 0, 0);

        // Player Statistics
        this.addChild(new Graphics().rect(0, 965, 200, 50).fill("#171717ff"));
        this.addChild(new Graphics().rect(5, 970, 190, 20).fill("rgba(97, 0, 0, 1)"));

        this.addChild(new Graphics().rect(800, 965, 200, 50).fill("#171717ff"));
        this.addChild(new Graphics().rect(805, 970, 190, 27.5).fill("#565656ff"));

        this.healthBar = new Graphics().rect(5, 970, 190, 20).fill("#11ff00ff");
        this.dashBar = new Graphics().rect(5, 990, 190, 5).fill("#003cffff");
        this.specialBar = new Graphics().rect(805, 970, 190, 27.5).fill("#fbff00ff");

        this.addChild(this.healthBar);
        this.addChild(this.dashBar);
        this.addChild(this.specialBar);

        // Boss Bar
        this.addChild(new Graphics().rect(10, 10, 980, 30).fill("#171717ff"));
    }

    onConstruct(): void {
        super.onConstruct();

        this.playerReference = this.game.getPersistantActorOfClass(Player);
        this.playerObjectReference = this.game.level!.getActorOfClass(PlayerCharacter);
        
        const bosses = (this.game.level! as FightLevel).bosses;
        for (const boss of bosses) {
            const bossIndex = bosses.indexOf(boss);
            const barSize = (boss.health / boss.maxHealth) * ((970 - ((2.5 / bosses.length) * (bosses.length - 1) * (bosses.length))) / bosses.length);
            this.addChild(new Graphics().rect(15 + (970 * bossIndex / bosses.length) + ((5 / bosses.length) * bossIndex), 15, barSize, 20).fill("#4e4e4eff"))
            
            const newBar = new Graphics()
            this.bossBars.push(newBar);

            this.addChild(newBar);

            const newText = new WidgetText(this.game, 15 + (970 * bossIndex / bosses.length) + ((5 / bosses.length) * bossIndex) + barSize / 2, 25, {
                anchor: "center",
                text: boss.name + ` (${difficulties[boss.difficulty]})`,
                colour: "#ffffff"
            }, 1);

            this.bossText.push(newText);
            this.game.level!.addWidget(newText);
        }

        this.game.adjustZIndexes();
    }

    protected onDeconstruct(): void {
        for (const text of this.bossText) {
            text.deconstructWidget();
        }

        super.onDeconstruct();
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        // Setting bars.
        if (this.playerReference !== undefined && this.playerObjectReference !== undefined) {
            const specialColour = (!this.playerObjectReference.usingSpecial ? "#fbff00ff" : "#d60000ff")

            this.healthBar.clear().rect(5, 970, 190 * (this.playerReference.health / 100), 20).fill("#11ff00ff");
            this.dashBar.clear().rect(5, 990, 190 * (this.playerObjectReference.dashBar / 100), 5).fill((this.playerObjectReference.dashBar >= 100 ? "#003cffff" : "#ff0000e8"));
            this.specialBar.clear().rect(805, 970, 190 * (this.playerReference.specialAmount / 100), 27.5).fill(specialColour);

            // Special Bars
            const maxCharges = specialStats[this.playerReference.equippedSpecial].maxCharges;
            let chargeBars = this.playerReference.chargedSpecials

            if (chargeBars >= maxCharges) {
                chargeBars -= 1;
                this.specialBar.clear().rect(805, 970, 190, 27.5).fill("#fdff8aff");
            }

            for (const card of this.specialCards) {
                if (this.specialCards.indexOf(card) >= chargeBars) {
                    this.removeChild(card)
                    this.specialCards = this.specialCards.filter((cCard) => cCard !== card);
                }
            }

            while (this.specialCards.length < chargeBars) {
                const newGraphic = new Graphics().rect(805 + (this.specialCards.length * 20), 950, 15, 15).fill("#fbff00ff");
                this.addChild(newGraphic);
                this.specialCards.push(newGraphic);
            }
        }

        // Updating boss bars.
        const bosses = (this.game.level! as FightLevel).bosses;
        for (const boss of bosses) {
            const bossIndex = bosses.indexOf(boss);
            this.bossBars[bossIndex].clear().rect(15 + (970 * bossIndex / bosses.length) + ((5 / bosses.length) * bossIndex), 15, (boss.health / boss.maxHealth) * ((970 - ((2.5 / bosses.length) * (bosses.length - 1) * (bosses.length))) / bosses.length), 20).fill("#b40000ff")
        }
    }
}