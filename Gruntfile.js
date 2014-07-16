'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'meta': {
      publicDir: 'static',
      distDir: 'static',
    },

    'concat': {
      experiment:{
        src: ['static/js/experiment-deps.js', 'static/js/experiment/core.js'],
        dest: 'static/js/experiment.js'
      },
      libsProd: {
        src: ['static/js/vendor/gsap/TweenMax.min.js'],
        dest: 'static/js/libs.min.js'
      },
      expProd: {
        src: ['static/js/vendor/Three.min.js', 'static/js/vendor/CSS3DRenderer.min.js', 'static/js/vendor/CSS3DRendererIE.js', 'static/js/vendor/innersvg.min.js', 'static/js/vendor/hammerjs/hammer.min.js', 'static/js/experiment.combo.js'],
        dest: 'static/js/experiment.min.js'
      }
    },

    'compass': {
      prod: {
        options: {
          basePath: '<%= meta.publicDir %>',
          cssDir: 'css',
          sassDir: 'sass',
          imagesDir: 'images',
          outputStyle: 'compressed',
          relativeAssets: true,
          noLineComments: true,
          environment: 'production',
          force: true
        }
      }
    },

    'gjslint': {
      options: {
        flags: [
          '--exclude_files=static/js/experiment/svgs.js,static/js/experiment/messages.js,static/js/experiment/chapters/debugger.js,static/js/experiment/svg-sources.js,static/js/experiment/entities/boson/poly.js'
        ],
        reporter: {
          name: 'console'
        }
      },
      experiment: {
        src: ['<%= meta.publicDir %>/js/experiment/**/*.js', '!<%= meta.publicDir %>/js/experiment/experiment.js', '!<%= meta.publicDir %>/js/experiment/svgs.js'] // ignore auto-generated experiment.js
      }
    },

    shell: {
      options: {
        stdout: true,
        stderr: true,
        failOnError: true
      },
      expProd: {
        command: 'static/js/closure/library/closure/bin/build/closurebuilder.py --root=static/js/closure/ --root=static/js/experiment/ --namespace="exp" --compiler_flags="--externs" --compiler_flags="externs/three.js" --compiler_flags="--externs" --compiler_flags="externs/tween.js" --compiler_flags="--externs" --compiler_flags="externs/hammer.js"  --compiler_flags="--externs" --compiler_flags="externs/css3drenderer.js" --compiler_flags="--externs" --compiler_flags="externs/audio.js" --compiler_flags="--externs" --compiler_flags="externs/morlock.js" --output_mode=compiled --compiler_jar=static/js/closure/compiler/compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" > static/js/experiment.combo.js'
      }
    },

    svgrender: {
      build: {
        basePath: 'svg-source/',
        src: 'svg-source/**/*.svg',
        dest: '<%= meta.publicDir %>/js/experiment'
      }
    }
  });

  grunt.loadNpmTasks('grunt-gjslint');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('prod', ['svgrender', 'compass:prod', 'shell:expProd', 'concat:libsProd', 'concat:expProd']);
  grunt.registerTask('default', ['prod']);

  grunt.registerMultiTask('svgrender', 'Convert PO files to JSON format', function() {
    var fs = require('fs');
    var path = grunt.config('svgrender').build.basePath;
    var done = this.async();
    this.files.forEach(function(file) {

      var total = file.src.length;
      var loaded = 0;
      var strings = [];
      grunt.log.writeln('Processing ' + file.src.length + ' SVG files.');
      file.src.forEach(function(f){
        grunt.log.write('.');
        fs.readFile(f, function(err, data) {
          var str = data.toString();
          var matches = str.match(/<use xlink:href="([^"]*)"/g);
          for (i in matches) {
            var name = matches[i].substring(18, matches[i].length - 1);
            var index = str.indexOf('href="#' + name);
            var newStr = str.substring(0, index-11);
            var endStr = str.substring(str.indexOf('/>', newStr.length+1)+2);
            var idOffset = newStr.indexOf('id="' + name);
            var idIndex = newStr.indexOf('<', 0);
            while (idIndex != -1) {
              var newIndex = newStr.indexOf('<', idIndex+1)
              if (newIndex > idOffset) {
                break;
              }
              idIndex = newIndex;
            }
            var clipPath = newStr.substring(idIndex, newStr.indexOf('>', idIndex)+1);
            str = newStr.replace(clipPath, '') + clipPath + endStr;

          }
          var openSVGstart = str.indexOf('<svg');
          var viewBoxStart = str.indexOf('viewBox', openSVGstart);
          var viewBox = '';
          if (viewBoxStart !== -1) {
            var viewBoxStartQuote = str.indexOf('"', viewBoxStart);
            var viewBoxEndQuote = str.indexOf('"', viewBoxStartQuote+1);
            viewBox = str.substring(viewBoxStartQuote+1, viewBoxEndQuote);
          }
          var openSVGend = str.indexOf('>', openSVGstart);
          var closeSVG = str.indexOf('</svg>', openSVGend);
          var contents = str.substring(openSVGend+1, closeSVG);
          strings.push({
            'filename': f.toString().replace(path, '').replace(/[-\/_]/g, '-').replace('.svg', ''),
            'contents': contents.replace(/\r?\n/g, '').replace(/"'/g, '"').replace(/'"/g, '"'),
            'viewBox': viewBox
          })
          if (++loaded === total) {
            var fileContents = '';
            for (var i in strings) {
              fileContents += '\t\t\'' + strings[i].filename + '\' : {\r\t\t\t\'html\': \'' + strings[i].contents + '\',\r\t\t\t\'viewBox\': \'' + strings[i].viewBox + '\'\r\t\t},\r';
            }
            fs.readFile(file.dest + '/svgs-template.js', function(err, data) {
              var finalStr = 'goog.provide(\'exp.Svgs\');\r\r' + data.toString();
              finalStr = finalStr.replace('.sources_ = {}', '.sources_ = {\r' + fileContents.substring(0, fileContents.length-2) + '\r\t}');
              fs.writeFile(file.dest + '/svgs.js', finalStr);
              grunt.log.writeln('');
              grunt.log.writeln('Finished processing SVG files.');
              done();
            });
          }
        });
      });
    });
  });
}
