export function lerpPosition(a: Vector2, b: Vector2, t: number): Vector2 {

  return { x: a.x + (b.x - a.x) * t, y: b.y + (b.y - b.y) * t };

}

export function lerpNumber(a: number, b: number, t: number): number {

  return a + (b - a) * t;

}
