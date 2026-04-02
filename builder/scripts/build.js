const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Read JSON config
const configPath = process.argv[2] || path.join(__dirname, '../build-config.json');
if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    process.exit(1);
}

const buildConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { appName, applicationId, config } = buildConfig;

if (!appName || !applicationId || !config) {
    console.error('❌ Error: Missing required fields in build config (appName, applicationId, or config)');
    process.exit(1);
}

console.log(`🚀 Starting automated build for: ${appName} (${applicationId})`);

// 2. Update src/config.ts
const configTSPath = path.join(__dirname, '../src/config.ts');
const configTSContent = `
interface LoaderConfig {
    useLoader: boolean,
    strategy: 'initial' | 'every-navigation',
    color: string,
    loaderBgColor: string
}

interface RenderConfig {
    url: string,
    loaderConfig: LoaderConfig,
    css: string | undefined,
    enabledPullToRefresh: boolean | undefined
}

export const config: RenderConfig = ${JSON.stringify(config, null, 4)};
`;
fs.writeFileSync(configTSPath, configTSContent.trim() + '\n');
console.log('✅ Updated src/config.ts');

// 3. Update android/app/src/main/res/values/strings.xml for App Name
const stringsXMLPath = path.join(__dirname, '../android/app/src/main/res/values/strings.xml');
let stringsXML = fs.readFileSync(stringsXMLPath, 'utf8');
stringsXML = stringsXML.replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${appName}</string>`);
fs.writeFileSync(stringsXMLPath, stringsXML);
console.log('✅ Updated App Name in strings.xml');

// 4. Update android/app/build.gradle for Application ID
const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

// Update applicationId
buildGradle = buildGradle.replace(/applicationId ".*?"/, `applicationId "${applicationId}"`);

// Update namespace (required for modern Gradle/React Native versions)
buildGradle = buildGradle.replace(/namespace ".*?"/, `namespace "${applicationId}"`);

fs.writeFileSync(buildGradlePath, buildGradle);
console.log('✅ Updated Application ID in build.gradle');

// 5. Build APK
console.log('🏗️  Running Gradle build (assembleDebug)...');
try {
    const androidDir = path.join(__dirname, '../android');
    execSync('./gradlew assembleDebug', { 
        cwd: androidDir, 
        stdio: 'inherit' 
    });
    console.log('\n✨ Build Successful! ✨');
    console.log(`📍 APK path: ${path.join(androidDir, 'app/build/outputs/apk/debug/app-debug.apk')}`);
} catch (error) {
    console.error('❌ Build failed. Check the logs above.');
    process.exit(1);
}
