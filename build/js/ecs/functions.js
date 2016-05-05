var ECS;
(function (ECS) {
    function isAliveEnemy(e) {
        return (e["enemy"] && e["alive"] && e["alive"].value === true);
    }
    ECS.isAliveEnemy = isAliveEnemy;
})(ECS || (ECS = {}));
