$('#overlay').addClass('shown');
$('.logo').addClass('shown');

var showLoadingDots = function() {
    var showDots = setInterval(function(){   
    if ($(".loadingDots").length>0) {
        var dots = '.....',i=1;
		if ($(".loadingDots").html().length==0 || ($(".loadingDots").html().length == dots.length)){
            $(".loadingDots").html('');
            var i = 1;
        } else {
            i++;
        }        
        $(".loadingDots").html($(".loadingDots").html()+".");
        } else {
           clearInterval(showDots);
        }         
    },400); 
}

showLoadingDots();