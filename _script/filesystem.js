var Filesystem = function(){
    var me = {};
    var content;

    me.init = function(){
        if (AmiBase.isAmiBased) return;
        console.error("Filesystem init");
        content = $div("content folder");
        var panel = UI.createPanel("Files",content,"files");

        UI.addPanelToLayout(panel,{
            name: "files",
            position: "left",
            resize: "vertical",
            width: 200,
            order: 1
        });

        me.renderFolder("",content);
    };

    me.renderFolder = function(path,container){
        API.getFolder(path).then(result => {
            var data = result.data;
            if (data){
                data.folders.forEach(folder => {
                    container.appendChild($folder(folder,path));
                });
                data.files.forEach(file => {
                    container.appendChild($file(file,path,data.files));
                });
            }
            console.error("a");
        })
    };

    me.loadFile = function(path){
        console.error(path);
        var ext = path.split(".").pop().toLowerCase();
        var filename = path.split("/").pop().toLowerCase();
        if (ext === "info" || ext === "png"){

            var url = API.getFileUrl(path);

            Iconlist.loadIcon(url,filename);


            //API.getFile(path).then(content => {
                //console.error(content);

                //var icon = {};

                //Iconlist.loadIcon(content,filename);
            //})
        }

    };


    function $folder(folder,path){

        var caption = $div("caption","",folder);


        caption.path = path + "/" + folder;
        caption.onclick = function(){
            if (sub.innerHTML){
                sub.innerHTML = "";
            }else{
                me.renderFolder(this.path,sub);
            }
        };

        var sub = $div("sub");
        var result = $div("folder","",caption);
        result.appendChild(sub);
        return result;
    }

    function $file(file,path){
        var caption = $div("file","",file);
        caption.path = path + "/" + file;
        caption.onclick = function(){
            me.loadFile(this.path);
        };
        return caption;
    }

    return me;

}();