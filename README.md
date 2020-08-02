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
import WebPXMux from "webpxmux";
```

### Initializing WebXMux

```js
const xMux = WebPXMux(/* optional path to WebAssembly file */);
```

### Waiting for the runtime

The WebAssembly runtime is required to be initialized before
encoding/muxing/demuxing functions can be called.

```js
await xMux.waitRuntime();

// OR using the Promise
xMux.waitRuntime().then(...);
```

> ⚠️ An Error will be thrown if encoding/muxing/demuxing functions are called before runtime being initialized.

### Waiting for the runtime

```js
await xMux.waitRuntime();

// OR using the Promise
xMux.waitRuntime().then(...);
```

### Type: Frame and Frames

#### Frame

```ts
interface Frame {
  duration: number;
  isKeyframe: boolean;
  rgba: Uint32Array;
}
```

`duration`

Duration of current frame in milliseconds.

`isKeyframe`

Whether current frame is keyframe or not.

`rgba`

Stores the RGBA color information (in the `0xRRGGBBAA` order) of each pixel.

Pixel data are ordered from left to right and then from top to bottom.

#### Frames

```ts
interface Frames {
  frameCount: number;
  width: number;
  height: number;
  loopCount: number;
  bgColor: number;
  frames: Frame[];
}
```

`frameCount`

Quantity of frames that are counted in the animated WebP image.

`width` and `height`

Sizes of the image in pixels.

`loopCount`

Number of loops in each playback.

`bgColor`

Background of the animated WebP image represented by a 32-bit unsigned integer in the `0xRRGGBBAA` order.

`frames`

Array of frames in the animated WebP image.

### Demuxing (Decoding frames)

`(async) decodeFrames(webPData: Uint8Array): Promise<Frames>`

```js
const frames = await xMux.decodeFrames(buffer);

// OR using the Promise
xMux.decodeFrames(buffer).then((frames) => ...);
```

### Muxing (Encoding frames)

`(async) encodeFrames(frames: Frames): Promise<Uint8Array>`

> The returned Uint8Array stores the data of the encoded
> animated WebP image.

```js
const uint8array = xMux.encodeFrames(frames);

// OR using the Promise
xMux.encodeFrames(frames).then((uint8array) => ...);
```

### Encoding (Bitmap to WebP)

> The returned Uint8Array stores the data of the encoded
> WebP image.

`(async) encodeWebP(rgba: Uint32Array, stride: number): Promise<Uint8Array>`

#### Parameters

`rgba`

A Uint32Array that contains color data for each pixel ordered from left to right and then from top to bottom.

`stride`

Specifies the width in pixels for each row in the given RGBA array. (a.k.a. the image width in pixels)

```js
const uint8array = await xMux.encodeWebP(rgba, 400);

// OR using the Promise
xMux.encodeWebP(rgba, 400).then((uint8array) => ...);
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
