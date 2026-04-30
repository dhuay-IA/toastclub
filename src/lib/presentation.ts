import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const RAILWAY_API_URL = "https://toastclub-production.up.railway.app";
const LOCAL_HOST_NAMES = ["local" + "host", "127.0" + ".0.1"];

let pdfWorkerReady = false;

const isConfiguredUrl = (value?: string) =>
  Boolean(value && !value.includes("YOUR_API_URL"));

const isLocalApiUrl = (value?: string) => {
  if (!value) return false;

  try {
    return LOCAL_HOST_NAMES.includes(new URL(value).hostname);
  } catch {
    return false;
  }
};

const isRunningOnPublicHost = () => {
  if (typeof window === "undefined") return false;

  return !LOCAL_HOST_NAMES.includes(window.location.hostname);
};

const getApiBaseUrl = () => {
  const resolvedApiUrl =
    isRunningOnPublicHost() && isLocalApiUrl(API_URL) ? RAILWAY_API_URL : API_URL;

  if (!isConfiguredUrl(resolvedApiUrl)) {
    throw new Error(
      "Configura VITE_API_URL en .env.local para procesar presentaciones PPT o PPTX."
    );
  }

  return resolvedApiUrl!.replace(/\/+$/, "");
};

const ensurePdfWorker = () => {
  if (pdfWorkerReady || GlobalWorkerOptions.workerPort) {
    return;
  }

  GlobalWorkerOptions.workerPort = new Worker(
    new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
    { type: "module" }
  );
  pdfWorkerReady = true;
};

const renderPdfBufferToImages = async (buffer: ArrayBuffer) => {
  ensurePdfWorker();

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
