(function extension() {
  var installEl = document.querySelectorAll('.install-extension')[0]

  installEl.addEventListener('click', function(e) {
    e.preventDefault()

    if (!window.chrome) {
      alert('Extension can be installed in Chrome browser only.')
      return
    }

    chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/dgeiagkojabjccafojhokcceakmehpbb',
      function() {
        console.log('success')
      },
      function(err) {
        console.log('err', err)
      }
    )
  })
}())

