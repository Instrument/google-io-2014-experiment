THREE.CSS3DRendererIE = function ( el ) {

  console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

  var _width, _height;
  var _widthHalf, _heightHalf;
  var _projector = new THREE.Projector();
  var _tmpMatrix = new THREE.Matrix4();

  var _vector3 = new THREE.Vector3();
  var _viewProjectionMatrix = new THREE.Matrix4();
  var _viewMatrix = new THREE.Matrix4();


  this.init = function(el) {

    // attach to existing element or create a new one
    this.domElement = el || document.createElement( 'div' );

    this.domElement.style.overflow = 'hidden';
    setStyle( this.domElement, 'perspectiveOrigin', '50% 50% 0');
    setStyle( this.domElement, 'transformOrigin', '50% 50% 0');
  };

  this.getObjects = function(list, node) {

    node.updateMatrixWorld();
    list.push(node);
    for(var i = 0; i < node.children.length; i++){
      this.getObjects(list, node.children[i]);
    }
  };

  this.render = function ( scene, camera ) {

    camera.matrixWorldInverse.getInverse( camera.matrixWorld )
    camera.updateMatrixWorld();
    var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;

    setStyle( this.domElement, 'perspective', fov + "px");

    var objects = [];

    this.getObjects(objects, scene);

    var view_matrix =
      "translate3d(-50%, -50%, 0) " +
      "translate3d(" + _widthHalf + "px," + _heightHalf + "px, " + fov + "px) " +
      getCameraCSSMatrix( camera.matrixWorldInverse );
    for ( var i = 0, il = objects.length; i < il; i ++ ) {

      var object = objects[ i ];

      if ( object instanceof THREE.CSS3DObject ) {

        var element = object.element;

        if ( element.parentNode !== this.domElement ) {
          this.domElement.appendChild( element );
        }
        
        if (object['visible'] !== false) {
          if (object.wasVisible === false) {
            element.style.visibility = 'visible';
            object.wasVisible = true;
          }

          if ( object instanceof THREE.CSS3DSprite ) {

            // http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

            _tmpMatrix.copy( camera.matrixWorldInverse );
            _tmpMatrix.transpose();
            _tmpMatrix.extractPosition( object.matrixWorld );
            _tmpMatrix.scale( object.scale );

            _tmpMatrix.elements[ 3 ] = 0;
            _tmpMatrix.elements[ 7 ] = 0;
            _tmpMatrix.elements[ 11 ] = 0;
            _tmpMatrix.elements[ 15 ] = 1;

          } else {

            _tmpMatrix.copy( object.matrixWorld  );
          }

          setStyle(element, 'transform', view_matrix + getObjectCSSMatrix( _tmpMatrix ));


          // apply depth sorting.
          element.style.zIndex = Math.round( getMatrixForElement( element ).elements[14] * 1000 );

        } else {
          if (object.wasVisible !== false) {
            element.style.visibility = 'hidden';
            object.wasVisible = false;
          }
        }
      }

    }

  };


  this.setSize = function ( width, height ) {

    _width = width;
    _height = height;

    _widthHalf = _width / 2;
    _heightHalf = _height / 2;

    this.domElement.style.width = width + 'px';
    this.domElement.style.height = height + 'px';

  };

  var epsilon = function ( value ) {

    return Math.abs( value ) < 0.000001 ? 0 : value;

  };

  // apply prefixed styles to dom element
  var setStyle = function ( el, name, value, prefixes ) {

    prefixes = prefixes || [ "Webkit", "Moz", "O", "Ms" ];
    var n = prefixes.length;

    while ( n-- ) {
      var prefix = prefixes[n];
      el.style[ prefix + name.charAt( 0 ).toUpperCase() + name.slice( 1 ) ] = value;
      el.style[ name ] = value;
    }

  };

  // get prefixed computed css property
  var getComputedProperty = function ( element, property_name ) {

    var computedStyle = window.getComputedStyle( element, null );

    return computedStyle.getPropertyValue(  property_name ) ||
      computedStyle.getPropertyValue( '-webkit-' + property_name ) ||
      computedStyle.getPropertyValue( '-moz-' + property_name ) ||
      computedStyle.getPropertyValue( '-o-' + property_name ) ||
      computedStyle.getPropertyValue( '-ms-' + property_name );

  };

  // returns Matrix4 representing the currently applied CSS3 transform
  var getMatrixForElement = function ( element ) {

    var matrix = new THREE.Matrix4();
    var matrix_elements = getComputedProperty(element, 'transform').replace( 'matrix3d(', '' ).replace( ')', '' ).split( ',' );
    matrix_elements = matrix_elements.map( function ( n ) { return Number( n ); } );
    matrix.set.apply( matrix, matrix_elements );
    matrix.transpose();
    return matrix;

  };

  var getCameraCSSMatrix = function ( matrix ) {

    var elements = matrix.elements;

    return 'matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( - elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( elements[ 4 ] ) + ',' +
      epsilon( - elements[ 5 ] ) + ',' +
      epsilon( elements[ 6 ] ) + ',' +
      epsilon( elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( - elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( - elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ') ';

  };

  var getObjectCSSMatrix = function ( matrix ) {

    var elements = matrix.elements;

    return 'matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( - elements[ 4 ] ) + ',' +
      epsilon( - elements[ 5 ] ) + ',' +
      epsilon( - elements[ 6 ] ) + ',' +
      epsilon( - elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ') ';

  };

  // detect support for transfor-style: preserve-3d
  var hasPreserve3d = function () {

    // create test element
    var test_el = document.createElement('div' );
    test_el.style.display = 'none';
    setStyle( test_el, 'transformStyle', 'preserve-3d');

    // add to body so we can get computed style
    document.getElementsByTagName('body')[0].appendChild( test_el );
    var val = getComputedProperty(test_el, 'transform-style');
    test_el.parentElement.removeChild( test_el );

    return val == 'preserve-3d';

  }

  this.init(el);
};