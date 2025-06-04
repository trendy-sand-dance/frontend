import { Sprite, Graphics , Container } from "pixi.js";

export default class MapRegion {

  private start: Vector2;
  private end: Vector2;

  private container : Container = new Container();
  // private isHub : boolean = false;
  
  public constructor(position: Vector2, width : number, height: number) {

    this.start = {x: position.x, y: position.y};
    this.end = {x: this.start.x + width, y: this.start.y + height};

  }

  isInRegion(position: Vector2) : boolean {


    return (position.x >= this.start.x && position.x <= this.end.x)
      && (position.y >= this.start.y && position.y <= this.end.y);

  }

  addToContainer(tile : Graphics | Sprite | Container) : void {

    this.container.addChild(tile);

  }

  getContainer() : Container {

    return this.container;

  }



}
