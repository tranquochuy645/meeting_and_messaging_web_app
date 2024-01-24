import svg2img from 'svg2img';

const size = 48; // Size of the SVG image in pixels
const fontSize = 24 // Increased font size
const fontWeight = 'bold'; // Font weight set to bold

interface Callback{
  (err: Error, buffer: string | ArrayBuffer): Promise<void>;}
  
class DefaultProfileImageGenerator {

  /**
   * Create a DefaultProfileImage instance with the specified initials.
   * @param initials - The initials to be displayed on the profile image.
   * @param cb - callback fn
   */
  public static create(initials: string, cb:Callback){
    initials = initials.substr(0, 1).toUpperCase();
    const background = this.getRandomColor(); // Random background color
    const textColor = this.getContrastingColor(background); // Text color based on the background color
    const resultSVG =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="${background}" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="${fontSize}px" font-weight="${fontWeight}" fill="${textColor}">
      ${initials}
    </text>
    </svg>`;
    svg2img(
      resultSVG,
      cb
    );
  }

  private static getRandomColor(): string {
    // Generate a random hexadecimal color code
    const color = Math.floor(Math.random() * 16777215).toString(16);
    return `#${color}`;
  }

  private static getContrastingColor(hexColor: string): string {
    // Calculate the luminance of the color
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Choose white or black text color based on the luminance
    return luminance > 0.5 ? '#000' : '#FFF';
  }
}
export { DefaultProfileImageGenerator };
