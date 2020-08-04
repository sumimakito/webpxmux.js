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
  encodeWebPWithConfig: (ptr: Ptr, config: Ptr) => Ptr;

  newWebPConfig: () => Ptr;
  setWebPConfigLossless: (ptr: Ptr, value: number) => void;
  setWebPConfigQuality: (ptr: Ptr, value: number) => void;
  setWebPConfigMethod: (ptr: Ptr, value: number) => void;
  setWebPConfigTargetSize: (ptr: Ptr, value: number) => void;
  setWebPConfigTargetPSNR: (ptr: Ptr, value: number) => void;
  setWebPConfigSegments: (ptr: Ptr, value: number) => void;
  setWebPConfigSNSStrength: (ptr: Ptr, value: number) => void;
  setWebPConfigFilterStrength: (ptr: Ptr, value: number) => void;
  setWebPConfigFilterSharpness: (ptr: Ptr, value: number) => void;
  setWebPConfigFilterType: (ptr: Ptr, value: number) => void;
  setWebPConfigAutoFilter: (ptr: Ptr, value: number) => void;
  setWebPConfigAlphaCompression: (ptr: Ptr, value: number) => void;
  setWebPConfigAlphaFiltering: (ptr: Ptr, value: number) => void;
  setWebPConfigAlphaQuality: (ptr: Ptr, value: number) => void;
  setWebPConfigPass: (ptr: Ptr, value: number) => void;
  setWebPConfigPreprocessing: (ptr: Ptr, value: number) => void;
  setWebPConfigPartitions: (ptr: Ptr, value: number) => void;
  setWebPConfigPartitionsLimit: (ptr: Ptr, value: number) => void;
  setWebPConfigEmulateJPEGSize: (ptr: Ptr, value: number) => void;
  setWebPConfigThreadLevel: (ptr: Ptr, value: number) => void;
  setWebPConfigLowMemory: (ptr: Ptr, value: number) => void;
  setWebPConfigNearLossless: (ptr: Ptr, value: number) => void;
  setWebPConfigExact: (ptr: Ptr, value: number) => void;
  setWebPConfigUseDeltaPalette: (ptr: Ptr, value: number) => void;
  setWebPConfigUseSharpYUV: (ptr: Ptr, value: number) => void;
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
export interface WebPConfig {
  lossless: number;
  quality: number;
  method: number;
  target_size: number;
  target_PSNR: number;
  segments: number;
  sns_strength: number;
  filter_strength: number;
  filter_sharpness: number;
  filter_type: number;
  autofilter: number;
  alpha_compression: number;
  alpha_filtering: number;
  alpha_quality: number;
  pass: number;
  preprocessing: number;
  partitions: number;
  partition_limit: number;
  emulate_jpeg_size: number;
  thread_level: number;
  low_memory: number;
  near_lossless: number;
  exact: number;
  use_delta_palette: number;
  use_sharp_yuv: number;
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
      this.Module!.newWebPConfig = this.Module!.cwrap(
        "new_webpwrapper_config",
        "number",
        []
      );
      this.Module!.encodeWebPWithConfig = this.Module!.cwrap(
        "encodeWebPWithConfig",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigLossless = this.Module!.cwrap(
        "set_webp_config_lossless",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigQuality = this.Module!.cwrap(
        "set_webp_config_quality",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigMethod = this.Module!.cwrap(
        "set_webp_config_method",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigTargetSize = this.Module!.cwrap(
        "set_webp_config_target_size",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigTargetPSNR = this.Module!.cwrap(
        "set_webp_config_target_PSNR",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigSegments = this.Module!.cwrap(
        "set_webp_config_segments",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigSNSStrength = this.Module!.cwrap(
        "set_webp_config_sns_strength",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigFilterStrength = this.Module!.cwrap(
        "set_webp_config_filter_strength",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigFilterSharpness = this.Module!.cwrap(
        "set_webp_config_filter_sharpness",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigFilterType = this.Module!.cwrap(
        "set_webp_config_filter_type",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigAutoFilter = this.Module!.cwrap(
        "set_webp_config_autofilter",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigAlphaCompression = this.Module!.cwrap(
        "set_webp_config_alpha_compression",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigAlphaFiltering = this.Module!.cwrap(
        "set_webp_config_alpha_filtering",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigAlphaQuality = this.Module!.cwrap(
        "set_webp_config_alpha_quality",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigPass = this.Module!.cwrap(
        "set_webp_config_pass",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigPreprocessing = this.Module!.cwrap(
        "set_webp_config_preprocessing",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigPartitions = this.Module!.cwrap(
        "set_webp_config_partitions",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigPartitionsLimit = this.Module!.cwrap(
        "set_webp_config_partition_limit",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigEmulateJPEGSize = this.Module!.cwrap(
        "set_webp_config_emulate_jpeg_size",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigThreadLevel = this.Module!.cwrap(
        "set_webp_config_thread_level",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigLowMemory = this.Module!.cwrap(
        "set_webp_config_low_memory",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigNearLossless = this.Module!.cwrap(
        "set_webp_config_near_lossless",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigExact = this.Module!.cwrap(
        "set_webp_config_exact",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigUseDeltaPalette = this.Module!.cwrap(
        "set_webp_config_use_delta_palette",
        "number",
        ["number", "number"]
      );
      this.Module!.setWebPConfigUseSharpYUV = this.Module!.cwrap(
        "set_webp_config_use_sharp_yuv",
        "number",
        ["number", "number"]
      );
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

  generateWebPConfig(config: WebPConfig): Ptr {
    const ptr = this.Module!.newWebPConfig();
    this.Module!.setWebPConfigLossless(ptr, config.lossless);
    this.Module!.setWebPConfigQuality(ptr, config.quality);
    this.Module!.setWebPConfigMethod(ptr, config.method);
    this.Module!.setWebPConfigTargetSize(ptr, config.target_size);
    this.Module!.setWebPConfigTargetPSNR(ptr, config.target_PSNR);
    this.Module!.setWebPConfigSegments(ptr, config.segments);
    this.Module!.setWebPConfigSNSStrength(ptr, config.sns_strength);
    this.Module!.setWebPConfigFilterStrength(ptr, config.filter_strength);
    this.Module!.setWebPConfigFilterSharpness(ptr, config.filter_sharpness);
    this.Module!.setWebPConfigFilterType(ptr, config.filter_type);
    this.Module!.setWebPConfigAutoFilter(ptr, config.autofilter);
    this.Module!.setWebPConfigAlphaCompression(ptr, config.alpha_compression);
    this.Module!.setWebPConfigAlphaFiltering(ptr, config.alpha_filtering);
    this.Module!.setWebPConfigAlphaQuality(ptr, config.alpha_quality);
    this.Module!.setWebPConfigPass(ptr, config.pass);
    this.Module!.setWebPConfigPreprocessing(ptr, config.preprocessing);
    this.Module!.setWebPConfigPartitions(ptr, config.partitions);
    this.Module!.setWebPConfigPartitionsLimit(ptr, config.partition_limit);
    this.Module!.setWebPConfigEmulateJPEGSize(ptr, config.emulate_jpeg_size);
    this.Module!.setWebPConfigThreadLevel(ptr, config.thread_level);
    this.Module!.setWebPConfigLowMemory(ptr, config.low_memory);
    this.Module!.setWebPConfigNearLossless(ptr, config.near_lossless);
    this.Module!.setWebPConfigExact(ptr, config.exact);
    this.Module!.setWebPConfigUseDeltaPalette(ptr, config.use_delta_palette);
    this.Module!.setWebPConfigUseSharpYUV(ptr, config.use_sharp_yuv);
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

  async encodeWebPWithConfig(bitmap: Bitmap, config: WebPConfig) {
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
    const configPtr = this.generateWebPConfig(config);
    const encodedPtr = this.Module!.encodeWebPWithConfig(bsPtr, configPtr);
    this.Module!._free(bsPtr);
    this.Module!._free(configPtr);
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
