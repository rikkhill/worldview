var json = $.getJSON(chrome.extension.getURL("data/countries.json"),
    function(data){
        data.countries.forEach(function(c) {
            $("*").replaceText(c.oldphrase, c.newphrase);
        });
    });
