var countries;

function setBug(terms) {
    terms.forEach(function(c) {
        var re = new RegExp("(" + c + ")([\\b'.?!,\":;/\)])", 'gi');
        $("*").replaceText(re, " XX " + '$1$2');
    });
}

var json = $.getJSON(chrome.extension.getURL("data/countries.json"),
    function(data){
        var replace = [];
        $.each(data, function(key, val) {
            replace.push([val.name]);
        });
        setBug(replace);
    });
