const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SIZE = 1024;
const OUT = path.join(__dirname, 'assets');
const iconSrc = path.join(OUT, 'financeflow-app-icon.png');
const splashSrc = path.join(OUT, 'financeflow-splash-logo.png');

async function main() {
  if (!fs.existsSync(iconSrc) || !fs.existsSync(splashSrc)) {
    throw new Error(`Missing generated logos:\n${iconSrc}\n${splashSrc}`);
  }

  await sharp(iconSrc).resize(SIZE, SIZE).png().toFile(path.join(OUT, 'icon.png'));
  await sharp(iconSrc).resize(SIZE, SIZE).png().toFile(path.join(OUT, 'logo.png'));
  await sharp(splashSrc).resize(SIZE, SIZE).png().toFile(path.join(OUT, 'splash-icon.png'));

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 79, g: 70, b: 229, alpha: 1 },
    },
  })
    .png()
    .toFile(path.join(OUT, 'android-icon-background.png'));

  await sharp(iconSrc).resize(SIZE, SIZE).png().toFile(path.join(OUT, 'android-icon-foreground.png'));

  await sharp(iconSrc)
    .resize(SIZE, SIZE)
    .greyscale()
    .threshold(180)
    .png()
    .toFile(path.join(OUT, 'android-icon-monochrome.png'));

  await sharp(iconSrc).resize(48, 48).png().toFile(path.join(OUT, 'favicon.png'));

  console.log('FinanceFlow icons written to assets/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
