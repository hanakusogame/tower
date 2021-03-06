import { ButtonBase } from "./ButtonBase";
import { Enemy } from "./Enemy";
import { EnemyBase } from "./EnemyBase";
import { EnemyInfo } from "./EnemyInfo";
import { MainScene } from "./MainScene";
import { Map } from "./Map";
import { MapBase } from "./MapBase";
import { Tower } from "./Tower";
import { Unit } from "./Unit";
import { UnitBase } from "./UnitBase";
import { UnitInfo } from "./UnitInfo";
declare function require(x: string): any;

// メインのゲーム画面
export class MainGame extends g.E {
	public base: MapBase;
	public baseEnemy: EnemyBase;
	public baseUnit: UnitBase;
	public unitInfo: UnitInfo;
	public enemyInfo: EnemyInfo;
	public reset: () => void;
	public finish: () => void;
	public start: () => void;
	public clear: (enemy: Enemy) => void;
	public setMode: (num: number) => void;
	public showUnitInfo: (map: Map, isArea: boolean) => void;

	constructor(scene: MainScene) {
		//const timeline = new tl.Timeline(scene);
		super({ scene: scene, x: 0, y: 0, width: 640, height: 360 });

		//枠
		const waku = new g.Sprite({
			scene: scene,
			src: scene.assets.waku,
		});
		this.append(waku);

		//マップとユニット表示用
		const base = new MapBase(
			{
				scene: scene,
				x: 0,
				y: 55,
			},
			this
		);
		this.append(base);
		this.base = base;

		//タワー
		const tower = new Tower(scene);

		//パラメーター表示用
		const unitInfo = new UnitInfo(scene);
		this.append(unitInfo);
		unitInfo.hide();
		this.unitInfo = unitInfo;

		const enemyInfo = new EnemyInfo(scene);
		this.append(enemyInfo);
		enemyInfo.hide();
		this.enemyInfo = enemyInfo;

		const ePram = {
			scene: scene,
		};

		//ユニット表示用
		const baseUnit = new UnitBase(ePram);
		base.append(baseUnit);
		this.baseUnit = baseUnit;

		//敵表示用
		const baseEnemy = new EnemyBase(ePram, this, tower, enemyInfo, unitInfo);
		base.append(baseEnemy);
		this.baseEnemy = baseEnemy;
		baseEnemy.children = [];

		//ショット表示用
		const baseShot = new g.E(ePram);
		base.append(baseShot);
		Unit.baseShot = baseShot;

		//ユニット選択ボタン
		const buttonBase = new ButtonBase(scene, this);
		this.append(buttonBase);

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
		const showUnitInfo = (map: Map, isArea: boolean): void => {
			const unit = map.unit;
			unitInfo.setPram(unit.uPram);
			unitInfo.show();
			enemyInfo.hide();

			if (!isArea) return;

			//射程範囲を表示
			const x = map.x + unit.width / 2 - sprArea.width / 2;
			const y = map.y + unit.height / 2 - sprArea.height / 2;
			sprArea.moveTo(x, y);
			sprArea.scale((unit.area * 2) / sprArea.width);
			sprArea.modified();
			sprArea.show();
			setTimeout(() => sprArea.hide(), 1000);
		};
		this.showUnitInfo = showUnitInfo;

		// ステージクリア判定と処理
		this.clear = (enemy) => {
			//敵を倒した時
			if (enemy) {
				scene.addScore(enemy.ePram.price);
			}
			baseEnemy.enemyCnt--;

			if (tower.life <= 0) {
				//タワー陥落
				scene.addScore(-2000);
				this.start();
			} else if (baseEnemy.enemyCnt === 0) {
				//ステージクリア
				scene.setTimeout(() => {
					next(true);
				}, 2000);
			}
		};

		// 次のステージ
		let stage = 0;
		const next = (isNext: boolean): void => {
			if (isNext) stage++;

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

		//開始、タワー陥落でも使用
		this.start = () => {
			baseEnemy.init();
			next(false);

			setTimeout(() => {
				tower.init();
				next(true);
			}, 3000);
		};

		// リセット
		this.reset = () => {
			stage = 0;
			scene.addScore(1000);
			//マップのクリア
			base.init();
			this.start();
			return;
		};
	}
}
