import sharp from 'sharp';
import path from 'path';
import { unlinkSync } from 'fs';
import { getRandomId } from '../shared/idGenerator';
export const inhenceImages = async (images: string[]) => {
  images = images.map(image => {
    return path.join(process.cwd(), 'uploads', image);
  });

  const tempImages = [];

  for (let image of images) {
    const extname = path.extname(image);
    const fileName = getRandomId('DOC', 3) + extname;
    const outputPath = path.join(process.cwd(), 'uploads', 'image', fileName);
    await sharp(image)
      .resize({ width: 1920 }) // resize to larger (HD quality)
      .jpeg({ quality: 100 })
      .modulate({
        brightness: 1.1, 
        saturation: 1.2, 
      })
      .sharpen()
      .sharpen()
      .grayscale()
    //   .threshold(150) 

      .toFile(outputPath);
    tempImages.push('/image/' + fileName);
    unlinkSync(image);
  }
  return tempImages;
};
