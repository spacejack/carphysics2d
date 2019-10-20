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
        console.log('num rounds are: ' + NUM_ROUNDS);
    });
});
