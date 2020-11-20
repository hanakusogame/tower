import tl = require("@akashic-extension/akashic-timeline");
import { AStarFinder } from "astar-typescript";
import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";
import { Map } from "./Map";
import { EnemyPrameter } from "./Parameter";
import { Tower } from "./Tower";

// 敵クラス
export class Enemy extends g.E {
	public num = 0;
	public ePram: EnemyPrameter;
	public newPath: number[][] = [];
	public path: number[][] = [];
	public px: number;
	public py: number;
	public isMove: boolean = true;
	public init: (ePram: EnemyPrameter) => void;
	public hit: (attack: number) => boolean;
	public move: (maps: Map[][]) => void;
	public setPath: (aStar: AStarFinder) => boolean;
	public life: number = 0;

	constructor(pram: g.EParameterObject, mainGame: MainGame, tower: Tower) {
		super(pram);
		const timeline = new tl.Timeline(pram.scene);
		const scene = this.scene as MainScene;

		//画像
		const sprImage = new g.FrameSprite({
			scene: scene,
			src: scene.assets.enemy as g.ImageAsset,
			x: (pram.width - 50) / 2,
			y: pram.height - 75 - 10,
			width: 50,
			height: 75,
			frames: [0, 1],
			interval: 500,
		});
		sprImage.start();

		const sprImage2 = new g.FrameSprite({
			scene: scene,
			src: scene.assets.enemy2 as g.ImageAsset,
			x: (pram.width - 100) / 2,
			y: pram.height - 100 - 10,
			width: 100,
			height: 100,
			frames: [0, 1],
			interval: 500,
		});
		sprImage2.start();

		//残りのライフの表示用
		const barOut = new g.FilledRect({
			scene: scene,
			x: (pram.width - 50) / 2,
			y: -15,
			width: 50,
			height: 10,
			cssColor: "blue",
		});
		this.append(barOut);

		const barIn = new g.FilledRect({
			scene: scene,
			x: 2,
			y: 2,
			width: 46,
			height: 6,
			cssColor: "black",
		});
		barOut.append(barIn);

		const bar = new g.FilledRect({
			scene: scene,
			width: 46,
			height: 6,
			anchorX: 0,
			anchorY: 0,
			cssColor: "yellow",
		});
		barIn.append(bar);

		//経路の取得
		const getPath: (aStar: AStarFinder, x: number, y: number) => number[][] = (aStar, x, y) => {
			const startPos = { x: x, y: y };
			const goalPos = { x: 8, y: 6 };
			return aStar.findPath(startPos, goalPos);
		};

		//経路を一時的に取得して、取得できたかどうかを返す
		this.setPath = (aStar) => {
			const myPathway = getPath(aStar, this.px, this.py);
			if (myPathway.length === 0) return false;
			myPathway.shift();
			this.newPath = myPathway;
			return true;
		};

		//移動
		let tween: tl.Tween;
		this.move = (maps) => {
			if (!scene.isStart) return;
			if (!this.isMove) return;
			if (this.life <= 0) return;
			if (this.path.length === 0) {
				tower.setDamage(10);
				this.remove();
				mainGame.clear(null);
				return;
			}
			const pos = this.path.shift();
			const x = pos[0];
			const y = pos[1];
			const map = maps[y][x];
			this.px = x;
			this.py = y;
			tween = timeline
				.create(this)
				.moveTo(map.x, map.y, (map.width / this.ePram.speed) * 1000)
				.call(() => {
					// map.cssColor = "white";
					// map.modified();
					this.move(maps);
				});
		};

		//ショットが当たった時
		this.hit = (attack) => {
			this.life = Math.max(0, this.life - attack);
			bar.scaleX = this.life / this.ePram.life;
			bar.modified();
			if (this.life > 0) {
				return true;
			} else {
				const spr = this.ePram.id < 3 ? sprImage : sprImage2;
				spr.frames = [this.num + 2];
				spr.frameNumber = 0;
				spr.modified();
				if (tween) {
					timeline.remove(tween);
				}

				scene.setTimeout(() => {
					if (this.parent) this.remove();
					mainGame.clear(this);
					return false;
				}, 300);
			}
		};

		//初期化
		this.init = (ePram) => {
			this.ePram = ePram;
			this.life = this.ePram.life;
			bar.scaleX = 1;
			bar.modified();
			const id = ePram.id;
			if (id < 3) {
				this.append(sprImage);
				if (sprImage2.parent) sprImage2.remove();
				this.num = id * 4;
				sprImage.frames = [this.num, this.num + 1];
				sprImage.frameNumber = 0;
				barOut.y = -28;
			} else {
				this.append(sprImage2);
				if (sprImage.parent) sprImage.remove();
				this.num = (id - 3) * 4;
				sprImage2.frames = [this.num, this.num + 1];
				sprImage2.frameNumber = 0;
				barOut.y = -70;
			}
			barOut.modified();
		};
	}
}
