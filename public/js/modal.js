$(document).ready(function(){
    $('#settingsBtn').click(function () { 
        $('#myModal').css('display', 'block');
    });
    // jQuery methods go here...
    $('#close').click(function (e) { 
        $('#myModal').css('display', 'none');
        
    });
  });
