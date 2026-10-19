export function depthSort(objects) {
  return [...objects].sort((a, b) => a.sortY - b.sortY);
}

export async function loadAssets(manifest, createImage = () => new Image()) {
  const entries = await Promise.all(Object.entries(manifest).map(([key, url]) => new Promise((resolve, reject) => {
    const image = createImage();
    image.onload = () => resolve([key, image]);
    image.onerror = () => reject(new Error(`無法載入遊戲素材：${url}`));
    image.src = url;
  })));
  return Object.fromEntries(entries);
}
