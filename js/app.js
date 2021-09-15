import { loadCars } from "./carService.js";
import { loadCarPage } from "./carPageService.js";
import swRegister from "./swRegister.js";

window.pageEvents = {
  loadCarPage,
  loadCars,
};

loadCars();
swRegister();
