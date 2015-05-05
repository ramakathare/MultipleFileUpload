var a;
var ready = false;
$.getScript("/_layouts/15/SP.RequestExecutor.js", function () {
        ready = true;
    });
var MultiFileUpload = function(mainDiv,appWebUrl,docLibrary,docLibraryTitle,prefix, serverInput){

 	var global = this;

	if(typeof prefix != "undefined")
	if(prefix.length > 0) this.prefix = prefix;
	else this.prefix = "";
	
	this.serverInput = serverInput;
 	this.confirmRequired = true;
	this.activeUploads = 0;
	this.appWebUrl = appWebUrl;
	this.docLibrary = docLibrary;
	this.docLibraryTitle = docLibraryTitle;
	this.mainDiv = mainDiv;
    this.digest = "";
    this.ready = false;
    this.filesArray = new Array();
    
	this.AfterUpload = function(){
     alert("Done");
    };

    digest = $("#__REQUESTDIGEST").val();

	$(mainDiv+" .browserButton").click(function(){
		$(mainDiv+" .fileuploadInput").click();
	});
    $(mainDiv+" .fileuploadInput").change(function(){
    	global.AddFilesToFilesArray($(mainDiv+" .fileuploadInput")[0].files);
    });
    $(mainDiv+" .uploadButton").click(function(){
    	global.uploadFiles();
    });
    

    // load the request executor script, once ready set a flag that can be used to check against later
    
    
   //var mainEle = document.getElementById(mainDiv.substring(1));
   //var dropArea = mainEle.getElementsByClassName("dropArea")[0];
   var dropArea = document.getElementById(mainDiv.substring(1));
    this.dropArea = dropArea;
    
    dropArea.addEventListener('dragenter', function (e) {
        e.currentTarget.classList.add('drop');
    });

    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    });
    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drop');
        global.AddFilesToFilesArray(e.dataTransfer.files);
    });
    dropArea.addEventListener('dragleave', function (e) {
        e.currentTarget.classList.remove('drop');
    });    
    return this;
};
MultiFileUpload.prototype.AddFilesToFilesArray = function(fileControlFiles) {
    if (!$(this.mainDiv +" .dropNotification").hasClass("displayNone")) { $(this).addClass("displayNone"); }
    for (var j = 0; j < fileControlFiles.length; j++) {
        var myFile = new Object();
        myFile.file = fileControlFiles[j];
        myFile.done = 0;
        myFile.filePrefix = "";//ncrGuid;
        this.filesArray.push(myFile);
    }
    this.buildTable(fileControlFiles);
};
MultiFileUpload.prototype.buildTable = function(fileList) {
	var global = this;
	this.i = this.filesArray.length - fileList.length;
	$(this.mainDiv +" .filesTable").removeClass("displayNone")    
	var table = ""; 
    for (var j = 0; j < fileList.length; j++) {
        var ele = fileList[j];
        var k = this.i + j;
        var status = "";
        var name = ele.name;
        if(this.filesArray[k].done == 2){
        // status = "On Server";
         name = "<a href='"+ele.href+"' target = '_blank' class='zIndex'>"+ele.name+"</a>";
        }
        table += "<tr class='row" + k + "'>" +
            "<td><div>" + name + "</div></td>" +
            //"<td>" + ele.name.substring(ele.name.lastIndexOf('.')+1)+ "</td>" +
            "<td align=right>" + (parseInt(ele.size) / 1000).toFixed(2) + "</td>" +
            //"<td class='status" + k + "'>"+status+"</td>" + 
            "<td><input type='button' k='"+k+"' class='deleteFileButton deleteButton"+k+"' value='delete'/></td></tr>";
            
    }
    $(this.mainDiv+" .fileTableBody").append(table);
    $(this.mainDiv+" .deleteFileButton").unbind( "click" );
    if(global.confirmRequired){
	    $(this.mainDiv+" .deleteFileButton").click(function(){
				if (confirm("Do you want to delete the previously added file?")) {
				    global.deleteFile($(this).attr("k"));
				}
	    });
    }else{
		 $(this.mainDiv+" .deleteFileButton").click(function(){
				global.deleteFile($(this).attr("k"));
		});
	}
    global.confirmRequired = false;
    /*$(this.dropArea).css("min-height", function () { 
     return $(global.mainDiv + " .fileTableBody").height() + 59; 
    });*/
};
MultiFileUpload.prototype.uploadFiles = function(){
// if we have not finished loading scripts then display an alert
    if (!ready) {
        alert("Oooooops... Please wait for the page to finish loading before attempting to upload a file");
        return;
    }
    count = 0;
    deleted = 0;
    $(this.filesArray).each(function (index, item) {
        if (item.done >= 1) count++;
        if (item.done < 0) deleted++;
    });
    if ((this.filesArray.length - deleted) > count) {
        this.activeUploads = 0;
        for (var j = 0; j < this.filesArray.length; j++) {
            if (this.filesArray[j].done == 0) {
                // sendFile(filesArray[j], j);
                this.ProcessUpload(this.filesArray[j],j);
            }
        }
    } else {
        //alert("There are " + ((filesArray.length - deleted) - count) + "pending uploads");
        this.doAfterWork();
    }
};
MultiFileUpload.prototype.ProcessUpload = function(myFile, j) {
    var global = this;
    
   // $(this.mainDiv + " .status" + j).html(function () { return imageTag(j) });
    $(this.mainDiv + " .deleteButton" + j).attr("disabled", "disabled");

    var reader = new FileReader();
    
    reader.onload = function (result) {
        var fileData = '';
        var byteArray = new Uint8Array(result.target.result)
        for (var i = 0; i < byteArray.byteLength; i++) {
            fileData += String.fromCharCode(byteArray[i])
        }
        // once we have the file perform the actual upload
        global.PerformUpload(myFile, fileData, j);
    };
    reader.onprogress = function (evt) {
        if (evt.lengthComputable) {
            var percentComplete = (evt.loaded / evt.total) * 100;
        }
    };
    reader.readAsArrayBuffer(myFile.file);
};

MultiFileUpload.prototype.PerformUpload = function(myFile, fileData, i) {
   	var global = this;
   	var uploadedFileName = this.prefix + myFile.file.name;
    var url;
    //url = appWebUrl + "/_api/web/lists/getByTitle(@TargetLibrary)/RootFolder/Files/add(url=@TargetFileName,overwrite='true')?@TargetSite='" + targetSiteUrl + "'&@TargetFileName='" + myFile.Name1 + "'&@TargetLibrary='" + docLibraryTitle + "'";
    url = this.appWebUrl + "/_api/web/lists/getByTitle(@TargetLibrary)/RootFolder/Files/add(url=@TargetFileName,overwrite='true')?"
    				+ "'&@TargetFileName='" + uploadedFileName 
    				+ "'&@TargetLibrary='" + this.docLibrary + "'";
    //url = String.format("{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" + "/add(overwrite=true, url='{2}')", appWebUrl, docLibrary, docLibraryTitle);
    // use the request executor (cross domain library) to perform the upload
    var reqExecutor = new SP.RequestExecutor(this.appWebUrl);
    //reqExecutor.executeAsync({
    this.activeUploads++;
    reqExecutor.executeAsync({
        url: url,
        method: "POST",
        headers: {
            "Accept": "application/json; odata=verbose",
            "X-RequestDigest": digest
        },
        contentType: "application/json;odata=verbose",
        binaryStringRequestBody: true,
        body: fileData,
        success: function (x, y, z) {
            // alert("Success! Your file was uploaded to SharePoint.");

            $(global.mainDiv + " .deleteButton" + i).attr("value", "Done");
            $(global.mainDiv + " .deleteButton" + i).attr("disabled", "disabled");

          //  $(global.mainDiv + " .status" + i).html(function () { 
          //      return "<div class='progressBar displayNone progressbar"+i+"'><div class='statusMessage"+i+" innerProgressBar'>&nbsp;</div></div>";
          //  });
          //  $(global.mainDiv + " .progressbar" + i).removeClass("displayNone");
          //  $(global.mainDiv + " .progressbar" + i + ' div').width("100%");
          //  $(global.mainDiv + " .statusMessage" + i).html("Success");
            myFile.done = 1;
            global.activeUploads--;
            if (0 == global.activeUploads) {
                global.doAfterWork();
            }
        },
        error: function (x, y, z) {
            // alert("Oooooops... it looks like something went wrong uploading your file.");
            $(global.mainDiv+ " .deleteButton" + i).attr("value", "Delete");
            $(global.mainDiv+ " .deleteButton" + i).removeAttr("disabled");

          //  $(global.mainDiv+ " .status" + i).html(function () { return "<div class='progressBar displayNone progressbar"+i+"'><div class='statusMessage"+i+" innerProgressBar'>&nbsp;</div></div>"; });
         //   $(global.mainDiv+ " .progressbar" + i + " div").addClass("failed");
         //   $(global.mainDiv+ " .statusMessage" + i).html("failed");
          //  $(global.mainDiv+ " .progressbar" + i + " div").width("100%");
            this.activeUploads--;
            if (0 == global.activeUploads) {
                global.doAfterWork();
            }
        }
    });
};
MultiFileUpload.prototype.doAfterWork = function() {
    count = 0;
    var deleted = 0;
    $(this.filesArray).each(function (index, item) {
        if (item.done == 1) count++;
        if (item.done < 0) deleted++;
    });
    this.AfterUpload();
};
MultiFileUpload.prototype.deleteFile = function(x) {
    $(this.mainDiv +" .row" + x).remove();
    if(this.filesArray[x].done == 0) this.filesArray[x].done = -1;
	if(this.filesArray[x].done == 2) this.filesArray[x].done = -2;
	$(this.dropArea).css("min-height", function () { 
     return $(global.mainDiv + " .fileTableBody").height() + 68; 
    });
};
MultiFileUpload.prototype.init = function(){
   var global = this;
   var s = null;
   try{
	s = $.parseJSON($("[id$="+this.serverInput+"]").val());
	}catch(err){}
	if(s != null){
		var fileList = new Array();
		if(s.length > 0){
			for(d = 0;d<s.length;d++){
				var item = s[d];
				var myFile = new Object();
				myFile.done = 2;
				myFile.file = new Object();
				myFile.file.name = item.name;
				myFile.file.href = item.href;
				myFile.file.type = item.type;
				myFile.file.size = item.size;
				global.filesArray.push(myFile);
				fileList.push(myFile.file);		     
			}
		} 
		this.buildTable(fileList);
	}
};
function imageTag(i) {
    return '<img height="15" class="image' + i + '" title="" alt="" src="data:image/gif;base64,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" />';
}

/*
<div id="fileUploadDiv" class="fileUploadDiv" name="TTPO_AttachedCaseDocuments">
                                                <div class="tableContainer">
                                                    <table class="filesTable displayNone">
                                                        <thead>
                                                        <tr class="theaderLeft">
                                                            <th width="70%">Name</th>
                                                            <th width="10%">Size (KB)</th>
                                                            <th width="15%"></th>
                                                        </tr>
                                                                                                                </thead>
                                                        <tbody class="fileTableBody">
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div class="uploadFileButtonWrapper">
                                                    <input type="button" class="browserButton" value="Browse" id="browse" />
                                                    <input class="fileuploadInput" type="file" multiple="multiple" value="" />
                                                    <input class="uploadButton displayNone" type="button" value="upload" />
                                                    <div class="message">Drag and drop files in the area above or click the "Browse" button</div>
                                                    <div class="clearfix"></div>
                                                </div>
                                                <div class="clearfix"></div>
                                            </div>
                                            */