var API = function(){
    var me = {};

    var apiBase = "http://localhost:4555/";

    me.getFolder = function(path,callback){
        path = path||"";
        return new Promise(function(resolve,reject){
            var next = callback || resolve;
            var apiUrl = apiBase +  "list";
            if (path.substr(0,1) !== "/")  apiUrl += "/";
            apiUrl += path;
            FetchService.json(apiUrl,function(result){
                next(result || {});
            });
        });
    };

    me.getFile = function(path,callback){
        path = path||"";
        return new Promise(function(resolve,reject){
            var next = callback || resolve;
            var apiUrl = apiBase +  "get";
            if (path.substr(0,1) !== "/")  apiUrl += "/";
            apiUrl += path;
            FetchService.arrayBuffer(apiUrl,function(result){
                next(result || {});
            });
        });
    };

    me.putFile = function(path,data,callback){
        path = path||"";
        return new Promise(function(resolve,reject){
            var next = callback || resolve;
            var apiUrl = apiBase +  "put";
            if (path.substr(0,1) !== "/")  apiUrl += "/";
            apiUrl += path;
            FetchService.sendBinary(apiUrl,data,function(result){
                next(result);
            })
        });
    };

    me.getJSON = function(path,callback){
        path = path||"";
        return new Promise(function(resolve,reject){
            var next = callback || resolve;
            var apiUrl = apiBase +  "get";
            if (path.substr(0,1) !== "/")  apiUrl += "/";
            apiUrl += path;
            FetchService.json(apiUrl,function(result){
                next(result || {});
            });
        });
    };

    me.exists = function(path,callback){
        path = path||"";
        return new Promise(function(resolve,reject){
            var next = callback || resolve;
            var apiUrl = apiBase +  "exists";
            if (path.substr(0,1) !== "/")  apiUrl += "/";
            apiUrl += path;
            FetchService.json(apiUrl,function(result){
                next(!!result.data);
            });
        });
    };

    me.getFileUrl = function(path){
        var apiUrl = apiBase +  "get";
        if (path.substr(0,1) !== "/")  apiUrl += "/";
        apiUrl += path;
        return apiUrl;
    };

    return me;
}();