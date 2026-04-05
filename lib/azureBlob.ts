import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  type BlockBlobClient,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

function getBlockBlobClient(
  containerName: string,
  blobName: string
): BlockBlobClient {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  return containerClient.getBlockBlobClient(blobName);
}

/**
 * Sube un archivo al almacenamiento de Azure Blob.
 * Crea el contenedor si no existe y devuelve la URL permanente del archivo.
 * 
 * @param params - Objeto con el nombre del contenedor, nombre del blob y el archivo (File).
 * @returns Un objeto con la URL, nombre, tamaño y tipo de contenido del blob.
 */
export async function uploadToAzureBlob(params: {
  containerName: string;
  blobName: string;
  file: File;
}) {
  const { containerName, blobName, file } = params;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  const blockBlobClient = getBlockBlobClient(containerName, blobName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: file.type || "application/octet-stream",
    },
  });

  return {
    url: blockBlobClient.url, // URL permanente (sin SAS)
    blobName,
    size: file.size,
    contentType: file.type,
  };
}

/**
 * Elimina un blob del almacenamiento de Azure dado su contenedor y nombre.
 * 
 * @param containerName - Nombre del contenedor de Azure.
 * @param blobName - Nombre del archivo (blob) a eliminar.
 */
export async function deleteFromAzureBlob(
  containerName: string,
  blobName: string
) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

/**
 * Extrae el nombre del blob desde una URL completa si se conoce el nombre del contenedor.
 * 
 * @param fullUrl - URL completa del blob.
 * @param containerName - Nombre del contenedor donde se encuentra.
 * @returns El nombre del blob decodificado o null si no coincide con el contenedor.
 */
export function extractBlobNameFromUrl(
  fullUrl: string,
  containerName: string
): string | null {
  try {
    const url = new URL(fullUrl);
    const prefix = `/${containerName}/`;
    if (url.pathname.startsWith(prefix)) {
      return decodeURIComponent(url.pathname.substring(prefix.length));
    }
    return null;
  } catch (error) {
    console.error("Error parsing blob URL:", fullUrl, error);
    return null;
  }
}

/**
 * Analiza una URL de Azure Blob para extraer el nombre del contenedor y el nombre del blob.
 * 
 * @param blobUrl - URL completa del blob de Azure.
 * @returns Un objeto con containerName y blobName.
 * @throws Error si la URL no es válida para Azure Blob.
 */
export function parseAzureBlobUrl(blobUrl: string) {
  const u = new URL(blobUrl);
  const parts = u.pathname.split("/").filter(Boolean); // [container, ...blobPath]
  const containerName = parts[0];
  const rawBlobName = parts.slice(1).join("/");
  const blobName = decodeURIComponent(rawBlobName);
  if (!containerName || !blobName) throw new Error("URL de blob inválida");
  return { containerName, blobName };
}

/**
 * Genera una URL con firma de acceso compartido (SAS) temporal de solo lectura para un blob.
 * Útil para dar acceso temporal a archivos privados.
 * 
 * @param blobUrl - URL original del blob.
 * @param expiresInMinutes - Minutos de validez del token SAS (por defecto 10).
 * @returns La URL completa concatenada con el token SAS generado.
 */
export function getReadSasUrlFromBlobUrl(
  blobUrl: string,
  expiresInMinutes = 10
) {
  const { containerName, blobName } = parseAzureBlobUrl(blobUrl);

  const now = new Date();
  const startsOn = new Date(now.getTime() - 5 * 60 * 1000); // ✅ anti clock-skew
  const expiresOn = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
    },
    sharedKeyCredential
  ).toString();

  const base = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  return `${base}?${sas}`;
}

/**
 * Elimina un blob del almacenamiento de Azure utilizando directamente su URL.
 * 
 * @param blobUrl - URL completa del blob a eliminar.
 */
export async function deleteBlobByUrl(blobUrl: string) {
  const { containerName, blobName } = parseAzureBlobUrl(blobUrl);
  await deleteFromAzureBlob(containerName, blobName);
}
