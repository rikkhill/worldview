getEntityData = function(entity, sendResponse) {
    //var entity = entity;
    //var sendResponse = sendResponse;
    return function(data) {
        if(typeof data[entity] === "undefined") {
            sendResponse({
                "status" : "error",
                "message" : "missing entity: " + entity
            });
        }

        var response = {};
        response["status"] = "success";
        response["data"] = data[entity];
        sendResponse(response);
    }
}

getReplacementTerms = function(params, sendResponse) {
    return function(data) {
        var replacers = [];
        $.each(data, function(key, val) {
            // Maybe make this more sophisticated with
            // multiple replacement terms for each entity
            replacers.push([val.name, key]);
        });

        var response = {
            "status"    : "success",
            "data"      : replacers
        };

        sendResponse(response);
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(typeof request.action === 'undefined') {
        sendResponse({
            "status" : "error",
            "message" : "missing action"
        });
    }

    var actions = {
        'getEntity' : getEntityData,
        'getReplacementTerms' : getReplacementTerms
    };

    var func = actions[request.action](request.entity, sendResponse);
    var json = $.getJSON(chrome.extension.getURL("data/countries.json"), func);
    // Handle asynchronously
    return true;
});
