import { MainScene } from "./MainScene";
import { UnitPrameter } from "./Parameter";
export class UnitInfo extends g.FilledRect {
	public labelName: g.Label;
	public labelPrice: g.Label;
	public labelAttack: g.Label;
	public labelArea: g.Label;
	public labelSpeed: g.Label;
	public setPram: (pram: UnitPrameter) => void;

	constructor(scene: MainScene) {
		super({
			scene: scene,
			width: 180,
			height: 100,
			x: 450,
			y: 210,
			cssColor: "#E0FFFF",
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
		setLabel("攻撃", 90, 25);
		this.labelAttack = setLabel("0", 140, 25);
		setLabel("射程", 90, 50);
		this.labelArea = setLabel("0", 140, 50);
		setLabel("速度", 90, 75);
		this.labelSpeed = setLabel("0", 140, 75);

		this.setPram = (pram) => {
			const setLabel = (label: g.Label, str: string): void => {
				label.text = str;
				label.invalidate();
			};

			setLabel(this.labelName, pram.name);
			setLabel(this.labelPrice, "" + pram.price + "pt");
			setLabel(this.labelAttack, "" + pram.attack);
			setLabel(this.labelArea, "" + pram.area);
			setLabel(this.labelSpeed, "" + pram.speed);
		};
	}
}
