$(document).ready(function () {
    $('#gameOverModal').hide();
    $('#homePanelBtn, #goToHome').click(function () { 
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
    $('#settingsMenuBtn, #settingsBtn').click(function () { 
        $('#settingsModal').css('display', 'block');
    });
    $('#closeSettingsModal').click(function (e) { 
        $('#settingsModal').css('display', 'none');
    });
});