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
	// eslint-disable-next-line @typescript-eslint/member-ordering
	static getPath: (aStar: AStarFinder, x: number, y: number) => number[][];

	constructor(pram: g.EParameterObject, mainGame: MainGame, tower: Tower) {
		super(pram);
		const timeline = new tl.Timeline(pram.scene);
		const scene = this.scene as MainScene;

		//画像
		const sprImage = new g.FrameSprite({
			scene: scene,
			src: scene.assets.enemy as g.ImageAsset,
			x: (pram.width - 75) / 2,
			y: pram.height - 112.5 - 10,
			width: 75,
			height: 110,
			frames: [0, 1],
			interval: 500,
		});
		sprImage.start();

		const sizeL = 150;
		const sprImage2 = new g.FrameSprite({
			scene: scene,
			src: scene.assets.enemy2 as g.ImageAsset,
			x: (pram.width - sizeL) / 2,
			y: pram.height - sizeL - 10,
			width: sizeL,
			height: sizeL,
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
			const goalPos = { x: mainGame.base.mapW - 1, y: mainGame.base.mapH-1 };
			return aStar.findPath(startPos, goalPos);
		};
		Enemy.getPath = getPath;

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
			if (!scene.isStart || !this.isMove || this.life <= 0 || !this.parent) return;
			if (this.path.length === 0 && tower.life !== 0) {
				tower.setDamage(this.ePram.attack);
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

				scene.playSound("se_hit");
			}
		};

		//初期化
		this.init = (ePram) => {
			this.ePram = ePram;
			this.life = this.ePram.life;
			bar.scaleX = 1;
			bar.modified();
			this.isMove = false;
			if (ePram.size === 1) {
				//小さい敵
				this.append(sprImage);
				if (sprImage2.parent) sprImage2.remove();
				this.num = this.ePram.imageID * 4;
				sprImage.frames = [this.num, this.num + 1];
				sprImage.frameNumber = 0;
				barOut.y = -35;
			} else {
				//大きい敵
				this.append(sprImage2);
				if (sprImage.parent) sprImage.remove();
				this.num = this.ePram.imageID * 4;
				sprImage2.frames = [this.num, this.num + 1];
				sprImage2.frameNumber = 0;
				barOut.y = -110;
			}
			barOut.modified();
		};
	}
}
