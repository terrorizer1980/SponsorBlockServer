import fs from "fs";
import { SBSConfig } from "./types/config.model";
import packageJson from "../package.json";

const isTestMode = process.env.npm_lifecycle_script === packageJson.scripts.test;
const configFile = process.env.TEST_POSTGRES ? "ci.json"
    : isTestMode ? "test.json"
        : "config.json";
export const config: SBSConfig = JSON.parse(fs.readFileSync(configFile).toString("utf8"));

migrate(config);
addDefaults(config, {
    port: 80,
    behindProxy: "X-Forwarded-For",
    db: "./databases/sponsorTimes.db",
    privateDB: "./databases/private.db",
    createDatabaseIfNotExist: true,
    schemaFolder: "./databases",
    dbSchema: "./databases/_sponsorTimes.db.sql",
    privateDBSchema: "./databases/_private.db.sql",
    readOnly: false,
    webhooks: [],
    categoryList: ["sponsor", "selfpromo", "exclusive_access", "interaction", "intro", "outro", "preview", "music_offtopic", "filler", "poi_highlight", "chapter"],
    categorySupport: {
        sponsor: ["skip", "mute", "full"],
        selfpromo: ["skip", "mute", "full"],
        exclusive_access: ["full"],
        interaction: ["skip", "mute"],
        intro: ["skip", "mute"],
        outro: ["skip", "mute"],
        preview: ["skip", "mute"],
        filler: ["skip", "mute"],
        music_offtopic: ["skip"],
        poi_highlight: ["poi"],
        chapter: ["chapter"]
    },
    maxNumberOfActiveWarnings: 1,
    hoursAfterWarningExpires: 24,
    adminUserID: "",
    discordCompletelyIncorrectReportWebhookURL: null,
    discordFirstTimeSubmissionsWebhookURL: null,
    discordNeuralBlockRejectWebhookURL: null,
    discordFailedReportChannelWebhookURL: null,
    discordReportChannelWebhookURL: null,
    getTopUsersCacheTimeMinutes: 0,
    globalSalt: null,
    mode: "",
    neuralBlockURL: null,
    proxySubmission: null,
    rateLimit: {
        vote: {
            windowMs: 900000,
            max: 20,
            message: "Too many votes, please try again later",
            statusCode: 429,
        },
        view: {
            windowMs: 900000,
            max: 20,
            statusCode: 200,
            message: "Too many views, please try again later",
        },
        rate: {
            windowMs: 900000,
            max: 20,
            statusCode: 200,
            message: "Success",
        }
    },
    userCounterURL: null,
    newLeafURLs: null,
    maxRewardTimePerSegmentInSeconds: 600,
    poiMinimumStartTime: 2,
    postgres: null,
    dumpDatabase: {
        enabled: false,
        minTimeBetweenMs: 60000,
        appExportPath: "./docker/database-export",
        postgresExportPath: "/opt/exports",
        tables: [{
            name: "sponsorTimes",
            order: "timeSubmitted"
        },
        {
            name: "userNames"
        },
        {
            name: "categoryVotes"
        },
        {
            name: "lockCategories",
        },
        {
            name: "warnings",
            order: "issueTime"
        },
        {
            name: "vipUsers"
        }]
    },
    diskCache: null,
    crons: null
});

// Add defaults
function addDefaults(config: SBSConfig, defaults: SBSConfig) {
    for (const key in defaults) {
        if (!Object.prototype.hasOwnProperty.call(config, key)) {
            config[key] = defaults[key];
        }
    }
}

function migrate(config: SBSConfig) {
    // Redis change
    if (config.redis) {
        const redisConfig = config.redis as any;
        if (redisConfig.host || redisConfig.port) {
            config.redis.socket = {
                host: redisConfig.host,
                port: redisConfig.port
            };
        }

        if (redisConfig.enable_offline_queue !== undefined) {
            config.disableOfflineQueue = !redisConfig.enable_offline_queue;
        }
    }
}