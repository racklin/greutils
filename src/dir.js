/**
 * This is a set of utility functions that provide common directory operations
 * on the local file system in a platform-independent manner.
 *
 * @public
 * @name GREUtils.Dir
 * @namespace GREUtils.Dir
 */
GREUtils.define('GREUtils.Dir');


/**
 * Returns an nsILocalFile instance representing the given file.
 *
 * Bt setting autoCreate to "true", this method will attempt to create the file
 * with default permissions if the file does not already exists.
 *
 * If the file does not exist and is not/cannot be created, null will be returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the file path
 * @param {Boolean} autoCreate          This flag indicates whether to create the file if it does not exist; false by default
 * @return {nsILocalFile}               The given file, or null if the file does not exist and is not/cannot be created
 */
GREUtils.Dir.getFile = function(aPath){
    var autoCreate = arguments[1] || false;
    if (/^file:/.test(aPath))
        aPath = aPath.replace("file://", "");
    var obj = GREUtils.XPCOM.createInstance('@mozilla.org/file/local;1', 'nsILocalFile');
    obj.initWithPath(aPath);
    if (obj.exists())
        return obj;
    else
        if (autoCreate) {
            try {
                obj.create(GREUtils.File.DIRECTORY_TYPE, GREUtils.File.DIR_DEFAULT_PERMS);
                return obj;
            }
            catch (ex) {
                return null;
            }
        }
        else {
            return null;
        }
};


/**
 * Creates a new file at the given path with default permissions and returns
 * an nsILocalFile instance representing the file.
 *
 * If the file already exists, that file is returned. If the file cannot be created,
 * null is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the file path
 * @return {nsILocalFile}               The file, or null if the file does not exist and is not/cannot be created
 */
GREUtils.Dir.create = function(aPath){
	return GREUtils.Dir.getFile(aPath, true);
};


/**
 * Removes a directory.
 *
 * If "aRecursive" is false, then the directory must be empty before it can be deleted.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the directory path
 * @param {Boolean} aRecursive          This flag indicates if directory is to be deleted if it is not empty
 * @return {Number}                    void  : directory is successfully removed
 *                                      -1    : path does not exist
 *                                      -2    : aPath is not a directory
 *                                      -3    : delete fails
 */
GREUtils.Dir.remove = function(aPath, aRecursive){
	var dir = GREUtils.Dir.getFile(aPath);
	if(dir == null) return -1;

    if(!dir.isDirectory()) return -2;

	try {
		return dir.remove(aRecursive);
	}catch (e){
		GREUtils.log('[Error] GREUtils.Dir.remove: '+e.message);
		return -3;
	}
};


/**
 * Tests whether a file is a descendant of a directory.
 *
 * This method will also return false if either file or the directory does not exist.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the directory to test
 * @param {String} aFile                This is the full path of the file to test
 * @return {Boolean}                    Returns true if the file is a descendant of the directory, false otherwise
 */
GREUtils.Dir.contains = function(aPath, aFile){
	var dir = GREUtils.Dir.getFile(aPath);
	var file = GREUtils.File.getFile(aFile);

	if(dir == null || file == null) return false;

    if(!dir.isDirectory()) return false;
	
	if(!dir.isFile()) return false;

	try {
		return dir.contains(aFile, true);
	}catch (e){
		GREUtils.log('[Error] GREUtils.Dir.contains: '+e.message);
		return false;
	}
};


/**
 * Reads directory entries recursively.
 *
 * This method returns the directory entries as an array. Each array
 * element can be a string representing a file, or an array representing
 * a sub-directory. Directory entries are read recursively.
 *
 * If the given path is not a directory an empty array is returned.
 *
 * @public
 * @static
 * @function
 * @param {String} aPath                This is the directory path
 * @return {Object}                     Returns the directory entries as an array of strings containing file paths
 */
GREUtils.Dir.readDir = function(aPath){

	var fileInst = GREUtils.Dir.getFile(aPath);
    var rv = [];
	if (fileInst == null) return rv;

    try {

	  if (!fileInst.exists()) return rv;

      if (!fileInst.isDirectory()) return rv;

      var files     = fileInst.directoryEntries;
      var file;

      while (files.hasMoreElements())
      {
        file = files.getNext();
		file = GREUtils.XPCOM.queryInterface(file, "nsILocalFile");

		if (file.isFile()) rv.push(file);

        if (file.isDirectory())
          rv.push(GREUtils.Dir.readDir(file.path));
      }

    } catch(e) {
		GREUtils.log('[Error] GREUtils.Dir.readDir: '+e.message);
	}

    return rv;

};
