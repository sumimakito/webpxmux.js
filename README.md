# WebPXMux.js

A JavaScript library for muxing and demuxing animated WebP images.

## Installation

```bash
npm i --save webpxmux
```

OR

```bash
yarn add webpxmux
```

## Examples

```js
const WebPXMux = require("webpxmux");
const fs = require("fs");

const xMux = WebPXMux();

(async () => {
  const buffer = fs.readFileSync("nyan.webp");
  await xMux.waitRuntime();
  const frames = await xMux.decodeFrames(buffer);
  console.log(frames);
})();

```

Output:

```js
{
  frameCount: 12,
  width: 400,
  height: 400,
  loopCount: 0,
  bgColor: 255,
  frames: [
    { duration: 70, isKeyframe: false, rgba: [Uint32Array] },
    { duration: 70, isKeyframe: false, rgba: [Uint32Array] },
    { duration: 70, isKeyframe: false, rgba: [Uint32Array] },
    { duration: 70, isKeyframe: false, rgba: [Uint32Array] },
    ...
  ]
}
```

## Usage

### Importing WebXMux to your project

```js
const WebPXMux = require("webpxmux");

// OR using the `import` statement
import WebPXMux from 'webpxmux';
```

### Initializing WebXMux

```js
const xMux = WebPXMux(/* optional path to WebAssembly file */);
```

### Waiting for the runtime

```js
await xMux.waitRuntime();

// OR using the Promise
xMux.waitRuntime().then(...);
```

## Development

Since WebPXMux uses [Emscripten](https://emscripten.org/) and [CMake](https://cmake.org/) to build its C
code into WebAssembly, both Emscripten and CMake are required during the development.

### Emscripten

> For more detailed installation instructions, please refer to _[Getting Started: Download and install](https://emscripten.org/docs/getting_started/downloads.html)_.

```bash
# Get the emsdk repo
git clone https://github.com/emscripten-core/emsdk.git

# Enter that directory
cd emsdk

# Fetch the latest version of the emsdk (not needed the first time you clone)
git pull

# Download and install the latest SDK tools.
./emsdk install latest

# Make the "latest" SDK "active" for the current user. (writes .emscripten file)
./emsdk activate latest

# Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh
```

### CMake

Please refer to the [official installation instructions](https://cmake.org/install/).

### Clone the repository

```bash
git clone --recurse-submodules https://github.com/SumiMakito/webpxmux.js.git
```

### Build WebAssembly

This command generates the Makefile using CMake and builds the WebAssembly.

```bash
yarn build:make
```

### Build for Node.js

```bash
yarn build:node
```

### Build for web

```bash
yarn build:web
```
