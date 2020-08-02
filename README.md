# WebPXMux.js

A JavaScript library for muxing and demuxing animated WebP images and encoding and decoding WebP images.

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

### Using in browsers

When using WebPXMux in browsers, the required WebAssembly cannot be auto
looked up. Thus, you have to specify the path (relative to website root) 
to the WebAssembly file using the constructor. (The specified 
WebAssembly file path should be accessible from the browser.)

```ts
(constructor) WebPXMux(wasmPath?: string);
```

#### With Require.JS

```html
<script src="https://.../require.min.js"></script>
```

```js
require(["./dist/webpxmux"], function (WebPXMux) {
  var xMux = WebPXMux("./dist/webpxmux.wasm"); // <- IMPORTANT
  xMux.waitRuntime().then(function () {
    var reader = new FileReader();
    reader.onload = function () {
      var data = new Uint8Array(reader.result);
      xMux.decodeFrames(data).then(function (frames) {
        console.log(frames);
      });
    };
    reader.readAsArrayBuffer(new Blob([file]));
  });
});
```

#### With Webpack

> Import/require `webpxmux.js` under the `dist/` directory instead.

```js
const WebPXMux = require("webpxmux/dist/webpxmux");
const xMux = WebPXMux("./dist/webpxmux.wasm") // <- IMPORTANT
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

### Type: Frame, Frames and Bitmap

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

#### Bitmap

```ts
interface Bitmap {
  width: number;
  height: number;
  rgba: Uint32Array;
}
```

`width` and `height`

Sizes of the image in pixels.

`rgba`

Stores the RGBA color information (in the `0xRRGGBBAA` order) of each pixel.

Pixel data are ordered from left to right and then from top to bottom.

### Demuxing (Decoding frames)

```ts
(async) decodeFrames(webPData: Uint8Array): Promise<Frames>
```

```js
const frames = await xMux.decodeFrames(buffer);

// OR using the Promise
xMux.decodeFrames(buffer).then((frames) => ...);
```

### Muxing (Encoding frames)

```ts
(async) encodeFrames(frames: Frames): Promise<Uint8Array>
```

> The returned Uint8Array stores the data of the encoded
> animated WebP image.

```js
const uint8array = xMux.encodeFrames(frames);

// OR using the Promise
xMux.encodeFrames(frames).then((uint8array) => ...);
```

### Decoding (WebP to Bitmap)

```ts
(async) decodeWebP(webPData: Uint8Array): Promise<Bitmap>
```

```js
const bitmap = await xMux.decodeWebP(uint8array);

// OR using the Promise
xMux.decodeWebP(uint8array).then((bitmap) => ...);
```

### Encoding (Bitmap to WebP)

> The returned Uint8Array stores the data of the encoded
> WebP image.

```ts
(async) encodeWebP(bitmap: Bitmap): Promise<Uint8Array>
```

```js
const uint8array = await xMux.encodeWebP(bitmap);

// OR using the Promise
xMux.encodeWebP(bitmap).then((uint8array) => ...);
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
