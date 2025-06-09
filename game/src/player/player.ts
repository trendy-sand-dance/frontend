import { Assets, Container, Graphics, Texture, AnimatedSprite } from "pixi.js";
import Point from '../utility/point.js';
import { RoomType } from "../interfaces.js";

interface DirectionalAnimatedSprite extends AnimatedSprite {
  currentAnimation: string;
  animations: Record<string, Texture[]>;
  setAnimation: (direction: string) => void;
}

export function createDirectionalAnimatedSprite(
  textures: Record<string, Texture>,
  frameTags: { name: string; from: number; to: number; direction: string }[]
): DirectionalAnimatedSprite {
  const animations: Record<string, Texture[]> = {};

  const frameNames = Object.keys(textures);

  for (const tag of frameTags) {
    const frames: Texture[] = [];

    for (let i = tag.from; i <= tag.to; i++) {
      const frameName = frameNames[i];
      if (frameName && textures[frameName]) {
        frames.push(textures[frameName]);
      }
    }

    animations[tag.name] = frames;
  }

  const defaultTextures = animations["idle"] ?? Object.values(animations)[0];
  const sprite = new AnimatedSprite(defaultTextures) as DirectionalAnimatedSprite;

  sprite.animations = animations;
  sprite.animationSpeed = 0.05;
  sprite.loop = true;
  sprite.play();

  sprite.setAnimation = function(direction: string) {
    if (this.currentAnimation === direction) return;
    if (direction === 'idle') {
      sprite.animationSpeed = 0.05;
    } else {
      sprite.animationSpeed = 0.1;
    }
    const newFrames = this.animations[direction];
    if (!newFrames) return;
    this.textures = newFrames;
    this.currentAnimation = direction;
    this.play();
  };

  return sprite;
}

export default class Player {
  public id: number;
  public position: Point;
  private username: string;
  private avatar: string;

  private region: RoomType = RoomType.Hall;
  private shadow: Graphics;
  private container: Container;
  private animation: DirectionalAnimatedSprite;

  constructor(id: number, username: string, avatar: string, position: Vector2) {
    this.id = id;
    this.position = new Point(position.x, position.y);
    this.username = username;
    this.avatar = avatar;

    // Sprite Context
    const spritesheet = Assets.get('player_spritesheet')
    this.animation = createDirectionalAnimatedSprite(spritesheet.textures, spritesheet.data.meta.frameTags);
    this.animation.anchor.set(0.5);
    this.shadow = new Graphics().circle(0, this.animation.height * 2, 10).fill('#000000');
    this.shadow.scale.y = 0.25;
    this.shadow.alpha = 0.25;
    this.shadow.zIndex = 5000;
    this.container = new Container();
    this.container.addChild(this.animation);
    this.container.addChild(this.shadow);

    this.container.x = this.position.asIsometric.x;
    this.container.y = this.position.asIsometric.y;
    this.container.zIndex = this.position.asIsometric.y + 7.5;
  }

  setRegion(room: RoomType): void {

    this.region = room;

  }

  getRegion(): RoomType {

    return this.region;

  }

  updatePosition(position: Vector2) {

    if ((position.x - this.position.asCartesian.x) < 0) {
      this.animation.setAnimation('west');
    }
    else if ((position.x - this.position.asCartesian.x) > 0) {
      this.animation.setAnimation('east');
    }
    else if ((position.y - this.position.asCartesian.y) > 0) {
      this.animation.setAnimation('south');
    }
    else if ((position.y - this.position.asCartesian.y) < 0) {
      this.animation.setAnimation('north');
    }


    this.position.update(position);
    this.container.zIndex = this.position.asIsometric.y + 7.5;

    this.container.x = this.position.asIsometric.x;
    this.container.y = this.position.asIsometric.y;

    let snapshot = this.position.asCartesian;
    setTimeout(() => {
      if (snapshot.x === this.getPosition().x && snapshot.y === this.getPosition().y) {
        this.animation.setAnimation('idle');
      }
    }, 50);

  }

  setAnimation(animation: string) {
    this.animation.setAnimation(animation);
  }

  getId() {
    return this.id;
  }

  getAvatar() {
    return this.avatar;
  }

  getUsername() {
    return this.username;
  }

  getPoint() {
    return this.position;
  }

  getPosition() {
    return this.position.asCartesian;
  }

  getIsometricPosition() {
    return this.position.asIsometric;
  }

  destroy() {
    this.animation.destroy();
    this.shadow.destroy();
    this.container.destroy();
  }

  getContext() {
    // return this.context;
    // return this.animation;
    return this.container;
  }
}
