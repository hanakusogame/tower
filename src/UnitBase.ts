import { Map } from "./Map";
import { UnitPrameter } from "./Parameter";
import { Unit } from "./Unit";

export class UnitBase extends g.E {
	public prams: UnitPrameter[];
	public setUnit: (maps: Map[][], unitNum: number, x: number, y: number) => void;
	constructor(pram: g.EParameterObject) {
		super(pram);

		// csvファイルからパラメーターを読み込む
		// csvを読み込んでパラメーター配列作成
		this.prams = [];
		let text = this.scene.assets.unit_csv as g.TextAsset;

		// 読み込んだCSVデータが文字列として渡される
		let tmp = text.data.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

		// 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
		for (var i = 1; i < tmp.length; ++i) {
			const row = tmp[i].split(",");
			this.prams.push({
				id: Number(row[0]),
				name: row[1],
				attack: Number(row[2]),
				speed: Number(row[3]),
				area: Number(row[4]),
				price: Number(row[5]),
			});
		}

		//ユニット設置
		this.setUnit = (maps, unitNum, x, y) => {
			const map = maps[y][x];
			const unit = new Unit(map, this.prams[unitNum]);
			this.append(unit);
			this.children.sort((a, b) => a.y - b.y);
			map.unit = unit;
		};
	}
}
