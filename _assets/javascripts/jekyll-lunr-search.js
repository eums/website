//= require lunr-0.5.7.js
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

function getSearchDatabase(url, callback) {
    getJSON(url, function(data) {
        buildSearchDatabase(data, callback)
    })
}

function buildSearchDatabase(data, callback) {
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

// Perform an AJAX request, attempt to parse the returned JSON, a
function getJSON(url, callback) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)

    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status >= 200 && this.status < 400) {
                callback(JSON.parse(this.responseText))
            } else {
                throw new Error(
                    'getJSON failed. HTTP status was: ' + this.status)
            }
        }
    }

    request.send()
    request = null
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

function runQuery(db, query) {
    return db.index.search(query).map(function(result) {
        return db.documents[result.ref]
    })
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
function main(config) {
    var query = getQueryString('q')
    if (query) {
        setValues(config.formSelector, query)
        getSearchDatabase(config.jsonUrl, function(db) {
            var results = runQuery(db, query)
            displayResults(config.template, config.containerId, results)
        })
    }
}

return main
})()
