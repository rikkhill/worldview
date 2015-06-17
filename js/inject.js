function appendTemplate(target, data) {
    var template_url = chrome.extension.getURL('assets/templates/wv-box.html');
    $.get(template_url, function(template) {
        var output = $.parseHTML(Mustache.render(template, data));

        // Add tab behaviour
        $(output).find('.label').on('click', function(e){
            $('.top').removeClass("top");
            $(this).parent().addClass("top");
        });

        // Place box at the same offset as the clicked widget
        // TODO: make this intelligently position itself
        // dependent on the viewport
        var offset = $(target).offset();
        $(document.body).append(output);
        $(".outermost").css({
            "position"  : "absolute",
            "top"       : offset.top + "px",
            "left"      : offset.left + "px",
            "display"   : "none"
        }).fadeIn('fast');
    });
}

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
        $(tags.join(", ") + ":not(.wv-ignore)").replaceText(re, "<span class='wv-markup'><img src='" + image + "' class='wv-widget' data-iso='" + c[1] + "' />" + '$1$2' + "</span>");
    });

    // TODO: Mutation observer to add widgets to new countries added

    // When widget is clicked, get data and expand
    $('.wv-widget').on('click', function(e) {

        // If it has some other event or action tied to it, don't do that
        e.preventDefault();
        e.stopPropagation();

        // Close other wv-boxes
        $(".wv-box").fadeOut('fast', function(){
            $(this).remove();
        });

        var iso = $(this).attr('data-iso');
        var target = this;
        chrome.runtime.sendMessage({
            "action": "getEntity",
            "entity": iso
        }, function(response) {
            appendTemplate(target, response.data);
        });
    });
}

$(document).on('mouseup', function (e)
{
    var container = $(".outermost");

    if (!container.is(e.target) && container.has(e.target).length === 0)
    {
        container.fadeOut('fast', function() { $(this).remove(); });
    }
});

chrome.runtime.sendMessage({
    "action" : "getReplacementTerms"
}, function(response) { setWidgets(response.data); });
