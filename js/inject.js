


// For now, for test purposes, dump this template into this element
var vw_box = undefined;

var template = chrome.extension.getURL('assets/templates/wv-box.html');
$.get(template, function(d) {
    vw_box = d;
    var output = $.parseHTML(Mustache.render(vw_box, { name: "Aruba"}));

    // Add tab behaviour
    $(output).find('.label').on('click', function(e){
        $('.top').removeClass("top");
        $(this).parent().addClass("top");
    });

    $("#spitoon").append(output);
});



function setWidgets(terms) {

    var image = chrome.extension.getURL('assets/img/globe.png');

    // Only add widgets to text in these tags
    var tags = [
        "p",
        "div",
        "span",
        "a",
        "b",
        "i",
        "em",
        "strong",
        "li"
    ];

    terms.forEach(function(c) {
        var re = new RegExp("(?:^|\\b)(" + c[0] + ")([\\b\\W]|$)", 'gi');
        $(tags.join(", ")).replaceText(re, "<span class='wv-markup'><img src='" + image + "' class='wv-widget' data-iso='" + c[1] + "' />" + '$1$2' + "</span>");
    });

    // When widget is clicked, get data and expand
    $('.wv-widget').on('click', function(e) {

        // If it has some other event or action tied to it, don't do that
        e.preventDefault();
        e.stopPropagation();

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
}, function(response) { setWidgets(response.data); });
