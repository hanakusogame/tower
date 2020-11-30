import tl = require("@akashic-extension/akashic-timeline");
import { MainScene } from "./MainScene";
//タワークラス
export class Tower extends g.FrameSprite {
	public setDamage: (num: number) => void;
	public init: () => void;
	public life: number = 100;

	constructor(scene: MainScene) {
		super({
			scene: scene,
			src: scene.assets.tower as g.ImageAsset,
			width: 150,
			height: 180,
			x: 400,
			y: 360,
			frames: [0, 1],
		});

		const timeline = new tl.Timeline(scene);

		//残りのライフの表示用
		const barSize = 100;
		const barOut = new g.FilledRect({
			scene: scene,
			x: (this.width - barSize) / 2,
			y: 155,
			width: barSize,
			height: 20,
			cssColor: "blue",
		});
		this.append(barOut);

		const barIn = new g.FilledRect({
			scene: scene,
			x: 3,
			y: 3,
			width: barSize - 6,
			height: 20 - 6,
			cssColor: "black",
		});
		barOut.append(barIn);

		const bar = new g.FilledRect({
			scene: scene,
			width: barSize - 6,
			height: 20 - 6,
			anchorX: 0,
			anchorY: 0,
			cssColor: "yellow",
		});
		barIn.append(bar);

		//タワーのライフ表示
		const label = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 24,
			text: "100",
			x: 20,
			y: 150,
		});
		this.append(label);

		//タワーにダメージを与える
		this.setDamage = (num: number) => {
			this.life -= num;
			label.text = "" + this.life;
			label.invalidate();
			this.frameNumber = 1;
			this.angle = 5;
			this.modified();

			bar.scaleX = this.life / 100;
			bar.modified();

			if (this.life > 0) {
				setTimeout(() => {
					this.frameNumber = 0;
					this.angle = 0;
					this.modified();
				}, 200);
			} else {
				timeline.create(this).moveY(360, 1000);
			}
		};

		this.init = () => {
			this.life = 100;

			this.y = 360;
			this.frameNumber = 0;
			this.angle = 0;
			this.modified();
			this.modified();
			timeline.create(this).moveY(180, 500);

			label.text = "" + this.life;
			label.invalidate();

			bar.scaleX = 1;
			bar.modified();
		};
	}
}
