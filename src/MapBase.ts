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
	public mapSize = 300 / 7;

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
					width: this.mapSize - 2,
					height: this.mapSize - 2,
					x: this.mapSize * x,
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
					setUnit(x, y);
				});
			}
		}

		//ユニット設置
		const setUnit = (x: number, y: number): void => {
			const map = this.maps[y][x];
			if (this.unitNum !== 5) {
				//すでに設置されている場合
				if (this.myMatrix[y][x] !== 0) {
					//情報表示
					return;
				}

				//仮設置
				const bkNum = this.myMatrix[y][x];
				const price = mainGame.baseUnit.prams[this.unitNum].price;
				if (price > scene.score) return;
				this.myMatrix[y][x] = 1;

				//ルートが通るかどうか
				const path = mainGame.baseEnemy.setPath(this.myMatrix);
				if (path) {
					mainPath = path;
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
		};

		//初期化
		this.init = () => {
			//ユニットを全て消す
			for (let y = 0; y < this.mapH; y++) {
				for (let x = 0; x < this.mapH; x++) {
					this.myMatrix[y][x] = 0;
					this.maps[y][x].unit?.destroy();
					this.maps[y][x].unit = null;
				}
			}

			//壁を配置
			for (let i = 0; i < 5; i++) {
				const x = scene.random.get(0, this.mapW - 1);
				const y = scene.random.get(0, this.mapH - 1);
				setUnit(x, y);
			}
		};
	}
}
