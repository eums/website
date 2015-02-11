//= require vendor/es6-promise-2.0.1.min.js

ImageFader = (function() {

var Promise = ES6Promise.Promise

var DEBUG = false
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

    // This is the fault of IE >:( that is, both the fact that I have to remove
    // these attributes, and the silly setTimeout call.
    setTimeout(function() {
      image.removeAttribute('width')
      image.removeAttribute('height')
    }, 100)
  }

  setOpacity(image, 0)
  image.style.zIndex  = nextZIndex()

  return image
}

function setOpacity(image, opacity) {
  image.style.opacity = opacity

  // This is for IE8
  image.style.filter = 'alpha(opacity=' + Math.floor(opacity * 100) + ')'
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
      setOpacity(currImage, 1 - opacity)
      setOpacity(nextImage, opacity)

      setTimeout(function() {
        iterate(opacity + transitionOpacityDelta)
      }, transitionInterval);
    } else {
      setOpacity(currImage, 0)
      setOpacity(nextImage, 1)
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
