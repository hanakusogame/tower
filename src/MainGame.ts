//import tl = require("@akashic-extension/akashic-timeline");
//import { AStarFinder } from "astar-typescript";
import { Enemy } from "./Enemy";
import { EnemyBase } from "./EnemyBase";
import { EnemyInfo } from "./EnemyInfo";
import { MainScene } from "./MainScene";
//import { Map } from "./Map";
import { MapBase } from "./MapBase";
//import { UnitPrameter } from "./Parameter";
import { Tower } from "./Tower";
import { Unit } from "./Unit";
import { UnitBase } from "./UnitBase";
import { UnitInfo } from "./UnitInfo";
declare function require(x: string): any;

// メインのゲーム画面
export class MainGame extends g.E {
	public baseEnemy: EnemyBase;
	public baseUnit: UnitBase;
	public reset: () => void;
	public finish: () => void;
	public clear: (enemy: Enemy) => void;
	public setMode: (num: number) => void;
	public showUnitInfo: (unit: Unit, isArea: boolean) => void;

	constructor(scene: MainScene) {
		//const timeline = new tl.Timeline(scene);
		super({ scene: scene, x: 0, y: 0, width: 640, height: 360 });

		//枠
		const waku = new g.Sprite({
			scene: scene,
			src: scene.assets.waku,
			x: -3,
			y: 43,
		});
		this.append(waku);

		//マップとユニット表示用
		const base = new MapBase(
			{
				scene: scene,
				x: 30,
				y: 55,
			},
			this
		);
		this.append(base);

		const ePram = {
			scene: scene,
			x: base.x,
			y: base.y,
		};

		//タワー
		const tower = new Tower({
			scene: scene,
			src: scene.assets.enemy2 as g.ImageAsset,
			width: 100,
			height: 100,
			srcX: 300,
			srcY: 0,
			x: 400,
			y: 260,
		});

		//パラメーター表示用
		const unitInfo = new UnitInfo(scene);
		this.append(unitInfo);
		unitInfo.hide();

		const enemyInfo = new EnemyInfo(scene);
		this.append(enemyInfo);
		enemyInfo.hide();

		//ユニット表示用
		const baseUnit = new UnitBase(ePram);
		this.append(baseUnit);
		this.baseUnit = baseUnit;

		//敵表示用
		const baseEnemy = new EnemyBase(ePram, this, tower, enemyInfo, unitInfo);
		this.append(baseEnemy);
		this.baseEnemy = baseEnemy;
		baseEnemy.children = [];

		//ショット表示用
		const baseShot = new g.E(ePram);
		this.append(baseShot);
		Unit.baseShot = baseShot;

		this.append(tower);

		//ステージ数表示用
		this.append(
			new g.Sprite({
				scene: scene,
				src: scene.assets.score,
				srcY: 32,
				x: 150,
				y: 10,
			})
		);

		const labelStage = new g.Label({
			scene: scene,
			x: 270,
			y: 10,
			font: scene.numFont,
			fontSize: 28,
			text: "0",
		});
		this.append(labelStage);

		//ユニットの攻撃範囲表示用
		const sprArea = new g.Sprite({
			scene: scene,
			src: scene.assets.area,
			opacity: 0.3,
		});
		base.append(sprArea);
		sprArea.hide();

		//情報表示
		const showUnitInfo = (unit: Unit, isArea: boolean): void => {
			unitInfo.setPram(unit.uPram);
			unitInfo.show();
			enemyInfo.hide();

			if (!isArea) return;

			//射程範囲を表示
			const x = unit.x + unit.width / 2 - sprArea.width / 2;
			const y = unit.y + unit.height / 2 - sprArea.height / 2;
			sprArea.moveTo(x, y);
			sprArea.scale((unit.uPram.area * 2) / sprArea.width);
			sprArea.modified();
			sprArea.show();
		};
		this.showUnitInfo = showUnitInfo;

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
					text: baseUnit.prams[num].name,
					y: mapSize,
					textColor: "white",
				});
				btn.append(label);

				btn.pointDown.add(() => {
					base.unitNum = num;
					cursorUnit.x = btn.x - 3;
					cursorUnit.y = btn.y - 3;
					cursorUnit.modified();
					const pram = baseUnit.prams[num];

					unitInfo.setPram(pram);
					unitInfo.show();
					enemyInfo.hide();
				});
			}
		}

		// ステージクリア判定と処理
		this.clear = (enemy) => {
			//敵を倒した時
			if (enemy) {
				scene.addScore(enemy.ePram.price);
			}
			baseEnemy.enemyCnt--;

			//ステージクリア
			if (baseEnemy.enemyCnt === 0) {
				scene.setTimeout(() => {
					next();
				}, 5000);
			}

			//タワー陥落
			if (tower.life <= 0) {
				scene.addScore(-5000);
				tower.init();
			}
		};

		// 次のステージ
		let stage = 0;
		const next: () => void = () => {
			stage++;

			labelStage.text = "" + stage;
			labelStage.invalidate();

			baseEnemy.next(stage, base.maps);
			baseEnemy.setPath(base.myMatrix);

			base.showMap();
			base.showPath();
		};

		// 終了処理
		this.finish = () => {
			return;
		};

		// リセット
		this.reset = () => {
			stage = 0;
			scene.addScore(1000);
			tower.init();

			//マップのクリア
			base.init();
			next();
			return;
		};
	}
}
