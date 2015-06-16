
// Going to tidy the shit out of this in future
function makeBox(data) {
    var html = ""+
"<div style='width: 300; height: 300'>" +
"</div>";

}

function setWidget(terms) {

    var image = chrome.extension.getURL('assets/img/globe.png');

    terms.forEach(function(c) {
        var re = new RegExp("(" + c[0] + ")([\\b\\W])", 'gi');
        $("p, div, span, a").replaceText(re, "<img src='" + image + "' class='wv-widget' data-iso='" + c[1] + "' />" + '$1$2');
    });

    // When widget is clicked, get data and expand
    $('.wv-widget').on('click', function(e) {
        // If it's in an <a> tag, don't follow it
        e.preventDefault();
        console.log(this);
        var iso = $(this).attr('data-iso');
        chrome.runtime.sendMessage({
            "action": "getEntity",
            "entity": iso
        }, function(response) {
            console.log(response);
        });
    });
}

chrome.runtime.sendMessage({
    "action" : "getReplacementTerms"
}, function(response) { setWidget(response.data); });
