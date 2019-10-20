/*global App */

"use strict";

//  Boot up the app
$(document).ready(function () {
    $('#playBtn, #playAgainBtn').click(function (e) {

        $('#playModal').css('display', 'none');
        $('#gameOverModal').hide();
        $('#menuWrapper').hide();
        $('#game_container').show();
        $('#menu__toggler').show();
        PAUSE = false;
        App.run();
    });
    
});
