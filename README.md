# [Google I/O 2014 Experiment](https://www.google.com/events/io/experiment) (Codename: Sagan)

Google asked us to create an interactive experience for the I/O site that would get people excited for the conference and feature the best technology on the web. We decided to explore the power that technology has to transform the world around us—from the subatomic realm to the expansive universe. We created a journey to the edges of the galaxy and back that the user can manipulate, effect and interact with in delightful ways. Into the code itself, we embedded small jokes that in-the-know users quickly discovered and widely shared. 

Now, we're sharing that code on Github to show the scope of the development and hopefully allow others to learn a thing or two.

## Running the Experiment

The entire experiment is already compiled and ready to explore. Simply start a local web server and load `http://localhost:8000/` in your mobile or desktop browser of choice.

```
cd static && python -m SimpleHTTPServer
```

## Building the Experiment

If you wish to make changes to the source code and see them in action, you'll need to install a few build tools. Make sure Node.js and Ruby are installed and then you can install our development depenencies: 

```
npm install
bundle install
```

Once you've made a change, run the build script, which uses a bundled copy of Google's Closure Compiler:

```
grunt
```

Now you can reload your browser to see the changes.

## Technology

The experiment was built on Three.js using the CSS3DRenderer to run on both desktop on mobile. The majority of the visual assets are SVGs, which we dynamically chop up to allow folding.

### Metrics

```
------------------------------------------
Language     files     comment        code
------------------------------------------
Javascript      58        2433        8153
SASS             4         153        1048
------------------------------------------
SUM:            62        2586        9201
------------------------------------------
```

### Third-party Libraries

* [Greensock TweenMax](http://www.greensock.com)
* [Three.js](http://threejs.org) + [CSS3D Renderer](https://github.com/mrdoob/three.js/blob/master/examples/js/renderers/CSS3DRenderer.js)
* [innersvg.js](https://code.google.com/p/innersvg/)
* [Hammer.js](http://hammerjs.github.io)
* [Modernizr](http://modernizr.com)
