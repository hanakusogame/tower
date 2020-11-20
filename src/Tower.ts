import { MainScene } from "./MainScene";
//タワークラス
export class Tower extends g.Sprite {
	public setDamage: (num: number) => void;
	public init: () => void;
	public life: number = 100;

	constructor(pram: g.SpriteParameterObject) {
		super(pram);

		const scene: MainScene = this.scene as MainScene;

		//タワーのライフ表示
		const label = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 24,
			text: "100",
			x: 20,
			y: 70,
		});
		this.append(label);

		//タワーにダメージを与える
		this.setDamage = (num: number) => {
			this.life -= num;
			label.text = "" + this.life;
			label.invalidate();
		};

		this.init = () => {
			this.life = 100;
			label.text = "" + this.life;
			label.invalidate();
		};
	}
}
