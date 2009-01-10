// ***** BEGIN LICENSE BLOCK *****
// Version: MPL 1.1/GPL 2.0/LGPL 2.1
// 
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
// 
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
// 
// The Original Code is Mozilla Corporation Code.
// 
// The Initial Developer of the Original Code is
// Adam Christian.
// Portions created by the Initial Developer are Copyright (C) 2008
// the Initial Developer. All Rights Reserved.
// 
// Contributor(s):
//  Adam Christian <adam.christian@gmail.com>
//  Mikeal Rogers <mikeal.rogers@gmail.com>
// 
// Alternatively, the contents of this file may be used under the terms of
// either the GNU General Public License Version 2 or later (the "GPL"), or
// the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
// in which case the provisions of the GPL or the LGPL are applicable instead
// of those above. If you wish to allow use of your version of this file only
// under the terms of either the GPL or the LGPL, and not to allow others to
// use your version of this file under the terms of the MPL, indicate your
// decision by deleting the provisions above and replace them with the notice
// and other provisions required by the GPL or the LGPL. If you do not delete
// the provisions above, a recipient may use your version of this file under
// the terms of any one of the MPL, the GPL or the LGPL.
// 
// ***** END LICENSE BLOCK *****

var EXPORTED_SYMBOLS = ["openFile", "saveFile", "saveAsFile", "genBoiler", 
                        "getFile", "Copy", "getWindows", "runEditor", 
                        "runFile", "getWindowByTitle", "tempfile"];

// var jstest = {}; 
// Components.utils.import('resource://mozmill/modules/jstest.js', jstest);
var uuidgen = Components.classes["@mozilla.org/uuid-generator;1"]
    .getService(Components.interfaces.nsIUUIDGenerator);

function Copy (obj) {
  for (n in obj) {
    this[n] = obj[n];
  }
}

function getWindows(type) {
  if (type == undefined) {
      var type = "";
  }
  var windows = []
  var enumerator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator)
                     .getEnumerator(type);
  while(enumerator.hasMoreElements()) {
    windows.push(enumerator.getNext());
  }
  return windows;
}

function getWindowByTitle(title) {
  for each(w in getWindows()) {
    if (w.document.title && w.document.title == title) {
      return w;
    }
  }
}

function tempfile(appention) {
  if (appention == undefined) {
    var appention = "mozmill.utils.tempfile"
  }
	var tempfile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
	tempfile.append(uuidgen.generateUUID().toString().replace('-', '').replace('{', '').replace('}',''))
	tempfile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	tempfile.append(appention);
	tempfile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
	// do whatever you need to the created file
	return tempfile.clone()
}

var checkChrome = function() {
   var loc = window.document.location.href;
   try {
       loc = window.top.document.location.href;
   } catch (e) {}

   if (/^chrome:\/\//.test(loc)) { return true; } 
   else { return false; }
}
/*var openFile = function(){
 const nsIFilePicker = Components.interfaces.nsIFilePicker;

 var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
 fp.init(window, "Select a Test Directory", nsIFilePicker.modeGetFolder);

 var rv = fp.show();
 if (rv == Components.interfaces.nsIFilePicker.returnOK){
   // file is the given directory (nsIFile)
   var array = [];
   //iterate directories recursively
   recurseDir = function(ent){
       var entries = ent;
       while(entries.hasMoreElements())
       {
         var entry = entries.getNext();
         entry.QueryInterface(Components.interfaces.nsIFile);
         if ((entry.isDirectory()) && (entry.path.indexOf('.svn') == -1)){
           recurseDir(entry.directoryEntries);
         }
         //push js files onto the array
         if (entry.path.indexOf('.js') != -1){
           array.push(entry.path);
         }
       }
   }
   //build the files array
   recurseDir(fp.file.directoryEntries);
   paramObj = {};
   paramObj.files = array;
   mozmill.MozMillController.commands.jsTests(paramObj);
 }*/
 
 var genBoiler = function(w){
   w.document.getElementById('editorInput').value = '' +
   "var mozmill = {}; Components.utils.import('resource://mozmill/modules/mozmill.js', mozmill);\n" +
   "var elementslib = {}; Components.utils.import('resource://mozmill/modules/elementslib.js', elementslib);\n" +
   "\n" +
   "var setupModule = function(module) {\n" +
   "  module.controller = mozmill.getBrowserController();\n" +
   "}\n" +
   "\n" +
   "var testFoo = function(){\n" +
   "  controller.open('http://www.google.com');\n" +
   "}\n"
 }
 var runFile = function(w){
   //define the interface
   var nsIFilePicker = Components.interfaces.nsIFilePicker;
   var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
   //define the file picker window
   fp.init(w, "Select a File", nsIFilePicker.modeOpen);
   fp.appendFilter("JavaScript Files","*.js");
   //show the window
   var res = fp.show();
   //if we got a file
   if (res == nsIFilePicker.returnOK){
     var thefile = fp.file;
     //create the paramObj with a files array attrib
     var paramObj = {};
     paramObj.files = [];
     paramObj.files.push(thefile.path);

     //Move focus to output tab
     //w.document.getElementById('mmtabs').setAttribute("selectedIndex", 2);
     //send it into the JS test framework to run the file
     // jstest.runFromFile(thefile.path);
   }
 };
 
 var runEditor = function(w){
   var data = w.document.getElementById('editorInput').value;
   //Move focus to output tab
   //w.document.getElementById('mmtabs').setAttribute("selectedIndex", 2);
   //send it into the JS test framework to run the file   
   // jstest.runFromString(data);
 };

 var saveFile = function(w){
   //define the file interface
   var file = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
   //point it at the file we want to get at
   file.initWithPath(w.openFn);
   
   // file is nsIFile, data is a string
   var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                            .createInstance(Components.interfaces.nsIFileOutputStream);

   // use 0x02 | 0x10 to open file for appending.
   foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
   // write, create, truncate
   // In a c file operation, we have no need to set file mode with or operation,
   // directly using "r" or "w" usually.
   var data = w.document.getElementById('editorInput').value;
   foStream.write(data, data.length);
   foStream.close();
 };
 
  var saveAsFile = function(w){
     //define the interface
     var nsIFilePicker = Components.interfaces.nsIFilePicker;
     var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
     //define the file picker window
     fp.init(w, "Select a File", nsIFilePicker.modeSave);
     fp.appendFilter("JavaScript Files","*.js");
     //show the window
     var res = fp.show();
     //if we got a file
     if (res == nsIFilePicker.returnOK){
       var thefile = fp.file;
       // file is nsIFile, data is a string
       var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                               .createInstance(Components.interfaces.nsIFileOutputStream);

       // use 0x02 | 0x10 to open file for appending.
       foStream.init(thefile, 0x02 | 0x08 | 0x20, 0666, 0); 
       // write, create, truncate
       // In a c file operation, we have no need to set file mode with or operation,
       // directly using "r" or "w" usually.
       var data = w.document.getElementById('editorInput').value;
       foStream.write(data, data.length);
       foStream.close();
      
       return thefile.path;
     }
  };
  
 var openFile = function(w){
    //define the interface
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    //define the file picker window
    fp.init(w, "Select a File", nsIFilePicker.modeOpen);
    fp.appendFilter("JavaScript Files","*.js");
    //show the window
    var res = fp.show();
    //if we got a file
    if (res == nsIFilePicker.returnOK){
      var thefile = fp.file;
      //create the paramObj with a files array attrib
      var data = getFile(thefile.path);
      w.document.getElementById('editorInput').value = data;
      //Move focus to output tab
      //$('mmtabs').setAttribute("selectedIndex", 2);
      //send it into the JS test framework to run the file
      //mozmill.utils.jsTests(paramObj);
      //jsTest.runFromString(thefile.path);
      return thefile.path;
    }
  };
  
 var getFile = function(path){
   //define the file interface
   var file = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
   //point it at the file we want to get at
   file.initWithPath(path);
   // define file stream interfaces
   var data = "";
   var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                           .createInstance(Components.interfaces.nsIFileInputStream);
   var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                           .createInstance(Components.interfaces.nsIScriptableInputStream);
   fstream.init(file, -1, 0, 0);
   sstream.init(fstream); 

   //pull the contents of the file out
   var str = sstream.read(4096);
   while (str.length > 0) {
     data += str;
     str = sstream.read(4096);
   }

   sstream.close();
   fstream.close();

   //data = data.replace(/\r|\n|\r\n/g, "");
   return data;
 }
 // 
 // //Function to start the running of jsTests
 // var jsTests = function (paramObj) {
 //     //Setup needed variables
 //     mozmill.jsTest.actions.loadActions();
 //     var wm = mozmill.jsTest.actions;
 //     var testFiles = paramObj.files;
 //     if (!testFiles.length) {
 //       throw new Error('No JavaScript tests to run.');
 //     }
 //     var _j = mozmill.jsTest;
 //     //mozmill.MozMillController.stopLoop();
 // 
 //     //Timing the suite
 //     var jsSuiteSummary = new TimeObj();
 //     jsSuiteSummary.setName('jsSummary');
 //     jsSuiteSummary.startTime();
 //     _j.jsSuiteSummary = jsSuiteSummary;
 // 
 //     _j.run(paramObj);
 // };
 // 
 // //Commands function to hande the test results of the js tests
 // var jsTestResults = function () {
 //   var _j = mozmill.jsTest;
 //   var jsSuiteSummary = _j.jsSuiteSummary;
 //   var s = '';
 //   s += 'Number of tests run: ' + _j.testCount + '\n';
 //   s += '\nNumber of tests failures: ' + _j.testFailureCount;
 //   if (_j.testFailureCount > 0) {
 //     s += 'Test failures:<br/>';
 //     var fails = _j.testFailures;
 //     for (var i = 0; i < fails.length; i++) {
 //       var fail = fails[i];
 //       var msg = fail.message;
 //       // Escape angle brackets for display in HTML
 //       msg = msg.replace(/</g, '&lt;');
 //       msg = msg.replace(/>/g, '&gt;');
 //       s += msg + '<br/>';
 //     }
 //   };
 // 
 //   jsSuiteSummary.endTime();
 //   var result = !(_j.testFailureCount > 0);
 // 
 //   if (result){
 //      mozmill.results.writeResult(s, 'lightgreen');
 //    }
 //    else{
 //      mozmill.results.writeResult(s, 'lightred');
 //    }
 //   //mozmill.results.writeResult(s);
 //   //We want the summary to have a concept of success/failure
 //   var result = !(_j.testFailureCount > 0);
 //   var method = 'JS Test Suite Completion';
 //   //mozmill.jsTest.sendJSReport(method, result, null, jsSuiteSummary);
 //   // Fire the polling loop back up
 //   //mozmill.MozMillController.continueLoop();
 // }; 