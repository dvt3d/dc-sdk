// Shared by the decoder Worker and the compatibility path; no scene dependencies.
export function resampleTerrain(bytes, dataType) {
  const stride = dataType === 'float' ? 4 : 2
  if (bytes.byteLength !== 150 * 150 * stride) {
    throw new Error('Invalid TDT terrain sample count.')
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const buffer = new Float32Array(64 * 64)
  for (let row = 0; row < 64; row++) {
    const rowOffset = Math.floor((149 * row) / 63) * 150 * stride
    for (let col = 0; col < 64; col++) {
      // Preserve nearest-neighbour sampling, both edges and negative heights.
      const offset = rowOffset + Math.floor((149 * col) / 63) * stride
      const height =
        stride === 2
          ? view.getInt16(offset, true)
          : view.getFloat32(offset, true)
      buffer[row * 64 + col] =
        Number.isFinite(height) && height >= -2000 && height <= 10000
          ? height
          : 0
    }
  }
  return buffer
}
