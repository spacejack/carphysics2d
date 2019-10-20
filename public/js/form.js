var PLAYER_0_NAME = 'Player 0';

var PLAYER_1_NAME = 'Player 1';

var MUSIC_VOLUME = 0.5;
$(document).ready(function () {
    $('#numInpt').keypress(function(e) {
        var a = [];
        var k = e.which;
    
        for (i = 48; i < 58; i++)
            a.push(i);
    
        if (!(a.indexOf(k)>=0))
            e.preventDefault();
    });
    $('#saveButton').click(function () { 
        //set variable as #numInpt
        NUM_ROUNDS = parseInt($('#numInpt').val());
        var p0 = $('#player0name').val();
        if (p0 !== void 0 && p0.length > 0) {
            PLAYER_0_NAME = p0;
        }
        var p1 = $('#player1name').val();
        if (p1 !== void 0 && p1.length > 0) {
            PLAYER_1_NAME = p1;
        }
        MUSIC_VOLUME = parseFloat($('#myRange').val() * 0.01);
        setVolume();
        $('#settingsModal').hide();
        console.log('num rounds are: ' + NUM_ROUNDS);
        console.log('Player 0 is: ' + PLAYER_0_NAME);
        console.log('Player 1 is: ' + PLAYER_1_NAME);
        console.log('Music volume is: ' + MUSIC_VOLUME);
        
        
    });
});
