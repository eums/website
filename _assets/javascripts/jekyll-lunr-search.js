//= require vendor/lunr-0.5.7.js
//= require Markup.js

JekyllLunrJsSearch = (function() {
"use strict"

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

// Take an array of functions, call them all asynchoronously, and call the
// callback once they're all finished.
function parallel(fns, callback) {
  var length = fns.length
  var complete = 0

  fns.map(function(fn) {
    nextTick(function() {
      fn()
      complete++

      if (complete === length) {
        nextTick(callback)
      }
    })
  })
}

// like map, but async.
function asyncMap(array, fn, callback) {
  var fns = array.map(function(x) { return function() { fn(x) }})
  parallel(fns, callback)
}

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
        var object =
            { lastModified: cacheEntry.lastModified,
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
function buildSearchDatabase(data, callback) {
    console.log('building search db...')
    var index = createLunrIndex()
    var documents = {}

    var addToIndex = function(doc) {
        index.add(doc)
        documents[doc.url] = doc
    }

    var done = function() {
      callback({ index: index, documents: documents })
    }

    asyncMap(data, addToIndex, done)
}

// Perform an AJAX request, attempt to parse the returned JSON, and call the
// callback with the result.
function getJSON(url, ifModifiedSince, onOk, onNotModified) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    if (ifModifiedSince) {
        request.setRequestHeader('If-Modified-Since', ifModifiedSince)
    }

    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 304) {
                console.log('getJSON: 304 Not Modified')
                onNotModified()
            } else if (this.status >= 200 && this.status < 400) {
                var lastModified = this.getResponseHeader('Last-Modified')
                if (ifModifiedSince === lastModified) {
                    console.log('getJSON: 200 OK but it wasn\'t modified')
                    onNotModified()
                } else {
                    console.log('getJSON: 200 OK')
                    onOk(lastModified, JSON.parse(this.responseText))
                }
            } else {
                throw new Error(
                    'getJSON failed. HTTP status was: ' + this.status)
            }
        }
    }

    request.send()
    request = null
}

// Given:
//
// * an arbitrary caching mechanism that can store a single value
// * A URL pointing to a JSON object, that might change over time
// * an expensive computation that always gives the same result for the same
//   input
// * a callback that should eventually be called with the result
//
// Then use the HTTP Last-Modified / If-Modified-Since mechanism in order to
// only perform the expensive computation on the object when it has changed.
function getJSONWithCache(cache, url, expensiveFn, callback) {
    var cached = cache.get()
    var ifModifiedSince = cached && cached.lastModified

    var onOk = function(lastModified, responseObject) {
        nextTick(function() {
            expensiveFn(responseObject, function(result) {
                setTimeout(function() {
                    // this is expensive because of the lunr index
                    // serialization, so do it a second later
                    console.log('storing result in cache...')
                    cache.set({ lastModified: lastModified, value: result })
                    console.log('result stored in cache.')
                }, 1000)
                callback(result)
            })
        })
    }

    var onNotModified = function() {
        console.log('getJSONWithCache: cache hit!')
        callback(cached.value)
    }

    getJSON(url, ifModifiedSince, onOk, onNotModified)
}

// Now with caching!
function getSearchDatabase(url, callback) {
    getJSONWithCache(databaseCache, url, buildSearchDatabase, callback)
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

function runQuery(db, query, callback) {
    var results = db.index.search(query).map(function(result) {
        return db.documents[result.ref]
    })

    nextTick(function() { callback(results) })
}

function displayResults(template, containerId, results) {
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

// Keep calling a function with the given interval until it has finished. The
// passed function can signal that it is finished by calling the callback that
// it is passed.
//
// Make sure the function you pass is idempotent!
//
// This appears to be necessary because IE sometimes gets bored and gives up
// halfway through.
function retry(interval, fn) {
    var done = function() {
        if (done.intervalID) {
            clearInterval(done.intervalID)
        } else {
            setTimeout(done, intervalID)
        }
    }

    var intervalID = setInterval(function() { fn(done) }, interval)
    done.intervalID = intervalID
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
//      The id of the HTML element to change the innerText of. Default
function main(config) {
  var query = getQueryString('q')
  if (query) {
    setValues(config.formSelector, query)
    setSearchHeaderText(config.headerId, query)

    retry(1000, function(done) {
      getSearchDatabase(config.jsonUrl, function(db) {
        runQuery(db, query, function(results) {
          displayResults(config.template, config.containerId, results)
          done()
        })
      })
    })
  }
}

return main
})()
