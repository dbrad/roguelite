interface ComponentDictionary {
    [index: string]: ECS.Components.Component<any>;
}
namespace ECS {
    export class Entity {
        public components: ComponentDictionary;
        public id: number;
        private static autoID: number;

        constructor() {
            this.components = {};
            if (!Entity.autoID) {
                Entity.autoID = 0;
            }
            this.id = Entity.autoID++;
        }
        addComponent(component: Components.Component<any>) {
            this.components[component.name] = component;
            this[component.name] = component;
        }
    }
}
