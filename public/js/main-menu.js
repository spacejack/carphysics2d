var GAME_MODE = 1;
function toggleToSingleMode(e) {
    if (GAME_MODE === 2) {
        GAME_MODE = 1;
        var sinelement = document.getElementById("single-toggle");
        sinelement.classList.toggle('active-mode');
        var multielement = document.getElementById("multi-toggle");
        multielement.classList.toggle('active-mode');
    }
}
function toggleToMultiMode(e) {
    if (GAME_MODE === 1) {
        GAME_MODE = 2;
        var multielement = document.getElementById("multi-toggle");
        multielement.classList.toggle('active-mode');
        var sinelement = document.getElementById("single-toggle");
        sinelement.classList.toggle('active-mode');
    }
}