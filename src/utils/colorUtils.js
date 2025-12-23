/**
 * Generates a pleasant, distinct color for a given index using Golden Angle approximation.
 * This ensures that even with many users, colors remain distinct and visually pleasing.
 * 
 * @param {number} index - The index/offset for the color generation.
 * @return {string} - The generated color in HSL format.
 */
export const generateColor = (index) => {
  // Golden angle approximation to maximize distinctness
  const goldenAngle = 137.508;
  const hue = (index * goldenAngle) % 360;
  
  // Saturation and Lightness fixed to pleasant values
  // S: 70% (vibrant but not neon)
  // L: 50% (readable against white text, visible against white bg)
  return `hsl(${hue}, 70%, 50%)`;
};
