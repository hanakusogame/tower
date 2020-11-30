import { Enemy } from "./Enemy";
import { Unit } from "./Unit";
// ショットクラス
export class Shot extends g.FilledRect {
	public num = 0;
	constructor(pram: g.FilledRectParameterObject, baseEnemy: g.E, unit: Unit) {
		super(pram);
		let distance = 0;
		const uPram = unit.uPram;
		this.update.add(() => {
			const x = uPram.speed * Math.cos(this.angle * (Math.PI / 180));
			const y = uPram.speed * Math.sin(this.angle * (Math.PI / 180));
			this.moveBy(x, y);
			this.modified();
			distance += uPram.speed;

			//敵との接触判定
			let isHit = false;
			baseEnemy.children.forEach((entity) => {
				const enemy = entity as Enemy;
				if (enemy.life <= 0) return;
				if (!enemy.isMove) return;
				if (g.Collision.intersectAreas(enemy, this)) {
					enemy.hit(uPram.attack);
					isHit = true;
				}
			});

			//敵に当たった場合と射程を外れた場合消す
			if (isHit || distance > unit.area) {
				this.destroy();
			}
		});
	}
}
