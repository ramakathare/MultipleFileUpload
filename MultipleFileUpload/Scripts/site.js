var filesArray = new Array();
var i = filesArray.length;
$(document).ready(function () {
    var dropArea = document.getElementById('droparea');
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
        AddFilesToFilesArray(e.dataTransfer.files);
    });
    dropArea.addEventListener('dragleave', function (e) {
        console.log("dragleave");
        e.currentTarget.classList.remove('drop');
    });
});
function addFilesToUploadController(fileControlId) {
    AddFilesToFilesArray($("#" + fileControlId)[0].files);
}
function AddFilesToFilesArray(fileControlFiles){
    i = filesArray.length;
    if (!$("#dropNotification").hasClass("displayNone")) { $("#dropNotification").addClass("displayNone"); $("#filesTable").removeClass("displayNone"); }
    for (var j = 0; j < fileControlFiles.length; j++) {
        var myFile = new Object();
        myFile.file = fileControlFiles[j];
        myFile.done = 0;
        filesArray.push(myFile);
    }
    buildTable(fileControlFiles);
}

function sendFile(myFile, i) {
    $('#progressbar' + i).removeClass("displayNone");
    var uri = "/Services/UploadFile.asmx/postFile";
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    fd.append('myFile', myFile.file);
    xhr.open("POST", uri, true);
    xhr.onloadstart = function () {
        activeAjaxConnections++;
    };
    xhr.onloadend = function () {
        activeAjaxConnections--;
        if (0 == activeAjaxConnections) {
            count = 0;
            var deleted = 0;
            $(filesArray).each(function (index, item) {
                if (item.done == 1) count++;
                if (item.done < 0) deleted++;
            });
            alert("Completed " + count + " out of " + (filesArray.length - deleted));
        }
    };
    xhr.upload.onprogress = function (evt) {
        if (evt.lengthComputable) {
            var percentComplete = (evt.loaded / evt.total) * 100;
            $('#progressbar' + i + ' div').width(percentComplete + "%");
        }
    };
    xhr.onerror = function (e) {
        console.log('ERROR ' + e.error);
    };
    xhr.onload = function () {
        console.log('ONLOAD ' + this.status + ' readyState ' + this.readyState);
        if (/*xhr.readyState == 4 && */ xhr.status == 200) {
            $("#deleteButton" + i).attr("disabled", "disabled");
            $("#statusMessage" + i).html("Success");
            myFile.done = 1;
        }else {
            console.log("Server error");
            $('#progressbar' + i + ' div').addClass("failed");
            $("#statusMessage" + i).html("failed");
        }
    };
    xhr.onreadystatechange = function () {

    };
    xhr.send(fd);
}
var activeAjaxConnections = 0;
function uploadFiles() {
    count = 0;
    deleted = 0;
    $(filesArray).each(function (index, item) {
        if (item.done == 1) count++;
        if (item.done < 0) deleted++;
    });
    if ((filesArray.length - deleted) > count) {
        for (var j = 0; j < filesArray.length; j++) {
            if (filesArray[j].done == 0) sendFile(filesArray[j], j);
        }
    } else {
        alert("Completed " + count + " out of " + (filesArray.length - deleted));
    }
}
function buildTable(fileList) {
    var table = "";
    for (var j = 0; j < fileList.length; j++) {
        var ele = fileList[j];
        var k = i + j;
        table += "<tr id='row" + k + "'>" +
            "<td><div>" + ele.name + "</div></td>" +
            "<td>" + ele.type + "</td>" +
            "<td>" + (parseInt(ele.size) / 1000).toFixed(2) + "</td>" +
            "<td><input id='deleteButton" + k + "' type='button' class='deleteFileButton' name='deleteFileButton' value='delete' onclick='deleteFile(" + k + ")' /></td>" +
            "<td><div id='progressbar" + k + "' class='progressBar displayNone'><div id='statusMessage" + k + "' class='innerProgressBar'>&nbsp;</div></div></td></tr>";
    }
    $("#fileTableBody").append(table);
    $("#droparea").css("min-height", function () { return $("#filesTable").height() + 30; });

}
function deleteFile(x) {
    $("#row" + x).remove();
    filesArray[x].done = -1;
}

//function SendFile1(file) {
//    var data = new FormData();

//    // Add the uploaded image content to the form data collection
//    data.append("myFile", file);

//    // Make Ajax request with the contentType = false, and procesDate = false
//    var ajaxRequest = $.ajax({
//        type: "POST",
//        url: "/Services/UploadFile.asmx/postFile",
//        contentType: false,
//        processData: false,
//        data: data
//    });

//    ajaxRequest.done(function (xhr, textStatus) {
//        // Do other operation
//    });
//}