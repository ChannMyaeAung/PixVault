const MAX_IMAGE_PIXELS = 24_000_000;

export async function downscaleImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to read selected image."));
      img.src = objectUrl;
    });

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const totalPixels = width * height;

    if (totalPixels <= MAX_IMAGE_PIXELS) {
      return file;
    }

    const scale = Math.sqrt(MAX_IMAGE_PIXELS / totalPixels);
    const newWidth = Math.max(1, Math.floor(width * scale));
    const newHeight = Math.max(1, Math.floor(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process image.");
    }

    context.drawImage(image, 0, 0, newWidth, newHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      throw new Error("Unable to process image.");
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([blob], `${baseName}-optimized.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
