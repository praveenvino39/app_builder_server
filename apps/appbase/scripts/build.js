const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
// const config = require('../builds/buildConfig.json')



const configString = process.argv[2]
const jobId = process.argv[3]

if (!jobId) {
    return console.error('❌ Error: Missing job ID');
}


console.log("configString ", configString + "\n")

if (!configString) {
    return console.error('❌ Error: Missing config object');
}

let config = {}

try {
    config = JSON.parse(configString);
} catch (error) {
    return console.error('❌ Error: Invalid config object');
}


if (!config.appName) {
    return console.error('❌ Error: Missing appName');
}

if (!config.applicationId) {
    return console.error('❌ Error: Missing applicationId');
}

if (!config.url || config.url.length === 0) {
    return console.error('❌ Error: Missing url');
}

const regex = new RegExp(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
)

if (!regex.test(config.url)) {
    return console.error('❌ Error: Invalid url');
}

if (!config.loaderConfig) {
    config.loaderConfig = {
        useLoader: false,
        strategy: 'initial',
        color: '#45be4c',
        loaderBgColor: 'white'
    }
} else {
    if (!config.loaderConfig.useLoader) {
        config.loaderConfig.useLoader = false;
    }
    if (!config.loaderConfig.strategy) {
        config.loaderConfig.strategy = 'initial';
    }
    if (!config.loaderConfig.color) {
        config.loaderConfig.color = '#45be4c';
    }
    if (!config.loaderConfig.loaderBgColor) {
        config.loaderConfig.loaderBgColor = 'white';
    }
}

if (!config.css) {
    config.css = "";
}

if (!config.enabledPullToRefresh) {
    config.enabledPullToRefresh = false;
}


writeBuildConfig(config)

changeAppName(config.appName)

changeApplicationId(config.applicationId)

changeApkName(`${config.appName}-${jobId}`)

// changeNamespace(config.applicationId)


startBuild()

function changeApkName(apkName) {
    // // 4. Update android/app/build.gradle for Application ID
    const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
    let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

    // Update applicationId
    buildGradle = buildGradle.replace(/def newApkName = "APPNAME_REPLACE_ME.apk"/, `def newApkName = "${apkName}.apk"`);

    // Update namespace(required for modern Gradle / React Native versions)
    // buildGradle = buildGradle.replace(/namespace ".*?"/, `namespace "${applicationId}"`);

    fs.writeFileSync(buildGradlePath, buildGradle);
    console.log('✅ Updated output file name in build.gradle');
}

function writeBuildConfig(config) {
    const buildConfigPath = path.join(__dirname, '../builds/buildConfig.json');
    fs.writeFileSync(buildConfigPath, JSON.stringify(config, null, 2));
    console.log('✅ Updated buildConfig.json');
}

function changeApplicationId(applicationId) {
    // // 4. Update android/app/build.gradle for Application ID
    const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
    let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

    // Update applicationId
    buildGradle = buildGradle.replace(/applicationId ".*?"/, `applicationId "${applicationId}"`);

    // Update namespace(required for modern Gradle / React Native versions)
    // buildGradle = buildGradle.replace(/namespace ".*?"/, `namespace "${applicationId}"`);

    fs.writeFileSync(buildGradlePath, buildGradle);
    console.log('✅ Updated Application ID in build.gradle');
}


function changeAppName(appName) {
    const stringsXMLPath = path.join(__dirname, '../android/app/src/main/res/values/strings.xml');
    let stringsXML = fs.readFileSync(stringsXMLPath, 'utf8');
    stringsXML = stringsXML.replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${config.appName}</string>`);
    fs.writeFileSync(stringsXMLPath, stringsXML);
    console.log('✅ Updated App Name in strings.xml');
}

function startBuild() {
    try {
        const androidDir = path.join(__dirname, '../android');
        exec('./gradlew assembleRelease', {
            cwd: androidDir,
            stdio: 'inherit'
        });

        setTimeout(() => {
            // Reset build.gradle to default
            const buildGradleOriginalPath = path.join(__dirname, '../android/app/build_original.gradle');
            const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
            const buildGradleOriginal = fs.readFileSync(buildGradleOriginalPath, 'utf8');
            fs.writeFileSync(buildGradlePath, buildGradleOriginal);
        }, 1000);

        console.log(`✅ Reset build.gradle to default`);
        console.log('\n✨ Build Successful! ✨');
        console.log(`📍 APK path: ${path.join(androidDir, `app/build/outputs/apk/release/${config.appName}-${jobId}.apk`)}`);
    } catch (error) {
        console.error(error)
        console.error('❌ Build failed. Check the logs above.');
        process.exit(1);
    }
}


// console.log(config)

// changeAppName(config.appName)

// changeApplicationId(config.applicationId)

// try {
//     const androidDir = path.join(__dirname, '../android');
//     execSync('./gradlew clean assembleDebug', {
//         cwd: androidDir,
//         stdio: 'inherit'
//     });
//     console.log('\n✨ Build Successful! ✨');
//     console.log(`📍 APK path: ${path.join(androidDir, 'app/build/outputs/apk/debug/app-debug.apk')}`);
// } catch (error) {
//     console.error('❌ Build failed. Check the logs above.');
//     process.exit(1);
// }


// 1. Read JSON config
// const configPath = process.argv[2] || path.join(__dirname, '../build-config.json');
// if (!fs.existsSync(configPath)) {
//     console.error(`Config file not found: ${configPath}`);
//     process.exit(1);
// }

// const buildConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
// const { appName, applicationId, config } = buildConfig;

// // Strict robustness check: reject missing values or literal "undefined" strings
// const isValid = (val) => val && val !== 'undefined';

// if (!isValid(appName) || !isValid(applicationId) || !isValid(config)) {
//     console.error('❌ Error: Missing or corrupted required fields in build config (appName, applicationId, or config)');
//     console.error(`Received: appName=${appName}, applicationId=${applicationId}`);
//     process.exit(1);
// }

// console.log(`🚀 Starting automated build for: ${appName} (${applicationId})`);

// // 2. Update src/config.ts
// const configTSPath = path.join(__dirname, '../src/config.ts');
// const configTSContent = `
// interface LoaderConfig {
//     useLoader: boolean,
//     strategy: 'initial' | 'every-navigation',
//     color: string,
//     loaderBgColor: string
// }

// interface RenderConfig {
//     url: string,
//     loaderConfig: LoaderConfig,
//     css: string | undefined,
//     enabledPullToRefresh: boolean | undefined
// }

// export const config: RenderConfig = ${JSON.stringify(config, null, 4)};
// `;
// fs.writeFileSync(configTSPath, configTSContent.trim() + '\n');
// console.log('✅ Updated src/config.ts');

// // 3. Update android/app/src/main/res/values/strings.xml for App Name
// const stringsXMLPath = path.join(__dirname, '../android/app/src/main/res/values/strings.xml');
// let stringsXML = fs.readFileSync(stringsXMLPath, 'utf8');
// stringsXML = stringsXML.replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${appName}</string>`);
// fs.writeFileSync(stringsXMLPath, stringsXML);
// console.log('✅ Updated App Name in strings.xml');

// // 4. Update android/app/build.gradle for Application ID
// const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
// let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

// // Update applicationId
// buildGradle = buildGradle.replace(/applicationId ".*?"/, `applicationId "${applicationId}"`);

// // Update namespace (required for modern Gradle/React Native versions)
// buildGradle = buildGradle.replace(/namespace ".*?"/, `namespace "${applicationId}"`);

// fs.writeFileSync(buildGradlePath, buildGradle);
// console.log('✅ Updated Application ID in build.gradle');

// // 5. Build APK
// console.log('🏗️  Running Gradle build (clean assembleDebug)...');
// try {
//     const androidDir = path.join(__dirname, '../android');
//     execSync('./gradlew clean assembleDebug', { 
//         cwd: androidDir, 
//         stdio: 'inherit' 
//     });
//     console.log('\n✨ Build Successful! ✨');
//     console.log(`📍 APK path: ${path.join(androidDir, 'app/build/outputs/apk/debug/app-debug.apk')}`);
// } catch (error) {
//     console.error('❌ Build failed. Check the logs above.');
//     process.exit(1);
// }
