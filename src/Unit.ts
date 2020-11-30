import { Enemy } from "./Enemy";
import { MainScene } from "./MainScene";
import { Map } from "./Map";
import { UnitPrameter } from "./Parameter";
import { Shot } from "./Shot";

//ユニットクラス
export class Unit extends g.FilledRect {
	static baseEnemy: g.E;
	static colors = ["gray", "pink", "blue", "orange", "magenta"];
	static baseShot: g.E;
	public uPram: UnitPrameter;
	public area: number = 0;

	constructor(map: Map, uPram: UnitPrameter) {
		super({
			scene: g.game.scene(),
			x: map.x,
			y: map.y,
			width: map.width,
			height: map.height,
			cssColor: Unit.colors[uPram.id],
		});

		this.uPram = uPram;
		const scene = this.scene as MainScene;


		//射程範囲の半径
		this.area = (uPram.area / 10) * map.width;

		const size = 75;
		const sprBase = new g.Sprite({
			scene: this.scene,
			src: this.scene.assets.base as g.ImageAsset,
			width: size,
			height: size,
			x: (map.width - size) / 2,
			y: map.width - size,
			srcX: (uPram.id === 0 ? 0 : 1) * size,
		});
		this.append(sprBase);

		const sprUnit = new g.Sprite({
			scene: this.scene,
			src: this.scene.assets.unit as g.ImageAsset,
			width: size,
			height: size,
			x: (map.width - size) / 2,
			y: map.width - size - 15,
			srcX: uPram.id * size,
		});
		this.append(sprUnit);

		const shotPram = {
			scene: this.scene,
			x: this.x + (this.width - 20) / 2,
			y: this.y + (this.height - 8) / 2 - 15,
			width: 20,
			height: 8,
			cssColor: "cyan",
		};

		let cnt = 0;
		this.update.add(() => {
			if (!scene.isStart) return;
			if (uPram.id === 0) return; //壁

			//最も近い敵を取得
			let min = this.area;
			let enemy: Enemy = null;
			Unit.baseEnemy.children.forEach((entity) => {
				const e = entity as Enemy;
				if (!e.parent) return;
				if (!e.isMove) return;
				const distance = Math.sqrt(Math.pow(e.x - this.x, 2) + Math.pow(e.y - this.y, 2));
				if (distance < min) {
					min = distance;
					enemy = e;
				}
			});

			if (!enemy) return;

			//敵に向かう角度を取得
			const radian = Math.atan2(enemy.y - this.y, enemy.x - this.x);
			const degree = (radian * 180) / Math.PI;

			sprUnit.angle = degree;
			sprUnit.modified();

			if (cnt % uPram.time === 0) {
				const shot = new Shot(shotPram, Unit.baseEnemy, this);
				shot.angle = degree;
				Unit.baseShot.append(shot);
			}
			cnt++;
		});
	}
}
