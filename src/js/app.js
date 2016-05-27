(function() {

/* Utils */

function toArray(obj) {
  return [].slice.call(obj)
}

function $(selector, context) {
  return toArray(document.querySelectorAll(selector, context))
}

var hasChromeStore = window.chrome && window.chrome.webstore

function BodyClasses() {
  var classes = ['ready']
  var hasTouch = 'ontouchstart' in window
  classes.push(hasTouch ? 'touch' : 'no-touch')
  if (!hasChromeStore) classes.push('no-chrome-store')
  document.body.className = classes.join(' ')
}

/* Bindings */
function UniversityNav() {
  var navItems = $('.university-nav a')
  var scroller = $('.scroller')[0]
  var selected = $('.university-nav .selected')[0]
  var nextArrows = $('.university .next')

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
        if (navItem === selected) return
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

  // Handle click on "next" arrow.
  nextArrows.forEach(function(arrow) {
    arrow.addEventListener('click', function() {
      var index = navItems.indexOf(selected)
      navItems[index + 1].click()
    })
  })

  window.addEventListener('hashchange', onHashChange)
  window.addEventListener('resize', onHashChange)
  onHashChange()
}

document.addEventListener('readystatechange', function() {
  UniversityNav()
  BodyClasses()
  SocialShareKit.init()
})

}())
