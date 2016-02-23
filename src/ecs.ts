/// <reference path="./types.ts"/>
namespace ECS {
  /**
   * Entity Class
   */
  export class Entity {
    public components: ComponentDictionary;
    public id: number;
    private static autoID: number;
    constructor() {
      this.components = {};
      if (!Entity.autoID)
        Entity.autoID = 0;
      this.id = Entity.autoID++;
    }
    addComponent(component: Components.Component<any>) {
      this.components[component.name] = component;
      this[component.name] = component;
    }
  }

  /**
   * Components
   */
  export namespace Components {
    export class Component<T> {
      name: string;
      value: T;
      constructor(name: string) {
        this.name = name;
      }
    }
    export class IsPlayer extends Component<boolean> {
      constructor() {
        super("player");
        this.value = true;
      }
    }
    export class IsEnemy extends Component<boolean> {
      constructor() {
        super("enemy");
        this.value = true;
      }
    }
    export class TilePos extends Component<Point> {
      constructor() {
        super("pos");
        this.value = {x: 0, y: 0};
      }
    }
  }

  export namespace Systems {

  }
}
