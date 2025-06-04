
export default class MapRegion {

  private start: Vector2;
  private end: Vector2;
  
  public constructor(position: Vector2, width : number, height: number) {

    this.start = position;
    this.end = {x: this.start.x + width, y: this.start.y + height};

  }

  isPlayerPresent(position: Vector2) : boolean {


    return (position.x >= this.start.x && position.x <= this.end.x)
      && (position.y >= this.start.y && position.y <= this.end.y);

  }

}
