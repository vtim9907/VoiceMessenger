const cacheFile = [
    '/assets/css/animate.css',
    '/assets/css/bootstrap.min.css',
    '/assets/css/component.css',
    '/assets/css/font-awesome.min.css',
    '/assets/css/main.css',
    '/assets/css/media-queries.css',
    '/assets/css/owl.carousel.css',
    '/assets/css/responsive.css',
    '/assets/css/slit-slider.css',
    '/assets/fonts/fontawesome-webfont.eot',
    '/assets/fonts/fontawesome-webfont.svg',
    '/assets/fonts/fontawesome-webfont.ttf',
    '/assets/fonts/fontawesome-webfont.woff',
    '/assets/fonts/FontAwesome.otf',
    '/assets/js/bootstrap.min.js',
    '/assets/js/classie.js',
    '/assets/js/custom.js',
    '/assets/js/grid.js',
    '/assets/js/idangerous.swiper-2.1.min.js',
    '/assets/js/jquery-1.11.0.min.js',
    '/assets/js/jquery.appear.js',
    '/assets/js/jquery.ba-cond.min.js',
    '/assets/js/jquery.countTo.js',
    '/assets/js/jquery.easing-1.3.pack.js',
    '/assets/js/jquery.fitvids.js',
    '/assets/js/jquery.mixitup.min.js',
    '/assets/js/jquery.nav.js',
    '/assets/js/jquery.nicescroll.min.js',
    '/assets/js/jquery.parallax-1.1.3.js',
    '/assets/js/jquery.slitslider.js',
    '/assets/js/jquery.sticky.js',
    '/assets/js/modernizr-2.6.2.min.js',
    '/assets/js/owl.carousel.min.js',
    '/assets/js/wow.min.js',
    '/assets/img/favicon.png',
    '/assets/img/logo-voiceMessage.png',
    '/assets/img/preloader.gif',
    '/assets/img/temp.png',
    '/assets/img/voiceMessage.png',
    '/assets/img/slides/1.jpg',
    '/assets/img/slides/2.jpg',
    '/assets/img/slides/3.jpg',
    '/assets/img/team/member1.jpg',
    '/assets/img/team/member2.jpg',
    '/assets/img/team/member3.jpg',
    '/assets/img/team/member4.jpg',
    '/assets/img/team/member5.jpg',
    '/index.html',
]
  
const cacheKey = 'page-source'

// self is refer to ServiceWorkerGlobalScope
self.addEventListener('install', event => {
    // Use waitUntil() to ensure something(e.g. caches) was prepared
    // before going to next stage (activated)
    event.waitUntil(
        // caches refer to a collection of cache object, and can be
        // accessed by window, worker, and service worker.
        caches.open(cacheKey)
        .then(cache => {
            cache.addAll(cacheFile);
        })
    )
})

// Fires once the old service worker is gone,
// and new service worker is able to control clients.
self.addEventListener('activated', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            const promiseArr = cacheNames.map(item => {
                if (item !== cacheKey) {
                    return caches.delete(item)
                }
            })
            return Promise.all(promiseArr)
        })
    )
})

self.addEventListener('fetch', event => {
    console.log(`${event.request.method}: ${event.request.url}`)
    event.respondWith(
        caches.match(event.request).then(response => {
            console.log(response)
	    if (response) {
                return response
            }
            return fetch(event.request)
      })
    )
})
