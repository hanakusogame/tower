import { MainScene } from "./MainScene";
import { UnitPrameter } from "./Parameter";
export class UnitInfo extends g.FilledRect {
	public labelName: g.Label;
	public labelPrice: g.Label;
	public labelAttack: g.Label;
	public labelArea: g.Label;
	public labelSpeed: g.Label;
	public labelTime: g.Label;
	public setPram: (pram: UnitPrameter) => void;

	constructor(scene: MainScene) {
		super({
			scene: scene,
			width: 90,
			height: 130,
			x: 545,
			y: 210,
			cssColor: "#E0FFFF",
		});

		//ラベルをアペンドする
		const setLabel = (text: string, x: number, y: number, e: g.E = this): g.Label => {
			const label = new g.Label({
				scene: scene,
				font: scene.textFont,
				fontSize: 16,
				text: text,
				x: x,
				y: y,
			});
			e.append(label);
			return label;
		};

		this.labelName = setLabel("名称", 5, 0);
		this.labelPrice = setLabel("0pt", 20, 20);

		const pramE = new g.E({
			scene: scene,
		});
		this.append(pramE);

		setLabel("攻撃", 5, 40, pramE);
		this.labelAttack = setLabel("0", 50, 40, pramE);
		setLabel("射程", 5, 60, pramE);
		this.labelArea = setLabel("0", 50, 60, pramE);
		setLabel("速度", 5, 80, pramE);
		this.labelSpeed = setLabel("0", 50, 80, pramE);
		setLabel("間隔", 5, 100, pramE);
		this.labelTime = setLabel("0", 50, 100, pramE);

		this.setPram = (pram) => {
			const setLabel = (label: g.Label, str: string): void => {
				label.text = str;
				label.invalidate();
			};

			if (pram.id === 0 || pram.id === 5 || pram.id === 6) {
				pramE.hide();
			} else {
				pramE.show();
			}

			setLabel(this.labelName, pram.name);
			setLabel(this.labelPrice, "" + pram.price + "pt");
			setLabel(this.labelAttack, "" + pram.attack);
			setLabel(this.labelArea, "" + pram.area);
			setLabel(this.labelSpeed, "" + pram.speed);
			setLabel(this.labelTime, "" + pram.time);

			if (pram.id === 5) {
				setLabel(this.labelPrice, "半額買取");
			}
		};
	}
}
