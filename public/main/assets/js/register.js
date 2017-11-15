if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./assets/js/service_worker.js')
  .then(reg => {
    console.log('SW registered ', reg)
  })
  .catch(err => {
    console.log('SW Error ', err)
  })
}
