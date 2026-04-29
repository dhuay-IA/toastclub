import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerPort = new Worker(
  new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
  { type: "module" }
);

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

const isConfiguredUrl = (value?: string) =>
  Boolean(value && !value.includes("YOUR_API_URL"));

const getApiBaseUrl = () => {
  if (!isConfiguredUrl(API_URL)) {
    throw new Error(
      "Configura VITE_API_URL en .env.local para procesar presentaciones PPT o PPTX."
    );
  }

  return API_URL!.replace(/\/+$/, "");
};

const renderPdfBufferToImages = async (buffer: ArrayBuffer) => {
  const pdf = await getDocument({ data: buffer }).promise;
  const images: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("No se pudo preparar el lienzo para renderizar el PDF.");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;
    images.push(canvas.toDataURL("image/png"));
  }

  return images;
};

export const convertPdfFileToImages = async (file: File) => {
  const buffer = await file.arrayBuffer();
  return renderPdfBufferToImages(buffer);
};

export const convertPresentationFileToImages = async (file: File) => {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("presentation", file);

  let res: Response;

  try {
    res = await fetch(`${baseUrl}/api/presentations/convert-to-pdf`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      `No se pudo conectar con la API en ${baseUrl} para convertir el archivo.`
    );
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "No se pudo convertir la presentacion a PDF.");
  }

  const pdfBuffer = await res.arrayBuffer();
  return renderPdfBufferToImages(pdfBuffer);
};
