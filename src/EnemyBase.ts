import tl = require("@akashic-extension/akashic-timeline");
import { AStarFinder } from "astar-typescript";
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
	public next: (stage: number, maps: Map[][]) => void;
	public setPath: (myMatrix: number[][]) => number[][];
	constructor(pram: g.EParameterObject, mainGame: MainGame, tower: Tower, enemyInfo: EnemyInfo, unitInfo: UnitInfo) {
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
		const mapSize = 340 / 8;
		for (let i = 0; i < 12; i++) {
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

		let enemyNum = 0;
		const nextEnemys: Enemy[] = [];
		//ネクストステージ
		this.next = (stage: number, maps: Map[][]) => {
			//出撃する
			nextEnemys.forEach((enemy) => {
				//出撃
				timeline
					.create(enemy)
					.wait(300 * i)
					.call(() => {
						enemy.isMove = true;
						enemy.move(maps);
					});
			});

			//敵の数
			this.enemyCnt = 4;
			if (stage % 4 === 0) {
				this.enemyCnt = 1;
			}

			//敵を作る
			for (let i = this.enemyCnt - 1; 0 <= i; i--) {
				const enemy = enemys[enemyNum % enemys.length];
				this.append(enemy);
				enemy.moveTo(i * 20, -40);
				enemy.modified();
				enemy.px = 0;
				enemy.py = 0;
				enemy.isMove = false;
				let num = scene.random.get(0, 2);
				if (stage % 4 === 0) {
					num = 2 + Math.min(3, stage / 4);
				}
				enemyNum++;
				enemy.init(pramsEnemy[num]);
				nextEnemys.push(enemy);
			}
		};

		//経路の探索
		this.setPath = (myMatrix: number[][]) => {
			let isPath = true; //全ての経路が塞がっていないか

			const aStarInstance = new AStarFinder({
				grid: {
					matrix: myMatrix,
				},
				diagonalAllowed: false,
			});

			//スタート地点からゴール地点までの経路を取得
			const arr = Enemy.getPath(aStarInstance, 0, 0);
			if (arr.length === 0) return null;

			//敵の経路を設定
			this.children.forEach((entity) => {
				if (!isPath) return;
				const enemy = entity as Enemy;
				if (!enemy.setPath(aStarInstance)) {
					isPath = false;
				}
			});

			//塞がっていない場合経路を再設定
			if (isPath) {
				this.children.forEach((entity) => {
					const enemy = entity as Enemy;
					enemy.path = enemy.newPath;
				});
				return arr;
			} else {
				return null;
			}
		};
	}
}
