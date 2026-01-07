# _"Hello, World!"_

## Introduction

In this example you will use Streams in order to log "Hello, World!" to the console.

## Implement the example

### Implement the `index.ts` module

#### Import the Logger, Formatter, ConsoleHandler, and SyslogLevel enum.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";
```

#### Create an instance of a Logger, Formatter, and ConsoleHandler.

```ts
const logger = new Logger({ name: "hello-logger", level: SyslogLevel.DEBUG });

const formatter = new Formatter({
  format: ({ isotime, message, name, level, func, line, col }) =>
    `${name ?? ""}:${isotime ?? ""}:${level}:${func ?? ""}:${line ?? ""}:${col ?? ""}:${message}\n`,
});

const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });
```

#### Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler.

```ts
const log = logger.connect(formatter.connect(consoleHandler));
```

#### Log "Hello, World!" to the console.

```ts
function sayHello() {
  log.info("Hello, World!");
}

class Greeter {
  public greeting: string;
  constructor(greeating = "Hello, World!", repeat = 1) {
    this.greeting = greeating.repeat(repeat);
  }

  speak() {
    log.info(this.greeting);
  }
}

setInterval(sayHello, 1e3);

sayHello();

const greeter = new Greeter();

greeter.speak();
```

## Run the example

### How to run the example

#### Clone the _Streams_ repository.

```bash
git clone https://github.com/far-analytics/streams-logger.git
```

#### Change directory into the relevant example directory.

```bash
cd streams-logger/examples/hello_world
```

#### Install the example dependencies.

```bash
npm install && npm update
```

#### Build the application.

```bash
npm run clean:build
```

#### Run the application.

```bash
npm start
```

##### Output

```bash
hello-logger:2026-01-06T23:03:18.326Z:INFO:sayHello:9:9:Hello, World!
hello-logger:2026-01-06T23:03:18.328Z:INFO:Greeter.speak:17:13:Hello, World!
hello-logger:2026-01-06T23:03:19.328Z:INFO:Timeout.sayHello:9:9:Hello, World!
...
```
