"use strict";

const config = require("../server/config.local");

class GrayLogLogger {
    constructor() {
        this.log = require("gelf-pro");

        this.log.setConfig({
            fields: {
                facility: config.grayLog.facility,
                service: config.grayLog.service
            },
            adapterName: "udp",
            adapterOptions: {
                host: config.grayLog.host,
                port: config.grayLog.port,
                protocol: "udp4"
            }
        });
    }

    _createPayload(level, message, context) {
        return {
            level_str: Level[level],
            title: message,
            stackTrace: new Error().stack,
            context: JSON.stringify(context)
        };
    }

    logInfo(message, context) {
        this.log.info(
            message,
            this._createPayload(Level.INFO, message, context)
        );
    }

    logWarn(message, context) {
        this.log.warning(
            message,
            this._createPayload(Level.WARN, message, context)
        );
    }

    logDebug(message, context) {
        this.log.debug(
            message,
            this._createPayload(Level.DEBUG, message, context)
        );
    }

    logError(message, context) {
        this.log.error(
            message,
            this._createPayload(Level.ERROR, message, context)
        );
    }

    logException(message, expection, context) {
        if (expection !== null) {
            this.logError(message, { expection, ...context });
        } else {
            this.logError(message, context || {});
        }
    }
}

class ConsoleLogger {
    logInfo(message, context) {
        this._log(Level.INFO, message, context);
    }

    logWarn(message, context) {
        this._log(Level.WARN, message, context);
    }

    logDebug(message, context) {
        this._log(Level.DEBUG, message, context);
    }

    logError(message, context) {
        this._log(Level.ERROR, message, context);
    }

    logException(message, expection, context) {
        if (expection instanceof Error) {
            this.logError(message, () => {
                const { name, message, stack } = expection;
                return {
                    exception: { name, message, stack },
                    level_str: Level.ERROR,
                    ...context
                };
            });
            if (typeof exception === "string" || exception instanceof String) {
                this.logError(message, { exception, ...context });
            } else {
                this.logError(message, context || {});
            }
        }
    }

    _log(level, message, context) {
        console.log(`${level} - ${message} \n ${JSON.stringify(context)}`);
    }
}

const Level = Object.freeze({
    INFO: "INFO",
    DEBUG: "DEBUG",
    WARN: "WARN",
    ERROR: "ERROR",
    EXCEPTION: "EXCEPTION",
    FATAL: "FATAL"
});

class LoggerFactory {
    static getLogger() {
        if (this.logger) {
            return this.logger;
        }
        const grayLogEnabled = config.grayLog.enabled;
        if (grayLogEnabled) {
            this.logger = new GrayLogLogger();
            console.log("[+] Logger set to: GrayLog");
        } else {
            this.logger = new ConsoleLogger();
            console.log("[+] Logger set to: Console");
        }
        return this.logger;
    }
}

const logger = LoggerFactory.getLogger();

module.exports = logger;
