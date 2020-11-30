import { MainScene } from "./MainScene";
import { EnemyPrameter } from "./Parameter";
export class EnemyInfo extends g.FilledRect {
	public labelName: g.Label;
	public labelPrice: g.Label;
	public labelAttack: g.Label;
	public labelLife: g.Label;
	public labelSpeed: g.Label;
	public setPram: (pram: EnemyPrameter) => void;

	constructor(scene: MainScene) {
		super({
			scene: scene,
			width: 90,
			height: 130,
			x: 545,
			y: 210,
			cssColor: "white",
		});

		//ラベルをアペンドする
		const setLabel = (text: string, x: number, y: number): g.Label => {
			const label = new g.Label({
				scene: scene,
				font: scene.textFont,
				fontSize: 16,
				text: text,
				x: x,
				y: y,
			});
			this.append(label);
			return label;
		};

		this.labelName = setLabel("名称", 5, 0);
		this.labelPrice = setLabel("0pt", 20, 20);
		setLabel("HP", 2, 40);
		this.labelLife = setLabel("0", 40, 40);
		setLabel("速度", 2, 60);
		this.labelSpeed = setLabel("0", 40, 60);
		setLabel("攻撃", 2, 80);
		this.labelAttack = setLabel("0", 40, 80);

		this.setPram = (pram) => {
			const setLabel = (label: g.Label, str: string): void => {
				label.text = str;
				label.invalidate();
			};

			setLabel(this.labelName, pram.name);
			setLabel(this.labelPrice, "" + pram.price + "pt");
			setLabel(this.labelAttack, "" + pram.attack);
			setLabel(this.labelLife, "" + pram.life);
			setLabel(this.labelSpeed, "" + pram.speed);
		};
	}
}
