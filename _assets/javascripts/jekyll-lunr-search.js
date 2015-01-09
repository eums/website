//= require vendor/lunr-0.5.7.js
//= require vendor/es6-promise-2.0.1.min.js
//= require Markup.js

JekyllLunrJsSearch = (function() {
"use strict"

var Promise = ES6Promise.Promise

// Given a query string, attempt to parse it and return an object.
function parseQueryString(string) {
  var result = {}
  var decode = function (s) {
    return decodeURIComponent(s.replace(/\+/g, " "))
  }

  var pairs = string.split('&')
  var length = pairs.length

  for (var i = 0; i < length; i++) {
    var pair = pairs[i].split('=')
    if (pair.length === 2) {
      result[decode(pair[0])] = decode(pair[1])
    }
  }

  return result
}

// Take a given parameter from the query string, or return null if it is not in
// the query string.
function getQueryString(param) {
  var query = location.search.substring(1)
  var parsed = parseQueryString(query)
  return parsed[param]
}

// Set the value of each DOM element matching the given selector to the given
// value.
function setValues(selector, value) {
  var nodes = document.querySelectorAll(selector)
  var length = nodes.length

  for (var i = 0; i < length; i++) {
    nodes[i].value = value
  }
}

// Call the supplied function as soon as is convenient.
var nextTick = (function() {
  if (typeof setImmediate === 'function') {
    return setImmediate
  } else {
    return function(fn) {
      setTimeout(fn, 0)
    }
  }
})()

// Cache arbitrary values in localStorage.
function localStorageCache(serialize, unserialize) {
  var cacheKey = '__jekyll_lunr_search_database'
  var cacheGet = function() {
    try {
      return unserialize(window.localStorage[cacheKey])
    } catch(e) {
        return null
    }
  }
  var cacheSet = function(value) {
    window.localStorage[cacheKey] = serialize(value)
  }

  return { get: cacheGet, set: cacheSet }
}

// Return a serialized database, in a suitable form for calling JSON.stringify
// on.
function databaseToJSON(db) {
  return { documents: db.documents, index: db.index.toJSON() }
}

// Given a serialized database, load it into a database object.
function loadDatabase(obj) {
  return { documents: obj.documents, index: lunr.Index.load(obj.index) }
}

var databaseCache = (function() {
  var serialize = function(cacheEntry) {
    var object = {
      lastModified: cacheEntry.lastModified,
      value: databaseToJSON(cacheEntry.value)
    }
    return JSON.stringify(object)
  }

  var unserialize = function(string) {
    var object = JSON.parse(string)
    return {
      lastModified: object.lastModified,
      value: loadDatabase(object.value)
    }
  }

  return localStorageCache(serialize, unserialize)
})()

// Builds the search database from the document array, and then calls a
// callback with the result. This function should always return the same result
// for the same input.
function buildSearchDatabase(data) {
  console.log('building search db...')
  var index = createLunrIndex()
  var documents = {}

  // Create a list of Promises, each of which resolves with no value after its
  // document has been added to the database.
  var promises = data.map(function(doc) {
    return new Promise(function(resolve, reject) {
      nextTick(function() {
        try {
          index.add(doc)
          documents[doc.url] = doc
          resolve()
        } catch(e) {
          reject(e)
        }
      })
    })
  })

  return Promise.all(promises).then(function() {
    return {
      index: index,
      documents: documents
    }
  })
}

// Perform an AJAX request for the given url, set the If-Modified-Since header
// with the given date, and attempt to parse the returned JSON.
//
// Returns a promise that will resolve to either:
//
//   { state: 'not-modified' }
//
// meaning that the resource has not been modified since the supplied time (so
// you can use the cached value), or:
//
//   { state: 'ok', lastModified: String, value: Object }
//
function getJSON(url, ifModifiedSince) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.setRequestHeader('Accept', 'application/json')

    if (ifModifiedSince) {
      request.setRequestHeader('If-Modified-Since', ifModifiedSince)
    }

    request.onreadystatechange = function() {
      if (this.readyState !== 4) {
        return
      }

      if (this.status === 304) {
        console.log('getJSON: 304 Not Modified')
        resolve({ state: 'not-modified' })

      } else if (this.status >= 200 && this.status < 400) {
        var lastModified = this.getResponseHeader('Last-Modified')

        if (ifModifiedSince === lastModified) {
          console.log('getJSON: 200 OK but it wasn\'t modified')
          resolve({ state: 'not-modified' })

        } else {
          console.log('getJSON: 200 OK')
          resolve({
            state: 'ok',
            lastModified: lastModified,
            value: JSON.parse(this.responseText)
          })
        }
      } else {
        reject(Error('getJSON: HTTP error. Status: ' + this.status))
      }
    }

    request.onerror = function() {
      reject(Error('getJSON: XMLHttpRequest error'))
    }

    request.send()
    request = null
  })
}

// Given:
//
// * an arbitrary caching mechanism that can store a single value
// * a URL which points to some JSON to be fetched via AJAX
// * an expensive computation that always gives the same result for the same
//   input
//
// return a new promise which will resolve to the result of running the
// expensive computation on the promised value, while making use of the
// provided caching system.
function getJSONWithCache(cache, url, expensiveFn) {
  return new Promise(function(resolve, reject) {
    var cached = cache.get()
    var ifModifiedSince = cached && cached.lastModified

    getJSON(url, ifModifiedSince).then(function(input) {
      if (input.state === 'ok') {
        expensiveFn(input.value).then(function(result) {
          setTimeout(function() {
            // this is expensive-ish because of the lunr index
            // serialization, so do it a second later
            console.log('storing result in cache...')
            cache.set({
              lastModified: input.lastModified,
              value: result
            })
            console.log('result stored in cache.')
          }, 1000)

          resolve(result)
        })
      } else if (input.state === 'not-modified') {
        console.log('getJSONWithCache: cache hit!')
        resolve(cached.value)
      }
    })
  })
}

// Now with caching!
function getSearchDatabase(url) {
  return getJSONWithCache(databaseCache, url, buildSearchDatabase)
}

function createLunrIndex() {
  return lunr(function() {
    this.ref('url')
    this.field('title', {boost: 10})
    this.field('body')
    this.field('date')
    this.field('categories')
  })
}

// Returns a promise with an array of results.
function runQuery(db, query) {
  return new Promise(function(resolve, reject) {
    var results = db.index.search(query).map(function(result) {
      return db.documents[result.ref]
    })

    resolve(results)
  })
}

function displayResults(template, containerId, results) {
  return new Promise(function(resolve, reject) {
    var container = document.getElementById(containerId)

    removeAllChildren(container)

    if (results.length === 0) {
      var element = Markup.p('Nothing found.')
      container.appendChild(element)
    } else {
      results.forEach(function(result) {
        container.appendChild(template(result))
      })
    }

    resolve()
  })
}


function removeAllChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}

function setSearchHeaderText(elId, query) {
  var el = document.getElementById(elId)
  removeAllChildren(el)

  var text = "Search results for '" + query + "'"
  var textNode = document.createTextNode(text)
  el.appendChild(textNode)
}

// Calls a function repeatedly (up to *max* times), waiting *interval*
// milliseconds between each call given interval until it has finished. The
// function can signal that it is finished by calling the callback that is
// passed as its first (and only) argument.
//
// Make sure the function you pass is idempotent!
//
// This appears to be necessary because IE sometimes gets bored and gives up
// halfway through.
function retry(interval, max, fn) {
  var done = function() {
    if (done.intervalID) {
      clearInterval(done.intervalID)
    } else {
      setTimeout(done, intervalID)
    }
  }
  var calls = 0

  var intervalID = setInterval(function() {
    if (calls >= max) {
      clearInterval(done.intervalID)
      throw new Error('retry: giving up after ' + max + ' attempts.')
    }

    fn(done)
    calls++
  }, interval)

  done.intervalID = intervalID
}

// Return a new promise that resolves after the search has been successfully
// performed.
function startSearch(config, query) {
  return getSearchDatabase(config.jsonUrl).then(function(db) {
    return runQuery(db, query)
  }).then(function(results) {
    return displayResults(config.template, config.containerId, results)
  })
}

function showError(error) {
  console.log('Oh dear! An error:', error)
}

// Configuration:
//  formSelector:
//      A CSS selector referencing every <form> on the page, so that the query
//      can be put back in there. Just a small nice touch.
//  jsonUrl:
//      The URL of the JSON file containing the documents to build the search
//      index from.
//  templateId:
//      The id of the mustache template to render the search results with.
//  containerId:
//      The id of the HTML element to put the results into.
//  headerId:
//      The id of the HTML element to change the innerText of. The text will be
//      set to "Search results for '<query>'".
function main(config) {
  var query = getQueryString('q')
  if (query) {
    setValues(config.formSelector, query)
    setSearchHeaderText(config.headerId, query)

    retry(2000, 10, function(done) {
      startSearch(config, query)
        .then(function() { done() }, showError)
    })
  }
}

return main
})()
