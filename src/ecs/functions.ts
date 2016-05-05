namespace ECS {
    export function isAliveEnemy(e: ECS.Entity) {
        return (e["enemy"] && e["alive"] && e["alive"].value === true);
    }
}
