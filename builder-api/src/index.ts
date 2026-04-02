import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// CONFIG
const PORT = process.env.PORT || 3000;
const CONCURRENCY_LIMIT = parseInt(process.env.CONCURRENCY || '1');
const BUILDER_PATH = path.resolve(__dirname, '../../builder');

// IN-MEMORY STORAGE
interface BuildJob {
    id: string;
    config: any;
    status: 'QUEUED' | 'BUILDING' | 'COMPLETED' | 'FAILED';
    apkPath?: string;
    error?: string;
    startTime?: number;
    endTime?: number;
}

const jobs = new Map<string, BuildJob>();
const queue: string[] = [];
let activeBuilds = 0;

// HELPERS
const processQueue = async () => {
    if (activeBuilds >= CONCURRENCY_LIMIT || queue.length === 0) {
        return;
    }

    const buildId = queue.shift();
    if (!buildId) return;

    const job = jobs.get(buildId);
    if (!job) return;

    activeBuilds++;
    job.status = 'BUILDING';
    job.startTime = Date.now();

    console.log(`[Worker] Starting build ${buildId}...`);

    try {
        // 1. Create a temporary config file for this build instance
        const tempConfigDir = path.join(BUILDER_PATH, 'temp-configs');
        if (!fs.existsSync(tempConfigDir)) fs.mkdirSync(tempConfigDir);

        const configPath = path.join(tempConfigDir, `config-${buildId}.json`);
        fs.writeFileSync(configPath, JSON.stringify(job.config, null, 2));

        // 2. Execute the build script
        // Note: We use the absolute path to scripts/build.js inside the builder directory
        const scriptPath = path.join(BUILDER_PATH, 'scripts/build.js');
        const command = `node "${scriptPath}" "${configPath}"`;

        exec(command, { cwd: BUILDER_PATH }, (error, stdout, stderr) => {
            job.endTime = Date.now();

            // Clean up temp config
            if (fs.existsSync(configPath)) fs.unlinkSync(configPath);

            if (error) {
                console.error(`[Worker] Build ${buildId} failed:`, stderr);
                job.status = 'FAILED';
                job.error = stderr || error.message;
            } else {
                console.log(`[Worker] Build ${buildId} completed successfully.`);
                job.status = 'COMPLETED';
                // The build script outputs the APK to a standard path
                // Based on our builder/scripts/build.js output:
                job.apkPath = path.join(BUILDER_PATH, 'android/app/build/outputs/apk/debug/app-debug.apk');

                // Note: In a production environment, you'd want to MOVE the APK to a unique storage
                // to prevent the next build from overwriting it.
                // For this simple API, we'll keep it there but warn about concurrency.
                const finalApkPath = path.join(tempConfigDir, `app-${buildId}.apk`);
                if (fs.existsSync(job.apkPath)) {
                    fs.copyFileSync(job.apkPath, finalApkPath);
                    job.apkPath = finalApkPath;
                }
            }

            activeBuilds--;
            processQueue(); // Check for next job
        });

    } catch (e: any) {
        job.status = 'FAILED';
        job.error = e.message;
        activeBuilds--;
        processQueue();
    }
};

// ROUTES
app.get("/health", (req, res) => {
    res.json({ status: "OK", concurrency: CONCURRENCY_LIMIT, active: activeBuilds, queue: queue.length });
});

/**
 * 1. POST /api/build
 * Accepts the builder configuration and adds it to the queue.
 */
app.post("/api/build", (req, res) => {
    const configData = req.body;

    if (!configData || !configData.appName || !configData.applicationId || !configData.config) {
        return res.status(400).json({ 
            error: "Invalid configuration. 'appName', 'applicationId', and 'config' are all required." 
        });
    }

    const buildId = uuidv4();
    const job: BuildJob = {
        id: buildId,
        config: configData,
        status: 'QUEUED'
    };

    jobs.set(buildId, job);
    queue.push(buildId);

    res.status(202).json({
        buildId,
        status: 'QUEUED',
        message: 'Build added to queue'
    });

    // Trigger worker
    processQueue();
});

/**
 * 2. GET /api/build/status/:id
 * Returns the current status of a build.
 */
app.get("/api/build/status/:id", (req, res) => {
    const { id } = req.params;
    const job = jobs.get(id);

    if (!job) {
        return res.status(404).json({ error: "Build job not found" });
    }

    res.json({
        id: job.id,
        status: job.status,
        error: job.error,
        duration: job.endTime ? (job.endTime - (job.startTime || 0)) / 1000 : null
    });
});

/**
 * 3. GET /api/build/download/:id
 * Serves the generated APK file if completed.
 */
app.get("/api/build/download/:id", (req, res) => {
    const { id } = req.params;
    const job = jobs.get(id);

    if (!job) {
        return res.status(404).json({ error: "Build job not found" });
    }

    if (job.status !== 'COMPLETED' || !job.apkPath) {
        return res.status(400).json({ error: "Build is not completed yet" });
    }

    if (!fs.existsSync(job.apkPath)) {
        return res.status(404).json({ error: "APK file not found on disk" });
    }

    res.download(job.apkPath, `${job.config.appName || 'app'}.apk`);
});

app.listen(PORT, () => {
    console.log(`🚀 Builder Management API started on port ${PORT}`);
    console.log(`🛠️  Concurrency limit: ${CONCURRENCY_LIMIT}`);
});