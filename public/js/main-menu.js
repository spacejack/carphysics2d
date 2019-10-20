var GAME_MODE = 1;
function toggleToSingleMode(e) {
    if (GAME_MODE === 2) {
        GAME_MODE = 1;
        $('#multi-toggle, #multi-toggle-again').toggleClass('active-mode');
        $('#single-toggle, #single-toggle-again').toggleClass('active-mode');
    }
}
function toggleToMultiMode(e) {
    if (GAME_MODE === 1) {
        GAME_MODE = 2;
        $('#multi-toggle, #multi-toggle-again').toggleClass('active-mode');
        $('#single-toggle, #single-toggle-again').toggleClass('active-mode');
    }
}