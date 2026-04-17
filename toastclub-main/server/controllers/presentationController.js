import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const sofficeExecutable =
  process.platform === "win32"
    ? "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
    : "soffice";

const removeDirSafe = async (dirPath) => {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors for temp directories.
  }
};

export const convertPresentationToPdf = async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).send("Debes adjuntar un archivo PPT o PPTX.");
  }

  const extension = path.extname(uploadedFile.originalname).toLowerCase();

  if (extension !== ".ppt" && extension !== ".pptx") {
    return res.status(400).send("Solo se admiten archivos PPT o PPTX.");
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "toastclub-presentation-"));
  const inputPath = path.join(tempDir, uploadedFile.originalname);
  const outputPath = path.join(
    tempDir,
    `${path.basename(uploadedFile.originalname, extension)}.pdf`
  );

  try {
    await fs.writeFile(inputPath, uploadedFile.buffer);

    try {
      await execFileAsync(sofficeExecutable, [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        tempDir,
        inputPath,
      ]);
    } catch {
      return res.status(503).send(
        "La conversion de PPT/PPTX requiere LibreOffice (comando soffice) instalado en el servidor."
      );
    }

    const pdfBuffer = await fs.readFile(outputPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(outputPath)}"`
    );

    return res.status(200).send(pdfBuffer);
  } finally {
    await removeDirSafe(tempDir);
  }
};
