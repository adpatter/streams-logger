import * as pth from "node:path";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as stream from "node:stream";
import { once } from "node:events";
import { LogContext } from "../commons/log_context.js";
import { Node } from "../commons/node.js";
import { SyslogLevel } from "../commons/syslog.js";
import Config from "../commons/config.js";

export const $rotate = Symbol("rotate");
export const $option = Symbol("option");
export const $path = Symbol("path");
export const $writeStream = Symbol("writeStream");
export const $size = Symbol("size");
export const $level = Symbol("level");
export const $rotationLimit = Symbol("rotationLimit");
export const $maxSize = Symbol("maxSize");
export const $encoding = Symbol("encoding");
export const $mode = Symbol("mode");

export class RotatingFileHandlerTransform<MessageT> extends stream.Transform {
  protected [$path]: string;
  protected [$writeStream]: fs.WriteStream;
  protected [$size]: number;
  protected [$level]: SyslogLevel;
  protected [$rotationLimit]: number;
  protected [$maxSize]: number;
  protected [$mode]: number;
  protected [$encoding]: NodeJS.BufferEncoding;

  constructor(options: RotatingFileHandlerOptions, transformOptions?: stream.TransformOptions) {
    super({
      ...Config.getDuplexOptions(true, true),
      ...transformOptions,
      ...{
        writableObjectMode: true,
        readableObjectMode: true,
      },
    });
    this[$level] = options.level ?? SyslogLevel.WARN;
    this[$rotationLimit] = options.rotationLimit ?? 0;
    this[$maxSize] = options.maxSize ?? 1e6;
    this[$encoding] = options.encoding ?? "utf-8";
    this[$mode] = options.mode ?? 0o666;
    this[$path] = pth.resolve(pth.normalize(options.path));
    this[$size] = 0;

    if (fs.existsSync(this[$path])) {
      this[$size] = fs.statSync(this[$path]).size;
    }

    this.cork();
    this[$writeStream] = fs.createWriteStream(this[$path], {
      mode: this[$mode],
      encoding: this[$encoding],
      flush: true,
      autoClose: true,
      flags: options.flags ?? "a",
    });
    this[$writeStream].on("error", Config.errorHandler);
    this.pipe(this[$writeStream]);
    once(this[$writeStream], "ready")
      .then(() => {
        this.uncork();
      })
      .catch(Config.errorHandler);

    this.once("error", () => {
      this[$writeStream].close();
    });
  }

  public _transform(
    logContext: LogContext<MessageT>,
    encoding: BufferEncoding,
    callback: stream.TransformCallback
  ): void {
    if (SyslogLevel[logContext.level] > this[$level]) {
      callback();
      return;
    }
    if (this[$writeStream].closed) {
      callback(this[$writeStream].errored ?? new Error("The `WriteStream` closed."));
      return;
    }
    const message: Buffer =
      logContext.message instanceof Buffer
        ? logContext.message
        : typeof logContext.message == "string"
          ? Buffer.from(logContext.message, this[$encoding])
          : Buffer.from(JSON.stringify(logContext.message), this[$encoding]);
    (async () => {
      if (this[$size] + message.length > this[$maxSize]) {
        await this[$rotate]();
      }
      this[$size] = this[$size] + message.length;
      if (this[$writeStream].closed) {
        callback(this[$writeStream].errored ?? new Error("The `WriteStream` closed."));
        return;
      }
      callback(null, message);
    })().catch((err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      callback(error);
      Config.errorHandler(error);
    });
  }

  protected async [$rotate]() {
    this.unpipe(this[$writeStream]);
    this[$writeStream].close();
    await once(this[$writeStream], "close");
    if (this[$rotationLimit] === 0) {
      await fsp.rm(this[$path], { force: true });
    } else {
      for (let i = this[$rotationLimit] - 1; i >= 0; i--) {
        let path;
        if (i == 0) {
          path = this[$path];
        } else {
          path = `${this[$path]}.${i.toString()}`;
        }
        try {
          const stats = await fsp.stat(path);
          if (stats.isFile()) {
            const newPath = `${this[$path]}.${(i + 1).toString()}`;
            await fsp.rm(newPath, { force: true });
            await fsp.rename(path, newPath);
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          if ("code" in error && error.code != "ENOENT") {
            Config.errorHandler(error);
          }
        }
      }
    }
    this.cork();
    this[$writeStream] = fs.createWriteStream(this[$path], {
      mode: this[$mode],
      encoding: this[$encoding],
      flush: true,
      autoClose: true,
      flags: "w",
    });
    this[$writeStream].on("error", Config.errorHandler);
    await once(this[$writeStream], "ready");
    this.pipe(this[$writeStream]);
    this.uncork();
    this[$size] = 0;
  }
}

export interface RotatingFileHandlerOptions {
  path: string;
  rotationLimit?: number;
  maxSize?: number;
  encoding?: BufferEncoding;
  mode?: number;
  level?: SyslogLevel;
  flags?: string;
}

export class RotatingFileHandler<MessageT = string> extends Node<
  LogContext<MessageT>,
  never,
  RotatingFileHandlerTransform<MessageT>
> {
  constructor(options: RotatingFileHandlerOptions, transformOptions?: stream.TransformOptions) {
    super(new RotatingFileHandlerTransform<MessageT>(options, transformOptions));
  }

  public setLevel = (level: SyslogLevel): void => {
    this._stream[$level] = level;
  };

  public get level(): SyslogLevel {
    return this._stream[$level];
  }
}
