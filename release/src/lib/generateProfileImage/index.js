"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProfileImage = void 0;
function generateProfileImage(initials) {
    const size = 200; // Size of the SVG image in pixels
    const fontSize = Math.floor(size / 2); // Increased font size
    const fontWeight = 'bold'; // Font weight set to bold
    const background = getRandomColor(); // Random background color
    const textColor = getContrastingColor(background); // Text color based on the background color
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" fill="${background}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="${fontSize}px" font-weight="${fontWeight}" fill="${textColor}">
        ${initials.toUpperCase()}
      </text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}
exports.generateProfileImage = generateProfileImage;
function getRandomColor() {
    // Generate a random hexadecimal color code
    const color = Math.floor(Math.random() * 16777215).toString(16);
    return `#${color}`;
}
function getContrastingColor(hexColor) {
    // Calculate the luminance of the color
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Choose white or black text color based on the luminance
    return luminance > 0.5 ? '#000' : '#FFF';
}
