/**
 * Decode base64 string from an array
 */
export function arrayToBase64(bufferSource: ArrayBuffer): string {
  const uint8Array = new Uint8Array(bufferSource)
  return Buffer.from(uint8Array).toString('base64')
}

/**
 * Encode base64 string into an array
 */
export function base64ToArray(base64String: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64String, 'base64'))
}

/**
 * Decode string from an array
 */
export function arrayToString(bufferSource: ArrayBuffer): string {
  return new TextDecoder().decode(bufferSource)
}

/**
 * Encode string into an array
 */
export function stringToArray(string: string): Uint8Array {
  return new TextEncoder().encode(string)
}

/**
 * Encode JSON object into base64 string
 */
export function jsonToBase64(json: object): string {
  const jsonString = JSON.stringify(json)
  const uint8Array = stringToArray(jsonString)
  // Assert that we have an ArrayBuffer
  return arrayToBase64(uint8Array.buffer as ArrayBuffer)
}

/**
 * Decode JSON object from base64 string
 */
export function base64ToJson(b64string: string): object {
  const uint8Array = base64ToArray(b64string)
  // Assert that we have an ArrayBuffer
  const jsonString = arrayToString(uint8Array.buffer as ArrayBuffer)
  return JSON.parse(jsonString)
}

/**
 * Transform an array into data URL
 */
export function arrayToDataUrl(bufferSource: ArrayBuffer): string {
  const base64String = arrayToBase64(bufferSource)
  return `data:application/octet-stream;base64,${base64String}`
}

/**
 * Transform data URL into an array
 */
export async function dataUrlToArray(dataUrl: string): Promise<Uint8Array> {
  // Extract the base64 part from the data URL
  const base64String = dataUrl.split(',')[1]
  return base64ToArray(base64String)
}

/**
 * Transform file blob into an array
 */
export function blobToArray(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result))
      } else {
        reject(new Error('Failed to read blob as ArrayBuffer'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })
}
