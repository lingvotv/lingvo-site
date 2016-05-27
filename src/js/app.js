(function() {

/* Utils */

function toArray(obj) {
  return [].slice.call(obj)
}

function $(selector, context) {
  return toArray(document.querySelectorAll(selector, context))
}

function isInViewport(el) {
  var rect = el.getBoundingClientRect()

  var containmentRect = {
    top: 0,
    left: 0,
    bottom: window.innerHeight || document.documentElement.clientHeight,
    right: window.innerWidth || document.documentElement.clientWidth
  }

  var visibilityRect = {
    top: rect.top >= containmentRect.top,
    left: rect.left >= containmentRect.left,
    bottom: rect.bottom <= containmentRect.bottom,
    right: rect.right <= containmentRect.right
  }

  var partialVertical =
    (rect.top >= containmentRect.top && rect.top <= containmentRect.bottom) ||
    (rect.bottom >= containmentRect.top && rect.bottom <= containmentRect.bottom)

  return partialVertical
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

  function checkLocation() {
    if (!location.hash) return
    select(location.hash.split('/'))
  }

  function checkViewport() {
    if (isInViewport(scroller)) {
      scroller.classList.add('is-in-viewport')
    }
  }

  // Handle click on "next" arrow.
  nextArrows.forEach(function(arrow) {
    arrow.addEventListener('click', function() {
      var index = navItems.indexOf(selected)
      navItems[index + 1].click()
    })
  })


  ;['resize', 'hashchange', 'scroll'].forEach(function(event) {
    window.addEventListener(event, function() {
      // Don't scroll on scroll!
      if (event !== 'scroll') {
        checkLocation()
      }

      checkViewport()
    })
  })

  checkLocation()
  checkViewport()
}

document.addEventListener('readystatechange', function() {
  UniversityNav()
  BodyClasses()
  SocialShareKit.init()
})

}())
