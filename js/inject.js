/*
 * js/inject.js
 * Content script for WorldView Chrome Extension
 *
 */

//TODO: create a suite of helper functions for rendering by Mustache.js

//TODO: offload heavy-lifting of template to the view

//TODO: separate worldview-specific logic from deepview "platform"

//TODO: modularise this to the point where unit-testing is useful

function appendBox(target, data) {
    var template_url = chrome.extension.getURL('assets/templates/wv-box.html');
    $.get(template_url, function(template) {

        // Inject context-specific info into data object
        var context = {};
        context['url'] = chrome.extension.getURL('assets/img/flags');
        data['context'] = context;

        var output = $.parseHTML(Mustache.render(template, data));

        // Add tab behaviour
        $(output).find('.wv-tab-label').on('click', function(e) {
            $('.top').removeClass("top");
            $(this).parent().addClass("top");
        });

        // Append to document so we can position it properly
        var box = $(output).css({"display" : "none"}).appendTo(document.body);

        // Intelligently place the box so it's wholly visible in the viewport
        // (Surprisingly tricky. Maybe there's a plugin for this?)
        var offset = $(target).offset();
        var port_offset = target.getBoundingClientRect();

        var target_width = $(target).width();
        var target_height = $(target).height();
        var port_width = $(window).width();
        var port_height = $(window).height();
        var box_width = $(output).width();
        var box_height = $(output).height();

        var box_offset_left = box_width + port_offset.left < port_width ?
            offset.left + target_width : offset.left - box_width;

        var box_offset_top = box_height + port_offset.top < port_height ?
            offset.top + target_height : offset.top - box_width;

        // Position and fadeIn the box
        box.css({
            "position"  : "absolute",
            "top"       : box_offset_top + "px",
            "left"      : box_offset_left + "px",
            "display"   : "none"
        }).attr("data-iso", $(target).attr("data-iso")).fadeIn('fast');
    });
}

function setWidgets(terms) {

    var image = chrome.extension.getURL('assets/img/globe.png');

    // Only add widgets to text in these tags
    // This ultimately needs to be more sophisticated.
    // The widget should never be placed in <code> or <pre> tags, for example
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

    // Sort terms by length so shorter subset terms don't "break" longer ones
    var terms = terms.sort(function(a, b) {
        return b[0].length - a[0].length;
    });

    // Add the widgets
    terms.forEach(function(c) {
        var re = new RegExp("(?:^|\\b)(" + c[0] + ")([\\b\\W]|$)", 'gi');
        $(tags.join(", ")).not(".wv-ignore").replaceText(re, "<span class='wv-markup wv-ignore'><img src='" + image + "' class='wv-widget' data-iso='" + c[1] + "' />" + '$1$2' + "</span>");
    });

    // TODO: Mutation observer to add widgets to new countries added

    // Add on-click behaviour to widget
    $('.wv-widget').on('click', function(e) {

        // If it has some other event or action tied to it, don't do that
        e.preventDefault();
        e.stopPropagation();

        // Close other wv-boxes
        // (should only ever be one)
        var old_box = $(".wv-box");
        var old_box_identity = old_box.first().attr("data-iso");

        old_box.fadeOut('fast', function(){
            $(this).remove();
        });

        var iso = $(this).attr('data-iso');
        var target = this;

        // If the old box is of the same iso2-type as this widget,
        // don't create a new one.
        // (We could make this more consistent by giving every widget a
        // unique ID and comparing those I'm not sure this will become a
        // problem, so maybe we'll implement this at some point in the future)
        if(old_box_identity == iso) {
            return;
        }

        // Fetch the data from the background script and append a new
        // box once we have it.
        chrome.runtime.sendMessage({
            "action": "getEntity",
            "entity": iso
        }, function(response) {
            appendBox(target, response.data);
        });
    });
}

// Clear boxes on click-out
$(document).on('mouseup', function (e)
{
    var container = $(".outermost");

    if (!container.is(e.target) && container.has(e.target).length === 0)
    {
        container.fadeOut('fast', function() { $(this).remove(); });
    }
});

function getTerms() {
    chrome.runtime.sendMessage({
        "action" : "getReplacementTerms"
    }, function(response) { setWidgets(response.data); });
}

getTerms();
