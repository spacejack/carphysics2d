var SIDEBAR_OPEN = false;
var LEFT_GAME = false;
$(document).ready(function () {
    $('#gameOverModal').hide();
    $('#homePanelBtn, #goToHome').click(function () { 
        if (SIDEBAR_OPEN)
            toggleSidebar();
        $('#gameOverModal').hide();
        $('#menuWrapper').show();
        $('#game_container').hide();
    });
    $('#playMenuBtn').click(function () {
        RESTART = true;
        $('#menu__toggler').hide();
        $('#playModal').css('display', 'block');
    });
    $('#settingsMenuBtn').click(function () { 
        if (SIDEBAR_OPEN)
            toggleSidebar()();
        $('#settingsModal').css('display', 'block');
        
    });
    $('#settingsBtn').click(function () {
        //toggle menu
        if (SIDEBAR_OPEN)
                toggleSidebarDontResume();
        $('#settingsModal').css('display', 'block');
    });
    $('#closeSettingsModal').click(function (e) { 
        $('#settingsModal').css('display', 'none');
    });
});