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
	public mapW = 7; //行
	public mapH = 5; //列
	public mapSize = 450 / 7;

	constructor(pram: g.EParameterObject, mainGame: MainGame) {
		super(pram);
		const scene = this.scene as MainScene;
		this.maps = [];

		this.scale(300 / this.mapH / this.mapSize);
		this.modified();

		this.myMatrix = [];
		for (let y = 0; y < this.mapH; y++) {
			this.myMatrix[y] = [];
			for (let x = 0; x < this.mapW; x++) {
				this.myMatrix[y].push(0);
			}
		}

		let mainPath: number[][] = []; //出撃地点からタワーまでのパス

		//経路の描画
		const showPath: () => void = () => {
			mainPath.forEach((pos) => {
				const x = pos[0];
				const y = pos[1];
				this.maps[y][x].cssColor = "yellow";
				this.maps[y][x].modified();
			});
		};
		this.showPath = showPath;

		//マップ表示
		const showMap: () => void = () => {
			for (let x = 0; x < this.mapW; x++) {
				for (let y = 0; y < this.mapH; y++) {
					this.maps[y][x].cssColor = this.maps[y][x].tag;
					this.maps[y][x].modified();
				}
			}
		};
		this.showMap = showMap;

		// マップ
		for (let y = 0; y < this.mapH; y++) {
			this.maps[y] = [];
			for (let x = 0; x < this.mapW; x++) {
				const color = (x + y) % 2 ? "white" : "#E0E0E0";
				const map = new Map({
					scene: scene,
					width: this.mapSize - 3,
					height: this.mapSize - 3,
					x: this.mapSize * x + y * 5,
					y: this.mapSize * y,
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
					if (!scene.isStart) return;
					if (this.unitNum !== 5) {
						//すでに設置されている場合
						if (this.myMatrix[y][x] !== 0) {
							//情報表示
							mainGame.showUnitInfo(map, true);
						} else {
							//購入
							const price = mainGame.baseUnit.prams[this.unitNum].price;
							if (price <= scene.score && setUnit(x, y)) {
								scene.addScore(-price);
								scene.playSound("se_move");
							}
						}
					} else {
						//売却
						if (!this.maps[y][x].unit) return;
						const price = this.maps[y][x].unit.uPram.price;
						if (removeUnit(x, y)) {
							scene.addScore(price / 2);
							scene.playSound("se_coin");
						}
					}
				});
			}
		}

		//ユニット破棄
		const removeUnit = (x: number, y: number): boolean => {
			const map = this.maps[y][x];
			if (this.myMatrix[y][x] === 0) return false; //無駄？

			//情報表示
			mainGame.showUnitInfo(map, false);

			this.myMatrix[y][x] = 0;
			map.unit.destroy();
			map.unit = null;
			showMap();
			showPath();
			return true;
		};

		//ユニット設置
		const setUnit = (x: number, y: number): boolean => {
			const map = this.maps[y][x];

			//すでに設置されている場合
			if (this.myMatrix[y][x] !== 0) {
				return false;
			}

			//仮設置
			const bkNum = this.myMatrix[y][x];
			this.myMatrix[y][x] = 1;

			//ルートが通るかどうか
			const path = mainGame.baseEnemy.setPath(this.myMatrix);
			if (path) {
				mainPath = path;
				//設置する
				mainGame.baseUnit.setUnit(this.maps, this.unitNum, x, y);
				mainGame.showUnitInfo(map, true);
				showMap();
				showPath();
			} else {
				this.myMatrix[y][x] = bkNum; //置けなかったら戻す
				return false;
			}

			return true;
		};

		//初期化
		this.init = () => {
			//ユニットを全て消す
			for (let y = 0; y < this.mapH; y++) {
				for (let x = 0; x < this.mapW; x++) {
					this.myMatrix[y][x] = 0;
					this.maps[y][x].unit?.destroy();
					this.maps[y][x].unit = null;
				}
			}

			//壁を配置
			this.unitNum = 0;
			for (let i = 0; i < 8; i++) {
				const x = scene.random.get(0, this.mapW - 1);
				const y = scene.random.get(0, this.mapH - 1);
				setUnit(x, y);
			}
		};
	}
}
