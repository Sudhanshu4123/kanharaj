import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendDir = path.resolve(__dirname, '..')

const sourceLogo = path.join(frontendDir, 'public', 'logo.png')
const resDir = path.join(frontendDir, 'android', 'app', 'src', 'main', 'res')

if (!fs.existsSync(sourceLogo)) {
  console.error('Source logo not found at:', sourceLogo)
  process.exit(1)
}

const launcherSizes = [
  { dir: 'mipmap-mdpi', size: 48, foreSize: 108 },
  { dir: 'mipmap-hdpi', size: 72, foreSize: 162 },
  { dir: 'mipmap-xhdpi', size: 96, foreSize: 216 },
  { dir: 'mipmap-xxhdpi', size: 144, foreSize: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, foreSize: 432 }
]

const splashSizes = [
  { dir: 'drawable', width: 480, height: 800 },
  { dir: 'drawable-port-mdpi', width: 320, height: 480 },
  { dir: 'drawable-port-hdpi', width: 480, height: 800 },
  { dir: 'drawable-port-xhdpi', width: 720, height: 1280 },
  { dir: 'drawable-port-xxhdpi', width: 960, height: 1600 },
  { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
  { dir: 'drawable-land-mdpi', width: 480, height: 320 },
  { dir: 'drawable-land-hdpi', width: 800, height: 480 },
  { dir: 'drawable-land-xhdpi', width: 1280, height: 720 },
  { dir: 'drawable-land-xxhdpi', width: 1600, height: 960 },
  { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280 }
]

async function generateAndroidAssets() {
  console.log('Generating Android icons and splash screens from logo.png...')

  // 1. Generate Launcher Icons
  for (const item of launcherSizes) {
    const targetFolder = path.join(resDir, item.dir)
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true })

    // ic_launcher.png
    await sharp(sourceLogo)
      .resize(item.size, item.size)
      .toFile(path.join(targetFolder, 'ic_launcher.png'))

    // ic_launcher_round.png
    await sharp(sourceLogo)
      .resize(item.size, item.size)
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'))

    // ic_launcher_foreground.png
    await sharp(sourceLogo)
      .resize(item.foreSize, item.foreSize)
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'))
  }

  // 2. Generate Splash Screens with dark theme #0a2540 background & centered logo
  for (const item of splashSizes) {
    const targetFolder = path.join(resDir, item.dir)
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true })

    const logoSize = Math.min(item.width, item.height) * 0.45
    const resizedLogo = await sharp(sourceLogo)
      .resize(Math.round(logoSize), Math.round(logoSize))
      .toBuffer()

    await sharp({
      create: {
        width: item.width,
        height: item.height,
        channels: 4,
        background: { r: 10, g: 37, b: 64, alpha: 1 } // #0a2540 dark brand background
      }
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(targetFolder, 'splash.png'))
  }

  console.log('✅ Android Launcher Icons & Splash Screens generated successfully!')
}

generateAndroidAssets().catch(err => {
  console.error('Error generating Android assets:', err)
  process.exit(1)
})
