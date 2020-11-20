//import tl = require("@akashic-extension/akashic-timeline");
import { AStarFinder } from "astar-typescript";
import { Enemy } from "./Enemy";
import { EnemyBase } from "./EnemyBase";
import { EnemyInfo } from "./EnemyInfo";
import { MainScene } from "./MainScene";
import { Map } from "./Map";
import { UnitPrameter } from "./Parameter";
import { Tower } from "./Tower";
import { Unit } from "./Unit";
import { UnitInfo } from "./UnitInfo";
declare function require(x: string): any;

// メインのゲーム画面
export class MainGame extends g.E {
	public reset: () => void;
	public finish: () => void;
	public clear: (enemy: Enemy) => void;
	public setMode: (num: number) => void;

	constructor(scene: MainScene) {
		//const timeline = new tl.Timeline(scene);
		super({ scene: scene, x: 0, y: 0, width: 640, height: 360 });

		const mapSize = 340 / 8;
		const mapW = 9; //行
		const mapH = 7; //列

		// csvファイルからパラメーターを読み込む
		// csvを読み込んでパラメーター配列作成
		const pramsUnit: UnitPrameter[] = [];
		let text = scene.assets.unit_csv as g.TextAsset;

		// 読み込んだCSVデータが文字列として渡される
		let tmp = text.data.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

		// 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
		for (var i = 1; i < tmp.length; ++i) {
			const row = tmp[i].split(",");
			pramsUnit.push({
				id: Number(row[0]),
				name: row[1],
				attack: Number(row[2]),
				speed: Number(row[3]),
				area: Number(row[4]),
				price: Number(row[5]),
			});
		}

		//枠
		const waku = new g.Sprite({
			scene: scene,
			src: scene.assets.waku,
			x: -3,
			y: 43,
		});
		this.append(waku);

		//マップとユニット表示用
		const base = new g.E({
			scene: scene,
			x: 30,
			y: 55,
		});
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

		const maps: Map[][] = [];

		//敵表示用
		const baseUnit = new g.E(ePram);
		this.append(baseUnit);

		//敵表示用
		const baseEnemy = new EnemyBase(ePram, this, tower, mapSize, enemyInfo, unitInfo, maps);
		this.append(baseEnemy);
		baseEnemy.children = [];

		//敵表示用
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

		//探索用配列
		const myMatrix = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
		];

		// マップ
		for (let y = 0; y < mapH; y++) {
			maps[y] = [];
			for (let x = 0; x < mapW; x++) {
				const color = (x + y) % 2 ? "white" : "#E0E0E0";
				const map = new Map({
					scene: scene,
					width: mapSize - 2,
					height: mapSize - 2,
					x: mapSize * x,
					y: mapSize * y,
					cssColor: color,
					touchable: true,
					opacity: 0.8,
				});
				map.tag = color;
				maps[y][x] = map;

				map.num = 0;
				base.append(map);

				//ユニット設置
				map.pointDown.add(() => {
					if (unitNum !== 5) {
						//すでに設置されている場合
						if (myMatrix[y][x] !== 0) {
							//情報表示
							showUnitInfo(map.unit, true);
							return;
						}

						//仮設置
						const bkNum = myMatrix[y][x];
						const price = pramsUnit[unitNum].price;
						if (price > scene.score) return;
						myMatrix[y][x] = 1;

						//ルートが通るかどうか
						if (setPath()) {
							//設置する
							setUnit(x, y);
							scene.addScore(-price);

							showUnitInfo(map.unit, true);
							showMap();
							showPath();
						} else {
							myMatrix[y][x] = bkNum; //置けなかったら戻す
						}
					} else {
						if (myMatrix[y][x] === 0) return;

						//情報表示
						showUnitInfo(map.unit, false);

						//売却
						const price = map.unit.uPram.price;
						myMatrix[y][x] = 0;
						map.unit.destroy();
						map.unit = null;
						scene.addScore(price / 2);
						showMap();
						showPath();
					}
				});
			}
		}

		//ユニットの攻撃範囲表示用
		const sprArea = new g.Sprite({
			scene: scene,
			src: scene.assets.area,
			opacity: 0.3,
		});
		base.append(sprArea);
		sprArea.hide();

		const showUnitInfo = (unit: Unit, isArea: boolean): void => {
			unitInfo.setPram(unit.uPram);
			unitInfo.show();
			enemyInfo.hide();

			if (!isArea) return;

			const x = unit.x + unit.width / 2 - sprArea.width / 2;
			const y = unit.y + unit.height / 2 - sprArea.height / 2;
			sprArea.moveTo(x, y);
			sprArea.scale((unit.uPram.area * 2) / sprArea.width);
			sprArea.modified();
			sprArea.show();
		};

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
		let unitNum = 0;
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
					text: pramsUnit[num].name,
					y: mapSize,
					textColor: "white",
				});
				btn.append(label);

				btn.pointDown.add(() => {
					unitNum = num;
					cursorUnit.x = btn.x - 3;
					cursorUnit.y = btn.y - 3;
					cursorUnit.modified();
					const pram = pramsUnit[num];

					unitInfo.setPram(pram);
					unitInfo.show();
					enemyInfo.hide();
				});
			}
		}

		//ユニット設置
		const setUnit: (x: number, y: number) => void = (x, y) => {
			const map = maps[y][x];
			const unit = new Unit(map, pramsUnit[unitNum]);
			baseUnit.append(unit);
			baseUnit.children.sort((a, b) => a.y - b.y);
			map.unit = unit;
		};

		//経路の探索
		const setPath: () => boolean = () => {
			let isPath = true; //全ての経路が塞がっていないか

			const aStarInstance = new AStarFinder({
				grid: {
					matrix: myMatrix,
				},
				diagonalAllowed: false,
			});

			//敵の経路を設定
			baseEnemy.children.forEach((entity) => {
				if (!isPath) return;
				const enemy = entity as Enemy;
				if (!enemy.setPath(aStarInstance)) {
					isPath = false;
				}
			});

			//塞がっていない場合経路を再設定
			if (isPath) {
				baseEnemy.children.forEach((entity) => {
					const enemy = entity as Enemy;
					enemy.path = enemy.newPath;
				});
			}

			return isPath;
		};

		//経路の描画
		const showPath: () => void = () => {
			const enemy = baseEnemy.children[0] as Enemy;
			enemy.path.forEach((pos) => {
				const x = pos[0];
				const y = pos[1];
				maps[y][x].cssColor = "yellow";
				maps[y][x].modified();
			});
		};

		//マップ表示
		const showMap: () => void = () => {
			for (let x = 0; x < mapW; x++) {
				for (let y = 0; y < mapH; y++) {
					maps[y][x].cssColor = maps[y][x].tag;
					maps[y][x].modified();
				}
			}
		};

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

			baseEnemy.next(stage);

			setPath();
			showMap();
			showPath();
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
			for (let y = 0; y < mapH; y++) {
				for (let x = 0; x < mapH; x++) {
					myMatrix[y][x] = 0;
					maps[y][x].unit?.destroy();
					maps[y][x].unit = null;
				}
			}

			next();

			return;
		};
	}
}
