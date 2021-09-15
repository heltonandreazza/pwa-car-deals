const carsInstance = localforage.createInstance({
  name: "cars",
});
let lastIndex = -1;

async function setItems(items) {
  items.forEach(async (item) => {
    await carsInstance.setItem(`${item.key}`, item.value);
  });
}

async function getItems(keys) {
  const items = await Promise.all(
    keys.map(async (key) => carsInstance.getItem(key))
  );
  return items;
}

export const addCars = async (newCars) => {
  await setItems(newCars);
};

export const getCars = async (newCars) => {
  const keys = (await carsInstance.keys()).reverse();
  if (lastIndex >= keys.length) return;
  const results = await getItems(keys.splice(lastIndex + 1, 3));
  lastIndex += 3;
  return Object.values(results).reverse();
};

export const getLastItemId = async () => {
  const keys = (await carsInstance.keys()).reverse();
  return keys[lastIndex];
};
