(function () {
  /* Config */
  var isLocalEnv = location.hostname === "localhost";
  var baseApiUrl = isLocalEnv
    ? "http://localhost:3000"
    : "https://api.lingvo.tv";

  var config;
  var defaultConfig = {
    features: {},
  };

  try {
    config = JSON.parse(localStorage.getItem("lingvo.tv")) || defaultConfig;
  } catch (err) {}

  /* Utils */

  function toArray(obj) {
    return [].slice.call(obj);
  }

  function $(selector, container) {
    return toArray((container || document).querySelectorAll(selector));
  }

  function isInViewport(el) {
    var rect = el.getBoundingClientRect();

    var containmentRect = {
      top: 0,
      left: 0,
      bottom: window.innerHeight || document.documentElement.clientHeight,
      right: window.innerWidth || document.documentElement.clientWidth,
    };

    var partialVertical =
      (rect.top >= containmentRect.top && rect.top <= containmentRect.bottom) ||
      (rect.bottom >= containmentRect.top &&
        rect.bottom <= containmentRect.bottom);

    return partialVertical;
  }

  function removeHash() {
    var scrollV;
    var scrollH;
    var loc = window.location;

    if (!loc.hash) return;

    if ("pushState" in history) {
      history.pushState("", document.title, loc.pathname + loc.search);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      scrollV = document.body.scrollTop;
      scrollH = document.body.scrollLeft;

      loc.hash = "";

      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scrollV;
      document.body.scrollLeft = scrollH;
    }
  }

  function ready(callback) {
    if (
      ["interactive", "complete", "loaded"].indexOf(document.readyState) === -1
    ) {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  /* Bindings */

  function BodyClasses() {
    var classes = ["ready"];
    var hasTouch = "ontouchstart" in window;
    classes.push(hasTouch ? "touch" : "no-touch");
    document.body.className = classes.join(" ");
  }

  function Scroller(options) {
    var scroller = $(".scroller", options.container)[0];
    var sections = $("section", scroller);
    var sectionWidth;
    var totalWidth;
    var select = options.nav.select;
    var timerId;

    function setWidth() {
      sectionWidth = scroller.offsetWidth;
      totalWidth = sectionWidth * sections.length;
    }

    function setSelected() {
      var scrollLeft = scroller.scrollLeft;

      for (var sectionNr = 1; sectionNr <= sections.length; sectionNr++) {
        var rightEdge = sectionNr * sectionWidth;
        var leftEdge = rightEdge - sectionWidth;
        var relScrollLeft = scrollLeft - leftEdge;

        if (scrollLeft >= leftEdge && scrollLeft < rightEdge) {
          var snapPoint = (rightEdge - leftEdge) / 2;
          var path = ["#" + options.container.id];

          // Snap back.
          if (relScrollLeft < snapPoint) {
            path.push(sections[sectionNr - 1].dataset.name);
            // Snap to next.
          } else {
            path.push(sections[sectionNr].dataset.name);
          }

          options.nav.setLocationWithoutScroll(path.join("/"));
          select(path);

          break;
        }
      }
    }

    scroller.addEventListener("scroll", function () {
      clearTimeout(timerId);
      timerId = setTimeout(setSelected, 30);
    });

    window.addEventListener("resize", setWidth);
    setWidth();
  }

  function ScrollerNav(options) {
    var container = options.container;
    var scroller = $(".scroller", container)[0];
    var navItems = $(".scroller-nav a", container);
    var selected = $(".scroller-nav .selected", container)[0];
    var nextArrows = $(".next-button", scroller);
    var verticalScroll = true;
    var horizontalScroll = true;
    var isScrolling = false;

    function checkLocation() {
      if (!location.hash) return;
      select(location.hash.split("/"));
    }

    // Handle click on "next" arrow.
    nextArrows.forEach(function (arrow) {
      arrow.addEventListener("click", function () {
        if (isScrolling) return;
        var index = navItems.indexOf(selected);
        var nextItem = navItems[index + 1];
        nextItem && nextItem.click();
      });
    });

    navItems.forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        var hashIndex = item.href.indexOf("#");
        var hash = item.href.substr(hashIndex);

        if (location.href === item.href) {
          select(hash.split("/"), { verticalScroll: false });
        } else {
          setLocationWithoutScroll(hash, { horizontal: true });
        }
      });
    });
    ["resize", "hashchange", "scroll"].forEach(function (event) {
      window.addEventListener(event, function (e) {
        // Don't scroll on scroll!
        if (e.type !== "scroll") {
          checkLocation();
        }
      });
    });

    window.addEventListener("touchmove", removeHash);

    checkLocation();

    function setLocationWithoutScroll(hash, options) {
      options || (options = {});
      if (options.vertical !== true) verticalScroll = false;
      if (options.horizontal !== true) horizontalScroll = false;
      location.hash = hash;
      setTimeout(function () {
        verticalScroll = true;
        horizontalScroll = true;
      }, 300);
    }

    function select(parts, options, callback) {
      var target = $(parts[0])[0];
      if (target !== container) return;

      options || (options = {});
      options.duration === null || (options.duration = 500);
      options.horizontalScroll !== undefined ||
        (options.horizontalScroll = horizontalScroll);
      options.verticalScroll !== undefined ||
        (options.verticalScroll = verticalScroll);

      // Vertical scroll.
      if (options.verticalScroll) {
        isScrolling = true;
        smoothScroll(target, options.duration, function () {
          isScrolling = false;
          if (callback) callback();
        });
      }

      // Horizontal scroll.
      if (parts[1]) {
        var navItem = navItems.filter(function (item) {
          return item.href.indexOf(parts[1]) !== -1;
        })[0];
        var el = $('[data-name="' + parts[1] + '"]')[0];

        function setSelected() {
          if (navItem === selected) return;
          navItem.classList.add("selected");
          if (selected) selected.classList.remove("selected");
          selected = navItem;
        }

        function onScrollStop() {
          isScrolling = false;
          setSelected();
          if (callback) callback();
        }

        if (options.horizontalScroll) {
          isScrolling = true;
          // Horizontal scroll.
          smoothScroll(
            el,
            options.duration,
            onScrollStop,
            scroller,
            "horizontal"
          );
        } else {
          onScrollStop();
        }
      }
    }

    return {
      select: select,
      setLocationWithoutScroll: setLocationWithoutScroll,
    };
  }

  function LazyImages() {
    var elements = $("[data-bg]");
    var basePath = "/src/img";

    function checkViewport() {
      elements.forEach(function (el) {
        if (isInViewport(el)) {
          el.style.backgroundImage =
            "url(" + basePath + "/" + el.dataset.bg + ")";
        }
      });
    }

    ["resize", "hashchange", "scroll"].forEach(function (event) {
      window.addEventListener(event, checkViewport);
    });

    checkViewport();
  }

  function Contact() {
    var el = $(".contact")[0];
    $(".contact")[0].addEventListener("click", function (e) {
      e.preventDefault();
      location.href = "mailto:hi@lingvo.tv";
    });
  }

  function ActionsMenu() {
    var el = $(".actions")[0];
    var isMinified = false;
    var threshold = 80;
    window.addEventListener("scroll", function () {
      // Firefox scrolls html element.
      var scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      var minify = scrollTop > threshold;

      if (minify !== isMinified) {
        el.classList.toggle("is-maximized");
        isMinified = minify;
      }
    });
  }

  function Slideshow() {
    var images = $(".slideshow .image");
    var active = images.filter(function (image) {
      return image.classList.contains("active");
    })[0];

    setInterval(function () {
      var activeIndex = images.indexOf(active);
      var nextActiveIndex = activeIndex + 1;

      if (!images[nextActiveIndex]) nextActiveIndex = 0;

      active.classList.remove("active");
      active = images[nextActiveIndex];
      active.classList.add("active");
    }, 3000);
  }

  function Faq() {
    var section = $('[data-key="faq"]')[0];
    fetch("/faq.html?" + Date.now())
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        section.innerHTML = html;
      });
  }

  function Pricing() {
    var prices;
    var apiUrl = baseApiUrl + "/stripe/prices";
    var successUrl = "http://localhost:8080";
    var cancelUrl = "http://localhost:8081/#pricing";
    var apiKey =
      "pk_test_51HzVgsIhiGCkjwyhsSdF4zL96uQqPPIrt7jfOtjMMzUmNS52RU5AvjYuRQIUPaM8pPbFJ6uAcqoi14Szt76jHznM00sNDIsnAc";

    if (!isLocalEnv) {
      successUrl = "https://app.lingvo.tv";
      cancelUrl = "https://lingvo.tv/#pricing";
      apiKey =
        "pk_live_51HzVgsIhiGCkjwyhbQVTsMUB9PxuNSn9rwvH7V4hlz5OpykMVANpJjbAiEpk6d1PMlrEFTdg45QlKqGpBpRq2QZQ00KIfSnl4i";
    }

    function checkout() {
      var stripe = Stripe(apiKey);

      /*
       * When the customer clicks on the button, redirect
       * them to Checkout.
       */
      stripe
        .redirectToCheckout({
          lineItems: [{ price: prices.premium.priceId, quantity: 1 }],
          mode: "subscription",
          successUrl: successUrl,
          cancelUrl: cancelUrl,
          //customerEmail: ""
        })
        .then(function (result) {
          if (result.error) {
            /*
             * If `redirectToCheckout` fails due to a browser or network
             * error, display the localized error message to your customer.
             */
            var displayError = $("#error-message")[0];
            displayError.textContent = result.error.message;
          }
        });
    }

    var upgradeButton = $("[data-key='upgrade']")[0];
    upgradeButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (prices) checkout();
    });

    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (res) {
        prices = res;
        $('[data-key="price"]')[0].textContent = prices.premium.formattedPrice;
      });
  }

  ready(function () {
    BodyClasses();
    Contact();
    LazyImages();
    ActionsMenu();
    // Slideshow()
    Faq();
    Pricing();
  });

  window.addEventListener("load", function () {
    [".university-how", ".university-installation"].forEach(function (
      selector
    ) {
      var nav = ScrollerNav({ container: $(selector)[0] });
      Scroller({ container: $(selector)[0], nav: nav });
    });
    SocialShareKit.init();
  });
})();
