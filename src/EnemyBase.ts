import tl = require("@akashic-extension/akashic-timeline");
import { Enemy } from "./Enemy";
import { EnemyInfo } from "./EnemyInfo";
import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";
import { Map } from "./Map";
import { EnemyPrameter } from "./Parameter";
import { Tower } from "./Tower";
import { Unit } from "./Unit";
import { UnitInfo } from "./UnitInfo";

//敵管理クラス
export class EnemyBase extends g.E {
	public enemyCnt = 0;
	public next: (stage: number) => void;
	constructor(
		pram: g.EParameterObject,
		mainGame: MainGame,
		tower: Tower,
		mapSize: number,
		enemyInfo: EnemyInfo,
		unitInfo: UnitInfo,
		maps: Map[][]
	) {
		super(pram);

		const scene = this.scene as MainScene;
		const timeline = new tl.Timeline(scene);

		//パラメーターをファイルから読み込む
		//敵の情報
		const pramsEnemy: EnemyPrameter[] = [];
		const text = scene.assets.enemy_csv as g.TextAsset;
		const tmp = text.data.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

		// 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
		for (var i = 1; i < tmp.length; ++i) {
			const row = tmp[i].split(",");
			pramsEnemy.push({
				id: Number(row[0]),
				name: row[1],
				life: Number(row[2]),
				speed: Number(row[3]),
				attack: Number(row[4]),
				price: Number(row[5]),
			});
		}

		//敵
		const enemys: Enemy[] = [];
		for (let i = 0; i < 10; i++) {
			const enemy = new Enemy(
				{
					scene: scene,
					width: mapSize,
					height: mapSize,
					touchable: true,
				},
				mainGame,
				tower
			);
			enemys.push(enemy);

			enemy.pointUp.add(() => {
				enemyInfo.setPram(enemy.ePram);
				enemyInfo.show();
				unitInfo.hide();
			});
		}
		Unit.baseEnemy = this;

		//ネクストステージ
		this.next = (stage: number) => {
			this.enemyCnt = 9;
			if (stage % 4 === 0) {
				this.enemyCnt = 1;
			}
			enemys.forEach((enemy, i) => {
				if (this.enemyCnt < i) return;
				this.append(enemy);
				enemy.moveTo(maps[0][0].x, maps[0][0].y);
				enemy.modified();
				enemy.px = 0;
				enemy.py = 0;
				if (i !== 0) {
					enemy.isMove = true;
					let num = scene.random.get(0, 2);
					if (stage % 4 === 0) {
						num = 2 + Math.min(3, stage / 4);
					}
					timeline
						.create(enemy)
						.wait(300 * (enemys.length - 1 - i)) //逆から動かしているので注意(重ね順の関係)
						.call(() => {
							enemy.init(pramsEnemy[num]);
							enemy.move(maps);
						});
				} else {
					enemy.isMove = false;
					enemy.opacity = 0;
					enemy.touchable = false;
					enemy.modified();
				}
			});
		};
	}
}
