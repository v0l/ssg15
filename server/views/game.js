module.exports = function(app) {
    app.get('/towerattack', OnGame);
};

function OnGame(req, res) {
    res.render('game');
}

function GameModel() {

}
