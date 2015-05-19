<%@ Page Title="Home Page" Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MultipleFileUpload._Default" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>Upload Multiple Files or images</title>
    <script src="Scripts/jquery-1.10.2.min.js" type="text/javascript"></script>
    <script src="Scripts/Multifileuploader.js"></script>
    <link href="Content/Site.css" rel="stylesheet" />
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
                <input type="button" class="uploadButton" value="Browse" id="browse" onclick="$('#fileUploadControl').click();" />
                <input id="fileUploadControl" class="fileuploadInput" type="file" multiple="multiple" onchange="addFilesToUploadController('fileUploadControl')" value="" />
                <input class="uploadButton" type="button" onclick=" uploadFiles()" value="upload" />
            </div>
        </div>
    </form>
</body>
</html>
