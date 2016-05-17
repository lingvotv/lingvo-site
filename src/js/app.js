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
  var navItems = $('.university-nav a')
  var scroller = $('.scroller')[0]
  var selected = $('.university-nav .selected')[0]

  function select(parts) {
    // Vertical scroll.
    smoothScroll($(parts[0])[0], 500)

    // Horizontal scroll.
    if (parts[1]) {
      var navItem = navItems.filter(function(item) {
        return item.href.indexOf(parts[1]) !== -1
      })[0]
      var el = $('.' + parts[1])[0]
      // Horizontal scroll.
      smoothScroll(el, 500, function() {
        navItem.classList.add('selected')
        if (selected) selected.classList.remove('selected')
        selected = navItem
      }, scroller, 'horizontal')
    }
  }

  function onHashChange() {
    if (!location.hash) return
    select(location.hash.split('/'))
  }

  window.addEventListener('hashchange', onHashChange)
}

document.addEventListener('readystatechange', function() {
  ExtensionInstallation()
  UniversityNav()
})

}())
