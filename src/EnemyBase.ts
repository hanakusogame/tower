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
	public init: () => void;
	constructor(pram: g.EParameterObject, mainGame: MainGame, tower: Tower, enemyInfo: EnemyInfo, unitInfo: UnitInfo) {
		super(pram);

		const scene = this.scene as MainScene;
		const timeline = new tl.Timeline(scene);

		//パラメーターをファイルから読み込む
		//敵の情報
		const pramsEnemy: EnemyPrameter[] = [];
		const text = scene.assets.enemy_csv as g.TextAsset;
		const tmp = text.data.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

		// 各行ごとにカンマで区切った文字列を要素とし連想配列を生成
		for (var i = 1; i < tmp.length; ++i) {
			const row = tmp[i].split(",");
			pramsEnemy.push({
				id: Number(row[0]),
				name: row[1],
				size: Number(row[2]),
				imageID: Number(row[3]),
				life: Number(row[4]),
				speed: Number(row[5]),
				attack: Number(row[6]),
				price: Number(row[7]),
			});
		}

		//敵
		const enemys: Enemy[] = [];
		const mapSize = 450 / 7;
		for (let i = 0; i < 25; i++) {
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

		//出す敵の順番と種類
		const enemyList: number[][][] = [];
		enemyList[0] = [[0, 0]];
		enemyList[1] = [
			[0, 0, 0, 0],
			[1, 1, 1],
			[2, 2, 2],
		];
		enemyList[4] = [[6]];
		enemyList[5] = [
			[1, 1, 1, 2, 2, 2, 0, 0, 0],
			[2, 2, 2, 3, 3, 3, 4],
			[0, 2, 3, 4, 5],
		];
		enemyList[8] = [[7]];
		enemyList[9] = [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[2, 2, 2, 3, 3, 3, 4, 4],
			[3, 3, 3, 3, 3, 3],
			[4, 5, 4, 5, 4],
		];
		enemyList[12] = [[8]];
		enemyList[13] = [
			[1, 1, 1, 2, 2, 2, 3],
			[2, 2, 2, 3, 3, 3, 4],
		];
		enemyList[16] = [[6, 7, 8]];

		let enemyID = 0; //どのリストを使うか

		let enemyNum = 0; //敵の数
		const nextEnemys: Enemy[] = [];
		//ネクストステージ
		this.next = (stage: number, maps: Map[][]) => {
			//敵の数
			this.enemyCnt = nextEnemys.length;

			//出撃する
			nextEnemys.forEach((enemy, i) => {
				//出撃
				timeline
					.create(enemy)
					.moveX(0, enemy.x * 10)
					.moveTo(maps[0][0].x, maps[0][0].y, 600 * i)
					.call(() => {
						this.append(enemy);
						enemy.isMove = true;
						enemy.move(maps);
					});
			});

			if (enemyList[stage]) {
				enemyID = stage;
			}

			const num = scene.random.get(0, enemyList[enemyID].length - 1);
			const list = enemyList[enemyID][num];

			//敵を作る
			nextEnemys.length = 0;
			for (let i = 0; i < list.length; i++) {
				const enemy = enemys[enemyNum % enemys.length];
				this.append(enemy);
				enemy.moveTo((list.length - i) * 30 + 100, -(enemy.height * 2));
				timeline.create(enemy).wait(1500).moveY(-enemy.height, 500);
				enemy.modified();
				enemy.px = 0;
				enemy.py = 0;
				enemyNum++;
				enemy.init(pramsEnemy[list[i]]);
				nextEnemys.unshift(enemy);
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

		//初期化
		this.init = () => {
			//子要素(敵)をすべて外す　逆順でないとうまくいかない
			for (var i = this.children.length - 1; i >= 0; i--) {
				const enemy = this.children[i] as Enemy;
				enemy.remove();
			}
			nextEnemys.length = 0;
			enemyID = 0;
		};
	}
}
