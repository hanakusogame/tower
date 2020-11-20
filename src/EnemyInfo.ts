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
			width: 180,
			height: 100,
			x: 450,
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

		this.labelName = setLabel("名称", 5, 5);
		this.labelPrice = setLabel("0pt", 20, 30);
		setLabel("HP", 90, 25);
		this.labelLife = setLabel("0", 140, 25);
		setLabel("速度", 90, 50);
		this.labelSpeed = setLabel("0", 140, 50);
		setLabel("攻撃", 90, 75);
		this.labelAttack = setLabel("0", 140, 75);

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
