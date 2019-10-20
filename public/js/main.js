/*global App */

"use strict";

//  Boot up the app
$(document).ready(function () {
    $('#playBtn').click(function (e) {
        $('#playModal').css('display', 'none');
        $('#menuWrapper').hide();
        $('#game_container').show();
        $('#menu__toggler').show();
        PAUSE = false;
        App.run();
    });
    
});
// window.addEventListener('load', function(){App.run();}, false);
