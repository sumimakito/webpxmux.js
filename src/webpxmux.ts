/// <reference types="emscripten" />

import webPXMuxWasm from "../build/webpxmux";

type AlignedByteSize = 1 | 2 | 4 | 8;
type Ptr = number;
const NULL = 0;

const ErrorMessages: { [k: number]: string } = {
  [-1]: "failed to parse the file",
  [-2]: "unknown file type",

  [-10]: "invalid animation info",
  [-11]: "failed to decode a frame",

  [-20]: "failed to encode the image",

  [-30]: "failed to allocate a Mux object",
  [-31]: "failed to parse frame properties",
  [-32]: "failed to add a frame",
  [-33]: "failed to set animation parameters",
  [-34]: "failed to assembly the WebP image",

  [-40]: "failed to decode: VP8 status is not ok",
  [-41]: "failed to decode: failed to init config",
};

interface WebPXMuxModule extends EmscriptenModule {
  cwrap: typeof cwrap;

  getValue: (ptr: Ptr, type: string) => any;

  decodeFrames: (ptr: Ptr, size: number) => Ptr;
  encodeFrames: (ptr: Ptr) => Ptr;
  decodeWebP: (ptr: Ptr, size: number) => Ptr;
  encodeWebP: (ptr: Ptr) => Ptr;
}

const toUnsigned = (n: number) => n >>> 0;

const SIZE_IU8: AlignedByteSize = 1;
const SIZE_IU32: AlignedByteSize = 4;
const SIZE_IU64: AlignedByteSize = 8;

const FBS_HEADER = 6;
const FBS_FRAME_HEADER = 2;

export interface Frame {
  duration: number;
  isKeyframe: boolean;
  rgba: Uint32Array;
}

export interface Frames {
  frameCount: number;
  width: number;
  height: number;
  loopCount: number;
  bgColor: number;
  frames: Frame[];
}

export interface Bitmap {
  width: number;
  height: number;
  rgba: Uint32Array;
}

class WebPXMux {
  private SIZE_SIZE_T = SIZE_IU32;
  private SIZE_INT = SIZE_IU32;

  private waitRuntimeResolves: ((
    value?: void | PromiseLike<void> | undefined
  ) => void)[] = [];
  private waitRuntimeRejects: ((reason?: any) => void)[] = [];
  private Module?: WebPXMuxModule;
  private _runtimeInitialized = false;

  constructor(wasmPath?: string) {
    (async () => {
      this.Module = <WebPXMuxModule>(<unknown>await webPXMuxWasm(
        wasmPath
          ? {
              locateFile(_path: string) {
                if (_path.endsWith(".wasm")) {
                  return wasmPath;
                }
                return _path;
              },
            }
          : {}
      ));
      this.Module!.decodeFrames = this.Module!.cwrap("decodeFrames", "number", [
        "number",
        "number",
      ]);
      this.Module!.encodeFrames = this.Module!.cwrap("encodeFrames", "number", [
        "number",
      ]);
      this.Module!.decodeWebP = this.Module!.cwrap("decodeWebP", "number", [
        "number",
        "number",
      ]);
      this.Module!.encodeWebP = this.Module!.cwrap("encodeWebP", "number", [
        "number",
      ]);
      this.SIZE_SIZE_T = toUnsigned(
        this.Module!.cwrap("sizeof_size_t", "number", [])()
      ) as AlignedByteSize;
      this.SIZE_INT = toUnsigned(
        this.Module!.cwrap("sizeof_int", "number", [])()
      ) as AlignedByteSize;
      this._runtimeInitialized = true;
      this.waitRuntimeResolves.map((resolve) => resolve());
    })();
  }

  get runtimeInitialized() {
    return this._runtimeInitialized;
  }

  waitRuntime(): Promise<void> {
    if (this._runtimeInitialized) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.waitRuntimeResolves.push(resolve);
      this.waitRuntimeRejects.push(reject);
    });
  }

  getUnsigned(ptr: Ptr, typeByteSize: AlignedByteSize): number {
    const bitSize = typeByteSize * 8;
    switch (bitSize) {
      case 1:
      case 8:
      case 16:
      case 32:
      case 64:
        break;
      default:
        throw Error(`invalid type with byte length of ${typeByteSize}`);
    }
    return toUnsigned(this.Module!.getValue(ptr, `i${bitSize}`));
  }

  copyU8aToHeap(u8a: Uint8Array): Ptr {
    const ptr = this.Module!._malloc(u8a.length * SIZE_IU8);
    const bytes = new Uint8Array(this.Module!.HEAPU8.buffer, ptr, u8a.length);
    bytes.set(u8a);
    return ptr;
  }

  copyFBSToHeap(frames: Frames): Ptr {
    const perFU32count = FBS_FRAME_HEADER + frames.width * frames.height;
    const u32count = FBS_HEADER + frames.frameCount * perFU32count;
    const ptr = this.Module!._malloc(u32count * SIZE_IU32);
    const u32a = new Uint32Array(u32count);
    u32a.set([
      frames.frameCount,
      frames.frameCount,
      frames.width,
      frames.height,
      frames.loopCount,
      frames.bgColor,
    ]);
    frames.frames.map((fr, i) => {
      u32a.set(
        [fr.duration, fr.isKeyframe ? 1 : 0],
        FBS_HEADER + i * perFU32count
      );
      u32a.set(fr.rgba, FBS_HEADER + i * perFU32count + FBS_FRAME_HEADER);
    });
    const bytes = new Uint32Array(this.Module!.HEAPU32.buffer, ptr, u32count);
    bytes.set(u32a);
    return ptr;
  }

  async decodeFrames(webPData: Uint8Array) {
    const size = webPData.length * webPData.BYTES_PER_ELEMENT;
    const ptr = this.Module!._malloc(size);
    const bytes = new Uint8Array(this.Module!.HEAPU8.buffer, ptr, size);
    bytes.set(new Uint8Array(webPData.buffer));

    const bsPtr = this.Module!.decodeFrames(ptr, size);
    if (bsPtr < 0) {
      this.Module!._free(ptr);
      throw Error(ErrorMessages[bsPtr]);
    }
    const frames = this.unWrapFBS(bsPtr);
    this.Module!._free(ptr);
    this.Module!._free(bsPtr);
    return frames;
  }

  async encodeFrames(frames: Frames) {
    const bsPtr = this.copyFBSToHeap(frames);
    const encodedPtr = this.Module!.encodeFrames(bsPtr);
    this.Module!._free(bsPtr);
    if (encodedPtr < 0) {
      throw Error(ErrorMessages[encodedPtr]);
    }
    const size = this.getUnsigned(encodedPtr, this.SIZE_SIZE_T);
    const u8a = new Uint8Array(size / SIZE_IU8).map((_, i) =>
      this.getUnsigned(encodedPtr + SIZE_IU32 + i * SIZE_IU8, SIZE_IU8)
    );
    this.Module!._free(encodedPtr);
    return u8a;
  }

  async decodeWebP(webPData: Uint8Array) {
    const u8aPtr = this.copyU8aToHeap(webPData);
    const decodedPtr = this.Module!.decodeWebP(
      u8aPtr,
      webPData.length * SIZE_IU8
    );
    this.Module!._free(u8aPtr);
    if (decodedPtr < 0) {
      throw Error(ErrorMessages[decodedPtr]);
    }
    let ptr = decodedPtr;
    const size = this.getUnsigned(ptr, this.SIZE_SIZE_T);
    ptr += this.SIZE_SIZE_T;
    const width = this.getUnsigned(ptr, this.SIZE_INT);
    ptr += this.SIZE_INT;
    const height = this.getUnsigned(ptr, this.SIZE_INT);
    ptr += this.SIZE_INT;
    const rgba = new Uint32Array(size / SIZE_IU32).map((_, i) =>
      this.getUnsigned(ptr + i * SIZE_IU32, SIZE_IU32)
    );
    this.Module!._free(decodedPtr);
    const bitmap: Bitmap = {
      width,
      height,
      rgba,
    };
    return bitmap;
  }

  async encodeWebP(bitmap: Bitmap) {
    const frames: Frames = {
      frameCount: 1,
      width: bitmap.width,
      height: bitmap.height,
      loopCount: 0,
      bgColor: 0,
      frames: [
        {
          duration: 0,
          isKeyframe: false,
          rgba: bitmap.rgba,
        },
      ],
    };
    const bsPtr = this.copyFBSToHeap(frames);
    const encodedPtr = this.Module!.encodeWebP(bsPtr);
    this.Module!._free(bsPtr);
    if (encodedPtr < 0) {
      throw Error(ErrorMessages[encodedPtr]);
    }
    const size = this.getUnsigned(encodedPtr, this.SIZE_SIZE_T);
    const u8a = new Uint8Array(size / SIZE_IU8).map((_, i) =>
      this.getUnsigned(encodedPtr + SIZE_IU32 + i * SIZE_IU8, SIZE_IU8)
    );
    this.Module!._free(encodedPtr);
    return u8a;
  }

  private unWrapFBS(ptr: Ptr): Frames {
    const frameCount = this.getUnsigned(ptr + 1 * SIZE_IU32, SIZE_IU32);
    const width = this.getUnsigned(ptr + 2 * SIZE_IU32, SIZE_IU32);
    const height = this.getUnsigned(ptr + 3 * SIZE_IU32, SIZE_IU32);

    const loopCount = this.getUnsigned(ptr + 4 * SIZE_IU32, SIZE_IU32);
    const bgColor = this.getUnsigned(ptr + 5 * SIZE_IU32, SIZE_IU32);

    const frameSize = FBS_FRAME_HEADER + width * height;

    const frames: Frame[] = new Array(frameCount).fill(null).map((_, fr) => {
      const duration = this.getUnsigned(
        ptr + (FBS_HEADER + frameSize * fr) * SIZE_IU32,
        SIZE_IU32
      );
      const isKeyframe = !!+this.getUnsigned(
        ptr + (FBS_HEADER + frameSize * fr + 1) * SIZE_IU32,
        SIZE_IU32
      );
      const rgba = new Uint32Array(width * height).map((_, p) =>
        this.getUnsigned(
          ptr +
            (FBS_HEADER + frameSize * fr + FBS_FRAME_HEADER + p) * SIZE_IU32,
          SIZE_IU32
        )
      );
      return {
        duration,
        isKeyframe,
        rgba,
      };
    });

    return {
      frameCount,
      width,
      height,
      loopCount,
      bgColor,
      frames,
    };
  }
}

const proxyHandler: ProxyHandler<WebPXMux> = {
  get(target: WebPXMux, propKey: keyof WebPXMux, receiver) {
    const _target = Reflect.get(target, propKey, receiver);
    if (_target instanceof Function) {
      const F = _target;
      const thisArg = target;
      if (propKey === "waitRuntime") {
        return function (...args: any[]) {
          try {
            return F.apply(thisArg, args);
          } catch (err) {
            console.error(err);
          }
        };
      }
      return function (...args: any[]) {
        if (!thisArg.runtimeInitialized) {
          throw Error("Runtime is not initialized");
        }
        try {
          return F.apply(thisArg, args);
        } catch (err) {
          console.error(err);
        }
      };
    }
    return _target;
  },
};

const webXMux = (wasmPath?: string) =>
  new Proxy(new WebPXMux(wasmPath), proxyHandler);

export default webXMux;

module.exports = webXMux;
