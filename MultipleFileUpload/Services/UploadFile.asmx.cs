using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Services;

namespace MultipleFileUpload.Services
{
    /// <summary>
    /// Summary description for UploadFile
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    // [System.Web.Script.Services.ScriptService]
    public class UploadFile : System.Web.Services.WebService
    {

        [WebMethod]
        public string postFile()
        {
            try
            {
                if (HttpContext.Current.Request.Files.AllKeys.Any())
                {
                    // Get the uploaded image from the Files collection
                    var httpPostedFile = HttpContext.Current.Request.Files["myFile"];

                    if (httpPostedFile != null)
                    {
                        // Validate the uploaded image(optional)

                        // Get the complete file path
                        var fileSavePath = Path.Combine(HttpContext.Current.Server.MapPath("~/App_Data"), httpPostedFile.FileName.Split('\\')[httpPostedFile.FileName.Split('\\').Length - 1]);
                        // Save the uploaded file to "UploadedFiles" folder
                        httpPostedFile.SaveAs(fileSavePath);
                    }
                }
            }
            catch (Exception)
            {
                HttpContext.Current.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return "Upload failed";
            }
            return "File uploaded successfully";
        }
    }
}
