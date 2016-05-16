(function() {

/* Utils */

function toArray(obj) {
  return [].slice.call(obj)
}

function $(selector, context) {
  return toArray(document.querySelectorAll(selector, context))
}

/* Bindings */
function ExtensionInstallation() {
 function onInstall(e) {
    e.preventDefault()

    if (!window.chrome || !window.chrome.webstore) {
      alert('Extension can be installed in Desktop Chrome browser only.')
      return
    }

    chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/dgeiagkojabjccafojhokcceakmehpbb',
      function() {
        location.hash = 'university/connect'
      },
      function(err) {
        alert(err)
      }
    )
  }

  $('.install-extension').forEach(function(el) {
    el.addEventListener('click', onInstall)
  })
}

function UniversityNav() {
  var items = $('.university-nav a')
  var scroller = $('.scroller')[0]
  var selected

  function select(item, name) {
    var el = $('.' + name)[0]
    // Vertical scroll.
    smoothScroll(el, 500)
    // Horizontal scroll.
    smoothScroll(el, 500, function() {
      item.classList.add('selected')
      if (selected) selected.classList.remove('selected')
      selected = item
    }, scroller, 'horizontal')
  }

  function handleHashChange() {
    if (!location.hash) return
    var parts = location.hash.split('/')
    var name = parts[1]
    var item = items.filter(function(item) {
      return item.href.indexOf(name) !== -1
    })[0]
    select(item, name)
  }

  window.addEventListener('hashchange', handleHashChange)
  handleHashChange()
}

document.addEventListener('readystatechange', function() {
  ExtensionInstallation()
  UniversityNav()
})

}())
