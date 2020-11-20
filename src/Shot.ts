import { Enemy } from "./Enemy";
import { UnitPrameter } from "./Parameter";
// ショットクラス
export class Shot extends g.FilledRect {
	public num = 0;
	constructor(pram: g.FilledRectParameterObject, baseEnemy: g.E, uPram: UnitPrameter) {
		super(pram);
		let distance = 0;
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
				if (enemy.id === 0) return;
				if (enemy.life <= 0) return;
				if (g.Collision.intersectAreas(enemy, this)) {
					enemy.hit(uPram.attack);
					isHit = true;
				}
			});

			//敵に当たった場合と射程を外れた場合消す
			if (isHit || distance > uPram.area) {
				this.destroy();
			}
		});
	}
}