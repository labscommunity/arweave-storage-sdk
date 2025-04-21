export const importDynamic = async (path: string): Promise<any> => {
  try {
    // Try ESM import first
    const module = await import(path)
    return module.default || module
  } catch {
    // Fallback to CJS require
    try {
      // @ts-ignore
      const module = require(path)
      return module.default || module
    } catch {
      throw new Error(`Failed to import module: ${path}`)
    }
  }
}
