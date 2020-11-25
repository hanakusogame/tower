import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";
//ユニット選択ボタン管理用
export class ButtonBase extends g.E {
	constructor(scene: MainScene, mainGame: MainGame) {
		super({
			scene:scene
		});

		const mapSize = 340 / 8; //仮

		//選択したユニット表示用カーソル
		const cursorUnit = new g.FilledRect({
			scene: scene,
			width: mapSize + 6,
			height: mapSize + 6,
			x: 450 - 3,
			y: 80 - 3,
			cssColor: "yellow",
		});
		this.append(cursorUnit);

		//ユニット選択ボタン
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 3; x++) {
				const num = y * 3 + x;
				const btn = new g.FilledRect({
					scene: scene,
					width: mapSize,
					height: mapSize,
					x: 450 + 65 * x,
					y: 80 + 65 * y,
					cssColor: "white",
					touchable: true,
				});
				this.append(btn);

				//画像
				const sprBase = new g.FrameSprite({
					scene: scene,
					src: scene.assets.base as g.ImageAsset,
					width: 50,
					height: 50,
					x: (mapSize - 50) / 2,
					y: mapSize - 50,
					frames: [0, 1],
					frameNumber: num === 0 ? 0 : 1,
				});
				btn.append(sprBase);

				//画像
				const sprUnit = new g.FrameSprite({
					scene: scene,
					src: scene.assets.unit as g.ImageAsset,
					width: 50,
					height: 50,
					x: 0,
					y: -10,
					frames: [0, 1, 2, 3, 4],
					frameNumber: num,
				});
				sprBase.append(sprUnit);

				//名称
				const label = new g.Label({
					scene: scene,
					font: scene.textFont,
					fontSize: 16,
					text: mainGame.baseUnit.prams[num].name,
					y: mapSize,
					textColor: "white",
				});
				btn.append(label);

				btn.pointDown.add(() => {
					mainGame.base.unitNum = num;
					cursorUnit.x = btn.x - 3;
					cursorUnit.y = btn.y - 3;
					cursorUnit.modified();
					const pram = mainGame.baseUnit.prams[num];

					mainGame.unitInfo.setPram(pram);
					mainGame.unitInfo.show();
					mainGame.enemyInfo.hide();
				});
			}
		}
	}
}
