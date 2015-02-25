<%@ Page Title="Home Page" Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MultipleFileUpload._Default" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>Upload Multiple Files or images</title>
    <script src="Scripts/jquery-1.10.2.min.js" type="text/javascript"></script>
    <style>
        .fileUploadDiv {
            width: 100%;
            position:relative;
        }

        .dropArea {
            align-items: center;
            background: none repeat scroll 0 0 #f2f2f2;
            border: 1px solid gray;
            display: flex;
            justify-content: center;
            left: 1px;
            min-height: 100px;
            opacity: 0.26;
            position: absolute;
            text-align: center;
            top: 1px;
            vertical-align: middle;
            width: 100%;
        }

        .dropArea .drop {
            background: #6DA387;
        }

        .displayNone {
            display: none;
        }
        .dropNotification{
            text-align:center;
            min-height: 60px;
            padding:10px;
         }
        .progressbar {
            width: 100%;
            position: relative;
            background: white;
        }

        .progressBar div.innerProgressBar {
            width: 0%;
            background-color: #AFDDFA;
            height: 100%;
            height: 100%;
        }
        .progressBar div.failed {
            background-color: #ff6a00;
        }

        .filesTable {
            border: 1px solid gray;
            margin: auto;
            width: 80%;
            border-collapse: collapse;
        }

        .filesTable th, .filesTable td {
            border: 1px solid gray;
            border-collapse: collapse;
            text-align:center;
        }

        .uploadButton, .deleteFileButton {
            position: relative;
            z-index: 1;
        }
        .uploadFileButtonWrapper {
            text-align:center;
        }
    </style>
</head>
<body>
    <form>
        <div id="fileUploadDiv" class="fileUploadDiv">
            <table id="filesTable" class="filesTable displayNone">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size (KB)</th>
                        <th>Action</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="fileTableBody">
                </tbody>
            </table>
            <div id="dropNotification" class="dropNotification">Drop your files here</div>
            <div id="droparea" class="dropArea">
            </div>
            <div class="uploadFileButtonWrapper">
                <input class="uploadButton" type="button" onclick="uploadFiles()" value="upload" />
            </div>
        </div>
    </form>
</body>
<script>
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
            i = filesArray.length;
            if (!$("#dropNotification").hasClass("displayNone")) { $("#dropNotification").addClass("displayNone"); $("#filesTable").removeClass("displayNone");}
            for (var j = 0; j < e.dataTransfer.files.length; j++) {
                var myFile = new Object();
                myFile.file = e.dataTransfer.files[j];
                myFile.done = 0;
                filesArray.push(myFile);
            }
            buildTable(e.dataTransfer.files);
        });
        dropArea.addEventListener('dragleave', function (e) {
            console.log("dragleave");
            e.currentTarget.classList.remove('drop');
        });
    });
    function sendFile(myFile, i) {
        $('#progressbar' + i).removeClass("displayNone");
        var uri = "/Services/UploadFile.asmx/postFile";
        var xhr = new XMLHttpRequest();
        var fd = new FormData();
        fd.append('myFile', myFile.file);
        xhr.open("POST", uri, true);
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
            }
            debugger;
            if (xhr.status == 404) {
                console.log("Server error");
                $('#progressbar' + i + ' div').addClass("failed");
                $("#statusMessage" + i).html("failed");
            }
        };
        xhr.onreadystatechange = function () {
            
        };
        xhr.send(fd);
    }
    function uploadFiles() {
        for (var j = 0;j < filesArray.length; j++) {
            if (filesArray[j].done == 0) sendFile(filesArray[j], j);
        }
    }
    function buildTable(fileList) {
        var table = "";
        for (var j = 0; j < fileList.length; j++) {
            var ele = fileList[j];
            var k = i + j;
            table += "<tr id='row" + k + "'>"+
                "<td><div>" + ele.name + "</div></td>" +
                "<td>" + ele.type + "</td>" +
                "<td>" + (parseInt(ele.size) / 1000).toFixed(2) + "</td>"+
                "<td><input id='deleteButton" + k + "' type='button' class='deleteFileButton' name='deleteFileButton' value='delete' onclick='deleteFile(" + k + ")' /></td>"+
                "<td><div id='progressbar" + k + "' class='progressBar displayNone'><div id='statusMessage"+k+"' class='innerProgressBar'>&nbsp;</div></div></td></tr>";
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
</script>
</html>
