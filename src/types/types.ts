/// <reference path="../ecs/components.ts"/>
interface Context2D extends CanvasRenderingContext2D {
    mozImageSmoothingEnabled?: boolean;
    imageSmoothingEnabled?: boolean;
    webkitImageSmoothingEnabled?: boolean;
}

interface ComponentDictionary {
  [index: string]: ECS.Components.Component<any>;
}

interface Point {
  x: number;
  y: number;
}

interface Dimension {
  w: number;
  h: number;
}
