$(document).ready(function () {
    $('#homePanelBtn').click(function () { 
        END = true;
        toggleSidebar();
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