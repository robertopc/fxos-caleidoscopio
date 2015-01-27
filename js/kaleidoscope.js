window.onload = function() {

    var parameters = ( function ( src ) {
        var params = {}, qryStr = src.split( '?' )[ 1 ];
        if( qryStr ) {
            for( i in qryStr.split( '&' ) ) {
                var p = qryStr.split( '&' )[i];
                var ps = p.replace( /\/$/, '' ).split( '=' );
                var k = ps[ 0 ].replace( /^\?/, '' );
                params[ k ] = ps[ 1 ] || true;
            }
        }
        return params;
    })( location.search );

    var x = 0;
    var y = 0;

    var auto;
    var auto_x = 0;
    var auto_y = 0;
    var auto_throttle;

    // PARAMETER: *s* is the speed of the automatic timeout animation.
    var s = parameters.s || 3;

    // PARAMETER: *n* is the number of segments.
    var n = ~~parameters.n || 6;

    var $kaleidescope = document.getElementById( 'kaleidoscope' );
        $kaleidescope.className = ' n' + n

    var $image = [];

    if ( n ) {
        for ( var i = 0; i <= n * 2; i++ ) {
            var tile = document.createElement('div');
                tile.className = 'tile t'+ i;

            $image[i] = document.createElement('div');
            $image[i].className = 'image';

            tile.appendChild( $image[i] );
            $kaleidescope.appendChild( tile );
        }
    }

    var k = $kaleidescope;

    // PARAMETER: *src* is the URL for an alternate image.
    var src = parameters.src;
    if ( src ) {
        for( i in $image ) {
            $image[i].style.backgroundImage = [ 'url(', decodeURIComponent( src ), ')' ].join( '' );
        }
    }

    // PARAMETER: *clean* hides the Github and fullscreen links.
    var clean = parameters.clean;
    if ( clean ) {
        document.body.className += ' clean';
    }

    // PARAMETER: *opacity* sets opacity (0.0 -> 1.0).
    var opacity = parseFloat( parameters.opacity );
    if ( opacity ) {
        $kaleidescope.style.opacity = 0;
        window.setInterval( function(){ $kaleidescope.style.opacity = opacity }, 3000 );
    }

    // PARAMETER (undocumented): *mode* changes the animation style.
    var mode = ~~parameters.mode || 2;

    // Project changes in cursor (x, y) onto the image background position.
    $kaleidescope.onmousemove = function ( e ) {
        x++;
        y++;

        var nx = e.pageX, ny = e.pageY;
        switch ( mode ) {
            case 1:
                nx = -x;
                ny = e.pageY;
                break;
            case 2:
                nx = e.pageX;
                ny = -y;
                break;
            case 3:
                nx = x;
                ny = e.pageY;
                break;
            case 4:
                nx = e.pageX;
                ny = y;
                break;
            case 5:
                nx = x;
                ny = y;
                break;
        }

        move( nx, ny );
        auto = auto_throttle = false;
    }

    // An alternate image can be supplied via Dragon Drop.
    if ( 'draggable' in document.createElement('b') && window.FileReader ) {
        k.ondragenter = k.ondragover = function( e ) {
            e.preventDefault();
        };

        k.ondrop = function( e ) {
            readFile( e.dataTransfer.files[0] );
            e.preventDefault();
        };
    }

    function readFile( file ) {
        var r = new FileReader();
        if ( !file.type.match('image\/.*') ) {
            return false;
        }

        r.onload = function( e ) {
            for( i in $image ) {
                $image[i].style.backgroundImage = [ 'url(', e.target.result, ')' ].join( '' );
            }
        };

        r.readAsDataURL( file );
    }

    // Animate all the things!
    window.requestAnimationFrame = ( function( window ) {
        var suffix = "equestAnimationFrame",
        rAF = [ "r", "webkitR", "mozR" ].filter( function( val ) {
            return val + suffix in window;
        })[ 0 ] + suffix;

        return window[ rAF ]  || function( callback ) {
            window.setTimeout( function() {
                callback( +new Date() );
            }, 1000 / 60 );
        };
    })( window );

    function animate() {
        var time = new Date().getTime() * [ '.0000', s ].join( '' );
        auto_x = Math.sin( time ) * document.body.clientWidth;
        auto_y++;

        move( auto_x, auto_y );
        if ( auto ) requestAnimationFrame( animate );
    }

    function move( x, y ) {
        for( i in $image ) {
            $image[i].style.backgroundPosition = x + 'px '+ y + 'px';
        }
    }

    // Timer to check for inactivity
    (function timer() {
        setTimeout( function() {
            timer();
            if( auto && !auto_throttle ) {
                animate();
                auto_throttle = true;
            } else {
                auto = true;
            }
        }, 5000 );
    })();
}