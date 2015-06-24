module.exports = function(app) {
    app.get('/lobby', OnLogin);
};

function OnLobby(req, res) {
    res.render('login');
}

function LobbyModel() {

}
