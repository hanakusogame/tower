import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";
//ユニット選択ボタン管理用
export class ButtonBase extends g.E {
	constructor(scene: MainScene, mainGame: MainGame) {
		super({
			scene: scene,
			scaleX: mainGame.base.scaleX,
			scaleY: mainGame.base.scaleY,
			x: 430,
			y:60
		});

		const mapSize = mainGame.base.mapSize; //仮

		//選択したユニット表示用カーソル
		const cursorUnit = new g.FilledRect({
			scene: scene,
			width: mapSize + 6,
			height: mapSize + 6,
			x: - 3,
			y: - 3,
			cssColor: "red",
		});
		this.append(cursorUnit);

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.SansSerif,
			size: 20,
			strokeColor: "black",
			fontColor:"white",
			strokeWidth: 6,
			fontWeight: g.FontWeight.Bold
		});

		//ユニット選択ボタン
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 3; x++) {
				const num = y * 3 + x;
				const btn = new g.E({
					scene: scene,
					width: mapSize,
					height: mapSize,
					x: 75 * x + (y * 5),
					y: 75 * y,
					touchable: true,
				});
				this.append(btn);

				//画像
				const size = 75;
				const sprBase = new g.FrameSprite({
					scene: scene,
					src: scene.assets.base as g.ImageAsset,
					width: size,
					height: size,
					x: (mapSize - size) / 2,
					y: mapSize - size,
					frames: [0, 1],
					frameNumber: num === 0 ? 0 : 1,
				});
				btn.append(sprBase);

				//画像
				const sprUnit = new g.FrameSprite({
					scene: scene,
					src: scene.assets.unit as g.ImageAsset,
					width: size,
					height: size,
					x: 0,
					y: -15,
					frames: [0, 1, 2, 3, 4],
					frameNumber: num,
				});
				sprBase.append(sprUnit);

				//名称
				let str = "" + mainGame.baseUnit.prams[num].price;
				if (num === 5) str = "売却";
				const label = new g.Label({
					scene: scene,
					font: font,
					fontSize: 20,
					text: str,
					y: mapSize - 30,
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

					scene.playSound("se_move");
				});
			}
		}
	}
}
