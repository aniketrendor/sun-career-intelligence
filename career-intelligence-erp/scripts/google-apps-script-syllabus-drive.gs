/**
 * ============================================================================
 * SANDIP UNIVERSITY CAREER INTELLIGENCE ERP
 * Google Apps Script - Google Drive PDF Syllabus Storage Web App
 * ============================================================================
 * 
 * Deployment Instructions:
 * 1. Open Google Drive (drive.google.com) using your university administrator account.
 * 2. Create a new Google Apps Script at: https://script.google.com/home
 * 3. Replace all code in Code.gs with this entire file.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Execute as: "Me" (your admin Google account).
 * 7. Who has access: "Anyone" (allows the ERP backend to upload approved syllabi).
 * 8. Copy the Web App URL and add it to your .env.local:
 *    GOOGLE_APPS_SCRIPT_WEBAPP_URL="https://script.google.com/macros/s/.../exec"
 */

const ROOT_FOLDER_NAME = "Sandip_University_Approved_Syllabi";

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var programCode = data.programCode || "GENERAL";
    var programName = data.programName || "Degree Program";
    var semesterNumber = data.semesterNumber || "Full";
    var uploadType = data.uploadType || "full";
    var filename = data.filename || (programCode + "_" + uploadType + ".pdf");
    var base64Content = data.base64Content;
    var mimeType = data.mimeType || "application/pdf";

    if (!base64Content) {
      return jsonResponse({
        success: false,
        error: "Missing base64Content for PDF file"
      }, 400);
    }

    // 1. Get or create root syllabus folder in Google Drive
    var rootFolder = getOrCreateFolder(ROOT_FOLDER_NAME);

    // 2. Get or create program folder (e.g. SUN-020)
    var programFolder = getOrCreateSubFolder(rootFolder, programCode + " - " + programName);

    // 3. Decode base64 and create PDF file
    var decodedBytes = Utilities.base64Decode(base64Content);
    var blob = Utilities.newBlob(decodedBytes, mimeType, filename);
    var file = programFolder.createFile(blob);

    // 4. Set permissions: Anyone with link can view (needed for student & mentor preview)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var viewUrl = file.getUrl();
    var previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    var downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;

    return jsonResponse({
      success: true,
      fileId: fileId,
      filename: filename,
      viewUrl: viewUrl,
      previewUrl: previewUrl,
      downloadUrl: downloadUrl,
      programCode: programCode,
      semesterNumber: semesterNumber,
      uploadType: uploadType,
      uploadedAt: new Date().toISOString()
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    }, 500);
  }
}

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "check") {
    var fileId = e.parameter.fileId;
    try {
      var file = DriveApp.getFileById(fileId);
      return jsonResponse({
        success: true,
        fileId: file.getId(),
        name: file.getName(),
        size: file.getSize(),
        previewUrl: "https://drive.google.com/file/d/" + file.getId() + "/preview",
        downloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId()
      });
    } catch (err) {
      return jsonResponse({ success: false, error: "File not found or private" }, 404);
    }
  }

  return jsonResponse({
    status: "ACTIVE",
    service: "Sandip University Google Drive Syllabus Storage WebApp",
    timestamp: new Date().toISOString()
  });
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function getOrCreateSubFolder(parentFolder, subFolderName) {
  var subFolders = parentFolder.getFoldersByName(subFolderName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }
  return parentFolder.createFolder(subFolderName);
}

function jsonResponse(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
