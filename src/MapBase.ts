import { Enemy } from "./Enemy";
import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";
//マップ管理クラス
import { Map } from "./Map";
export class MapBase extends g.E {
	public maps: Map[][];
	public myMatrix: number[][];
	public unitNum = 0;
	public init: () => void;
	public showPath: () => void;
	public showMap: () => void;

	constructor(pram: g.EParameterObject, mainGame: MainGame) {
		super(pram);

		const scene = this.scene as MainScene;

		this.maps = [];

		const mapSize = 340 / 8;
		const mapW = 9; //行
		const mapH = 7; //列

		//探索用配列
		this.myMatrix = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
		];

		this.init = () => {
			for (let y = 0; y < mapH; y++) {
				for (let x = 0; x < mapH; x++) {
					this.myMatrix[y][x] = 0;
					this.maps[y][x].unit?.destroy();
					this.maps[y][x].unit = null;
				}
			}
		};

		//経路の描画
		const showPath: () => void = () => {
			const enemy = mainGame.baseEnemy.children[0] as Enemy;
			enemy.path.forEach((pos) => {
				const x = pos[0];
				const y = pos[1];
				this.maps[y][x].cssColor = "yellow";
				this.maps[y][x].modified();
			});
		};
		this.showPath = showPath;

		//マップ表示
		const showMap: () => void = () => {
			for (let x = 0; x < mapW; x++) {
				for (let y = 0; y < mapH; y++) {
					this.maps[y][x].cssColor = this.maps[y][x].tag;
					this.maps[y][x].modified();
				}
			}
		};
		this.showMap = showMap;

		// マップ
		for (let y = 0; y < mapH; y++) {
			this.maps[y] = [];
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
				this.maps[y][x] = map;

				map.num = 0;
				this.append(map);

				//ユニット設置
				map.pointDown.add(() => {
					if (this.unitNum !== 5) {
						//すでに設置されている場合
						if (this.myMatrix[y][x] !== 0) {
							//情報表示
							//showUnitInfo(map.unit, true);
							return;
						}

						//仮設置
						const bkNum = this.myMatrix[y][x];
						const price = mainGame.baseUnit.prams[this.unitNum].price;
						if (price > scene.score) return;
						this.myMatrix[y][x] = 1;

						//ルートが通るかどうか
						if (mainGame.baseEnemy.setPath(this.myMatrix)) {
							//設置する
							mainGame.baseUnit.setUnit(this.maps, this.unitNum, x, y);
							scene.addScore(-price);

							mainGame.showUnitInfo(map.unit, true);
							showMap();
							showPath();
						} else {
							this.myMatrix[y][x] = bkNum; //置けなかったら戻す
						}
					} else {
						if (this.myMatrix[y][x] === 0) return;

						//情報表示
						mainGame.showUnitInfo(map.unit, false);

						//売却
						const price = map.unit.uPram.price;
						this.myMatrix[y][x] = 0;
						map.unit.destroy();
						map.unit = null;
						scene.addScore(price / 2);
						showMap();
						showPath();
					}
				});
			}
		}
	}
}
