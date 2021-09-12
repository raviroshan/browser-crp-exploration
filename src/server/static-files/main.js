console.log("Hello from main js file");

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      debugger;
      break;
    }
  }
}

// sleep(5000); //sleep for 2 seconds

window.onload = function () {
  var loadTime =
    window.performance.timing.domContentLoadedEventEnd -
    window.performance.timing.navigationStart;

  document.getElementById("loadTime").textContent = loadTime;
};
