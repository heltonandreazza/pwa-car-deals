export default async () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  const swRegistration = await navigator.serviceWorker.register("sw.js", {
    scope: "",
  });
  let serviceWorker;

  if (swRegistration.installing) {
    console.log("resolved on installing: ", swRegistration);
    serviceWorker = swRegistration.installing;
  } else if (swRegistration.waiting) {
    console.log("resolved on installed/waiting: ", swRegistration);
    serviceWorker = swRegistration.waiting;
  } else if (swRegistration.active) {
    console.log("resolved on activated: ", swRegistration);
    serviceWorker = swRegistration.active;
  }

  // easier to work on incognito mode
  serviceWorker.addEventListener("statechange", (e) => {
    console.log("statechange", e.target.state);
  });

  swRegistration.addEventListener("updatefound", () => {
    swRegistration.installing.addEventListener("statechange", (e) => {
      console.log("new service worker state: ", e.target.state);
    });
    console.log("new service worker found: ", swRegistration);
  });
  // an extra event that is fired when the service worker controlling this page changes through the self.skipWaiting()
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("Controller changed!");
  });

  setInterval(() => {
    swRegistration.update();
  }, 1000 * 5);

  navigator.serviceWorker.addEventListener("message", (e) => {
    const clientId = e.data.clientId;
    const message = e.data.message;
    console.log("Client received message from SW: ", clientId, message);
  });

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage("hello SW, its client");
  }
};
