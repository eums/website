//= require vendor/es6-promise-2.0.1.min.js

ImageFader = (function() {

var Promise = ES6Promise.Promise

var DEBUG = true
function debug() {
  if (DEBUG) {
    var args = Array.prototype.slice.call(arguments)
    console.log.apply(console, ['debug:'].concat(args))
  }
}

function imageFader(elementId, imageUrls) {
  var element = document.getElementById(elementId)
  var loadedImages = loadImages(imageUrls)
  var images = [containedImage(element)].concat(loadedImages)

  appendChildren(loadedImages, element)
  startFader(images)
}

function containedImage(element) {
  if (element.children[0] instanceof HTMLImageElement) {
    return element.children[0]
  } else {
    throw new Error('Couldn\'t find an appropriate child image')
  }
}

function loadImages(urls) {
  return urls.map(loadImage)
}

function loadImage(url) {
  var image = new Image()
  image.src = url

  image.onload = function() {
    image._succeeded = true
  }

  image.style.opacity  = 0
  image.style.zIndex   = nextZIndex()

  return image
}

// start at 2 as 0 and 1 have gone already.
var zIndex = 2
function nextZIndex() {
  return zIndex++
}

function appendChildren(children, element) {
  children.map(function(c) {
    element.appendChild(c)
  })
}

function startFader(images) {
  var index = 0

  setTimeout(function() {
    transition(images, index)
  }, transitionTimeout)
}

// Starts a transition from the current index.
function transition(images, currentIndex) {
  var nextIndex = getNextIndex(images, currentIndex)

  if (nextIndex == null) {
    debug('postponing transition.', 'currentIndex:', currentIndex)
    setTimeout(function() {
      transition(images, currentIndex)
    }, transitionTimeout)
    return
  }

  debug('transitioning:', currentIndex, '->', nextIndex)

  transitionImages(images[currentIndex], images[nextIndex], function() {
    setTimeout(function() {
      transition(images, nextIndex)
    }, transitionTimeout)
  })
}

var transitionTimeout = 6000
var transitionInterval = 25
var transitionOpacityDelta = 0.05

function transitionImages(currImage, nextImage, done) {
  var iterate = function(opacity) {
    if (opacity < 1) {
      currImage.style.opacity = 1 - opacity
      nextImage.style.opacity = opacity

      setTimeout(function() {
        iterate(opacity + transitionOpacityDelta)
      }, transitionInterval);
    } else {
      currImage.style.opacity = 0
      nextImage.style.opacity = 1
      done()
    }
  }

  iterate(0)
}

// return the next index after the given one which references a successfully
// loaded image.
function getNextIndex(images, index) {
  var len = images.length
  var triesRemaining = len

  while (triesRemaining > 0) {
    var index = (index + 1) % len
    if (images[index]._succeeded) {
      return index
    }
    triesRemaining--
  }

  return null
}

return imageFader
})()