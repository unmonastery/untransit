var fs    = require('fs'),
    path  = require("path"),
    csv   = require('ya-csv'),
    async = require('async'),
    _     = require('lodash');

// recursive rmdir
// from https://gist.github.com/tkihira/2367067
var rmdir = function(dir) {
	var list = fs.readdirSync(dir);
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);

		if(filename == "." || filename == "..") {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
};

module.exports = function(grunt){

  var config;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    update_submodules: {
        default: {
            options: {
                // default command line parameters will be used: --init --recursive
            }
        },
        withCustomParameters: {
            options: {
                params: "--force" // specifies your own command-line parameters
            }
        },
        withNoParameter: {
            options: {
                params: false // blanks command-line parameters
            }
        }
    }
  });

  config = grunt.config('pkg').config;

  /**
   *  transform csv files into json files
   */
  grunt.registerTask('csv2json', function(){
    var dirs = fs.readdirSync( config.csvDir ),
        done = this.async(),
        tasks = [];
    _.each(dirs, function(dir){
      if ( fs.lstatSync(config.csvDir + '/' + dir).isDirectory() ){
        var files = fs.readdirSync( config.csvDir + '/' + dir ),
            destDir = config.jsonDir + '/' + dir;
        if ( fs.existsSync(destDir) ){
          rmdir( destDir );
        }
        fs.mkdirSync( destDir );
        _.each(files, function(file, index){
          var src = config.csvDir + '/' + dir + '/' + file,
              dest = config.jsonDir + '/' + dir + '/' + file;
          if ( fs.lstatSync(src).isFile() ){

            tasks.push( function(callback){
              var temp = [],
              reader = csv.createCsvFileReader(src, {
                // dirty fix, with default quote " gives error, I do not know why
                quote:'$',
                columnsFromHeader: true
              });
              reader.addListener('data', function(data) {
                temp.push(data);
              });
              reader.addListener('end', function() {
                fs.appendFileSync(dest, JSON.stringify(temp, null, '\t'));
                callback(null, true);
              });

            });

          }
        });
      }
    });

    // execute file parsing in parallel
    async.parallel(tasks, function(err, result){
      if (err){
        return console.error(err);
      }
      done();
    });

  });

  grunt.loadNpmTasks("grunt-update-submodules");

  grunt.registerTask('default', ['update_submodules']);

};
