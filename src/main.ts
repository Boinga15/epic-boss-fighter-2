import { Game } from "unreal-pixijs";
import { FightLevel } from "./levels/fight_level";
import { Player } from "./actors/persistant/player";

// A list of sound effects and music you plan on using in the game.
const sfxAssets = {}

// The actual game object. The first two values are the pixel width and height of the viewport.
const game = new Game(1000, 1000, sfxAssets);
game.beginGame();

// Creating the initial persistant actor.
game.addPersistantActor(new Player(game));

// The starter level. It is highly recommended that you start with a level that merely serves as a splash screen to ensure user interaction before playing any sound effects.
game.loadLevel(new FightLevel(game));