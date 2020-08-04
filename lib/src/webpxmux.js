"use strict";
/// <reference types="emscripten" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var webpxmux_1 = __importDefault(require("../build/webpxmux"));
var NULL = 0;
var ErrorMessages = (_a = {},
    _a[-1] = "failed to parse the file",
    _a[-2] = "unknown file type",
    _a[-10] = "invalid animation info",
    _a[-11] = "failed to decode a frame",
    _a[-20] = "failed to encode the image",
    _a[-30] = "failed to allocate a Mux object",
    _a[-31] = "failed to parse frame properties",
    _a[-32] = "failed to add a frame",
    _a[-33] = "failed to set animation parameters",
    _a[-34] = "failed to assembly the WebP image",
    _a[-40] = "failed to decode: VP8 status is not ok",
    _a[-41] = "failed to decode: failed to init config",
    _a);
var toUnsigned = function (n) { return n >>> 0; };
var SIZE_IU8 = 1;
var SIZE_IU32 = 4;
var SIZE_IU64 = 8;
var FBS_HEADER = 6;
var FBS_FRAME_HEADER = 2;
var WebPXMux = /** @class */ (function () {
    function WebPXMux(wasmPath) {
        var _this = this;
        this.SIZE_SIZE_T = SIZE_IU32;
        this.SIZE_INT = SIZE_IU32;
        this.waitRuntimeResolves = [];
        this.waitRuntimeRejects = [];
        this._runtimeInitialized = false;
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, webpxmux_1.default(wasmPath
                                ? {
                                    locateFile: function (_path) {
                                        if (_path.endsWith(".wasm")) {
                                            return wasmPath;
                                        }
                                        return _path;
                                    },
                                }
                                : {})];
                    case 1:
                        _a.Module = (_b.sent());
                        this.Module.decodeFrames = this.Module.cwrap("decodeFrames", "number", [
                            "number",
                            "number",
                        ]);
                        this.Module.encodeFrames = this.Module.cwrap("encodeFrames", "number", [
                            "number",
                        ]);
                        this.Module.decodeWebP = this.Module.cwrap("decodeWebP", "number", [
                            "number",
                            "number",
                        ]);
                        this.Module.encodeWebP = this.Module.cwrap("encodeWebP", "number", [
                            "number",
                        ]);
                        this.Module.newWebPConfig = this.Module.cwrap("new_webpwrapper_config", "number", []);
                        this.Module.encodeWebPWithConfig = this.Module.cwrap("encodeWebPWithConfig", "number", ["number", "number"]);
                        this.Module.setWebPConfigLossless = this.Module.cwrap("set_webp_config_lossless", "number", ["number", "number"]);
                        this.Module.setWebPConfigQuality = this.Module.cwrap("set_webp_config_quality", "number", ["number", "number"]);
                        this.Module.setWebPConfigMethod = this.Module.cwrap("set_webp_config_method", "number", ["number", "number"]);
                        this.Module.setWebPConfigTargetSize = this.Module.cwrap("set_webp_config_target_size", "number", ["number", "number"]);
                        this.Module.setWebPConfigTargetPSNR = this.Module.cwrap("set_webp_config_target_PSNR", "number", ["number", "number"]);
                        this.Module.setWebPConfigSegments = this.Module.cwrap("set_webp_config_segments", "number", ["number", "number"]);
                        this.Module.setWebPConfigSNSStrength = this.Module.cwrap("set_webp_config_sns_strength", "number", ["number", "number"]);
                        this.Module.setWebPConfigFilterStrength = this.Module.cwrap("set_webp_config_filter_strength", "number", ["number", "number"]);
                        this.Module.setWebPConfigFilterSharpness = this.Module.cwrap("set_webp_config_filter_sharpness", "number", ["number", "number"]);
                        this.Module.setWebPConfigFilterType = this.Module.cwrap("set_webp_config_filter_type", "number", ["number", "number"]);
                        this.Module.setWebPConfigAutoFilter = this.Module.cwrap("set_webp_config_autofilter", "number", ["number", "number"]);
                        this.Module.setWebPConfigAlphaCompression = this.Module.cwrap("set_webp_config_alpha_compression", "number", ["number", "number"]);
                        this.Module.setWebPConfigAlphaFiltering = this.Module.cwrap("set_webp_config_alpha_filtering", "number", ["number", "number"]);
                        this.Module.setWebPConfigAlphaQuality = this.Module.cwrap("set_webp_config_alpha_quality", "number", ["number", "number"]);
                        this.Module.setWebPConfigPass = this.Module.cwrap("set_webp_config_pass", "number", ["number", "number"]);
                        this.Module.setWebPConfigPreprocessing = this.Module.cwrap("set_webp_config_preprocessing", "number", ["number", "number"]);
                        this.Module.setWebPConfigPartitions = this.Module.cwrap("set_webp_config_partitions", "number", ["number", "number"]);
                        this.Module.setWebPConfigPartitionsLimit = this.Module.cwrap("set_webp_config_partition_limit", "number", ["number", "number"]);
                        this.Module.setWebPConfigEmulateJPEGSize = this.Module.cwrap("set_webp_config_emulate_jpeg_size", "number", ["number", "number"]);
                        this.Module.setWebPConfigThreadLevel = this.Module.cwrap("set_webp_config_thread_level", "number", ["number", "number"]);
                        this.Module.setWebPConfigLowMemory = this.Module.cwrap("set_webp_config_low_memory", "number", ["number", "number"]);
                        this.Module.setWebPConfigNearLossless = this.Module.cwrap("set_webp_config_near_lossless", "number", ["number", "number"]);
                        this.Module.setWebPConfigExact = this.Module.cwrap("set_webp_config_exact", "number", ["number", "number"]);
                        this.Module.setWebPConfigUseDeltaPalette = this.Module.cwrap("set_webp_config_use_delta_palette", "number", ["number", "number"]);
                        this.Module.setWebPConfigUseSharpYUV = this.Module.cwrap("set_webp_config_use_sharp_yuv", "number", ["number", "number"]);
                        this.SIZE_SIZE_T = toUnsigned(this.Module.cwrap("sizeof_size_t", "number", [])());
                        this.SIZE_INT = toUnsigned(this.Module.cwrap("sizeof_int", "number", [])());
                        this._runtimeInitialized = true;
                        this.waitRuntimeResolves.map(function (resolve) { return resolve(); });
                        return [2 /*return*/];
                }
            });
        }); })();
    }
    Object.defineProperty(WebPXMux.prototype, "runtimeInitialized", {
        get: function () {
            return this._runtimeInitialized;
        },
        enumerable: false,
        configurable: true
    });
    WebPXMux.prototype.waitRuntime = function () {
        var _this = this;
        if (this._runtimeInitialized) {
            return Promise.resolve();
        }
        return new Promise(function (resolve, reject) {
            _this.waitRuntimeResolves.push(resolve);
            _this.waitRuntimeRejects.push(reject);
        });
    };
    WebPXMux.prototype.getUnsigned = function (ptr, typeByteSize) {
        var bitSize = typeByteSize * 8;
        switch (bitSize) {
            case 1:
            case 8:
            case 16:
            case 32:
            case 64:
                break;
            default:
                throw Error("invalid type with byte length of " + typeByteSize);
        }
        return toUnsigned(this.Module.getValue(ptr, "i" + bitSize));
    };
    WebPXMux.prototype.copyU8aToHeap = function (u8a) {
        var ptr = this.Module._malloc(u8a.length * SIZE_IU8);
        var bytes = new Uint8Array(this.Module.HEAPU8.buffer, ptr, u8a.length);
        bytes.set(u8a);
        return ptr;
    };
    WebPXMux.prototype.copyFBSToHeap = function (frames) {
        var perFU32count = FBS_FRAME_HEADER + frames.width * frames.height;
        var u32count = FBS_HEADER + frames.frameCount * perFU32count;
        var ptr = this.Module._malloc(u32count * SIZE_IU32);
        var u32a = new Uint32Array(u32count);
        u32a.set([
            frames.frameCount,
            frames.frameCount,
            frames.width,
            frames.height,
            frames.loopCount,
            frames.bgColor,
        ]);
        frames.frames.map(function (fr, i) {
            u32a.set([fr.duration, fr.isKeyframe ? 1 : 0], FBS_HEADER + i * perFU32count);
            u32a.set(fr.rgba, FBS_HEADER + i * perFU32count + FBS_FRAME_HEADER);
        });
        var bytes = new Uint32Array(this.Module.HEAPU32.buffer, ptr, u32count);
        bytes.set(u32a);
        return ptr;
    };
    WebPXMux.prototype.generateWebPConfig = function (config) {
        var ptr = this.Module.newWebPConfig();
        this.Module.setWebPConfigLossless(ptr, config.lossless);
        this.Module.setWebPConfigQuality(ptr, config.quality);
        this.Module.setWebPConfigMethod(ptr, config.method);
        this.Module.setWebPConfigTargetSize(ptr, config.target_size);
        this.Module.setWebPConfigTargetPSNR(ptr, config.target_PSNR);
        this.Module.setWebPConfigSegments(ptr, config.segments);
        this.Module.setWebPConfigSNSStrength(ptr, config.sns_strength);
        this.Module.setWebPConfigFilterStrength(ptr, config.filter_strength);
        this.Module.setWebPConfigFilterSharpness(ptr, config.filter_sharpness);
        this.Module.setWebPConfigFilterType(ptr, config.filter_type);
        this.Module.setWebPConfigAutoFilter(ptr, config.autofilter);
        this.Module.setWebPConfigAlphaCompression(ptr, config.alpha_compression);
        this.Module.setWebPConfigAlphaFiltering(ptr, config.alpha_filtering);
        this.Module.setWebPConfigAlphaQuality(ptr, config.alpha_quality);
        this.Module.setWebPConfigPass(ptr, config.pass);
        this.Module.setWebPConfigPreprocessing(ptr, config.preprocessing);
        this.Module.setWebPConfigPartitions(ptr, config.partitions);
        this.Module.setWebPConfigPartitionsLimit(ptr, config.partition_limit);
        this.Module.setWebPConfigEmulateJPEGSize(ptr, config.emulate_jpeg_size);
        this.Module.setWebPConfigThreadLevel(ptr, config.thread_level);
        this.Module.setWebPConfigLowMemory(ptr, config.low_memory);
        this.Module.setWebPConfigNearLossless(ptr, config.near_lossless);
        this.Module.setWebPConfigExact(ptr, config.exact);
        this.Module.setWebPConfigUseDeltaPalette(ptr, config.use_delta_palette);
        this.Module.setWebPConfigUseSharpYUV(ptr, config.use_sharp_yuv);
        return ptr;
    };
    WebPXMux.prototype.decodeFrames = function (webPData) {
        return __awaiter(this, void 0, void 0, function () {
            var size, ptr, bytes, bsPtr, frames;
            return __generator(this, function (_a) {
                size = webPData.length * webPData.BYTES_PER_ELEMENT;
                ptr = this.Module._malloc(size);
                bytes = new Uint8Array(this.Module.HEAPU8.buffer, ptr, size);
                bytes.set(new Uint8Array(webPData.buffer));
                bsPtr = this.Module.decodeFrames(ptr, size);
                if (bsPtr < 0) {
                    this.Module._free(ptr);
                    throw Error(ErrorMessages[bsPtr]);
                }
                frames = this.unWrapFBS(bsPtr);
                this.Module._free(ptr);
                this.Module._free(bsPtr);
                return [2 /*return*/, frames];
            });
        });
    };
    WebPXMux.prototype.encodeFrames = function (frames) {
        return __awaiter(this, void 0, void 0, function () {
            var bsPtr, encodedPtr, size, u8a;
            var _this = this;
            return __generator(this, function (_a) {
                bsPtr = this.copyFBSToHeap(frames);
                encodedPtr = this.Module.encodeFrames(bsPtr);
                this.Module._free(bsPtr);
                if (encodedPtr < 0) {
                    throw Error(ErrorMessages[encodedPtr]);
                }
                size = this.getUnsigned(encodedPtr, this.SIZE_SIZE_T);
                u8a = new Uint8Array(size / SIZE_IU8).map(function (_, i) {
                    return _this.getUnsigned(encodedPtr + SIZE_IU32 + i * SIZE_IU8, SIZE_IU8);
                });
                this.Module._free(encodedPtr);
                return [2 /*return*/, u8a];
            });
        });
    };
    WebPXMux.prototype.decodeWebP = function (webPData) {
        return __awaiter(this, void 0, void 0, function () {
            var u8aPtr, decodedPtr, ptr, size, width, height, rgba, bitmap;
            var _this = this;
            return __generator(this, function (_a) {
                u8aPtr = this.copyU8aToHeap(webPData);
                decodedPtr = this.Module.decodeWebP(u8aPtr, webPData.length * SIZE_IU8);
                this.Module._free(u8aPtr);
                if (decodedPtr < 0) {
                    throw Error(ErrorMessages[decodedPtr]);
                }
                ptr = decodedPtr;
                size = this.getUnsigned(ptr, this.SIZE_SIZE_T);
                ptr += this.SIZE_SIZE_T;
                width = this.getUnsigned(ptr, this.SIZE_INT);
                ptr += this.SIZE_INT;
                height = this.getUnsigned(ptr, this.SIZE_INT);
                ptr += this.SIZE_INT;
                rgba = new Uint32Array(size / SIZE_IU32).map(function (_, i) {
                    return _this.getUnsigned(ptr + i * SIZE_IU32, SIZE_IU32);
                });
                this.Module._free(decodedPtr);
                bitmap = {
                    width: width,
                    height: height,
                    rgba: rgba,
                };
                return [2 /*return*/, bitmap];
            });
        });
    };
    WebPXMux.prototype.encodeWebPWithConfig = function (bitmap, config) {
        return __awaiter(this, void 0, void 0, function () {
            var frames, bsPtr, configPtr, encodedPtr, size, u8a;
            var _this = this;
            return __generator(this, function (_a) {
                frames = {
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
                bsPtr = this.copyFBSToHeap(frames);
                configPtr = this.generateWebPConfig(config);
                encodedPtr = this.Module.encodeWebPWithConfig(bsPtr, configPtr);
                this.Module._free(bsPtr);
                this.Module._free(configPtr);
                if (encodedPtr < 0) {
                    throw Error(ErrorMessages[encodedPtr]);
                }
                size = this.getUnsigned(encodedPtr, this.SIZE_SIZE_T);
                u8a = new Uint8Array(size / SIZE_IU8).map(function (_, i) {
                    return _this.getUnsigned(encodedPtr + SIZE_IU32 + i * SIZE_IU8, SIZE_IU8);
                });
                this.Module._free(encodedPtr);
                return [2 /*return*/, u8a];
            });
        });
    };
    WebPXMux.prototype.encodeWebP = function (bitmap) {
        return __awaiter(this, void 0, void 0, function () {
            var frames, bsPtr, encodedPtr, size, u8a;
            var _this = this;
            return __generator(this, function (_a) {
                frames = {
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
                bsPtr = this.copyFBSToHeap(frames);
                encodedPtr = this.Module.encodeWebP(bsPtr);
                this.Module._free(bsPtr);
                if (encodedPtr < 0) {
                    throw Error(ErrorMessages[encodedPtr]);
                }
                size = this.getUnsigned(encodedPtr, this.SIZE_SIZE_T);
                u8a = new Uint8Array(size / SIZE_IU8).map(function (_, i) {
                    return _this.getUnsigned(encodedPtr + SIZE_IU32 + i * SIZE_IU8, SIZE_IU8);
                });
                this.Module._free(encodedPtr);
                return [2 /*return*/, u8a];
            });
        });
    };
    WebPXMux.prototype.unWrapFBS = function (ptr) {
        var _this = this;
        var frameCount = this.getUnsigned(ptr + 1 * SIZE_IU32, SIZE_IU32);
        var width = this.getUnsigned(ptr + 2 * SIZE_IU32, SIZE_IU32);
        var height = this.getUnsigned(ptr + 3 * SIZE_IU32, SIZE_IU32);
        var loopCount = this.getUnsigned(ptr + 4 * SIZE_IU32, SIZE_IU32);
        var bgColor = this.getUnsigned(ptr + 5 * SIZE_IU32, SIZE_IU32);
        var frameSize = FBS_FRAME_HEADER + width * height;
        var frames = new Array(frameCount).fill(null).map(function (_, fr) {
            var duration = _this.getUnsigned(ptr + (FBS_HEADER + frameSize * fr) * SIZE_IU32, SIZE_IU32);
            var isKeyframe = !!+_this.getUnsigned(ptr + (FBS_HEADER + frameSize * fr + 1) * SIZE_IU32, SIZE_IU32);
            var rgba = new Uint32Array(width * height).map(function (_, p) {
                return _this.getUnsigned(ptr +
                    (FBS_HEADER + frameSize * fr + FBS_FRAME_HEADER + p) * SIZE_IU32, SIZE_IU32);
            });
            return {
                duration: duration,
                isKeyframe: isKeyframe,
                rgba: rgba,
            };
        });
        return {
            frameCount: frameCount,
            width: width,
            height: height,
            loopCount: loopCount,
            bgColor: bgColor,
            frames: frames,
        };
    };
    return WebPXMux;
}());
var proxyHandler = {
    get: function (target, propKey, receiver) {
        var _target = Reflect.get(target, propKey, receiver);
        if (_target instanceof Function) {
            var F_1 = _target;
            var thisArg_1 = target;
            if (propKey === "waitRuntime") {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    try {
                        return F_1.apply(thisArg_1, args);
                    }
                    catch (err) {
                        console.error(err);
                    }
                };
            }
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (!thisArg_1.runtimeInitialized) {
                    throw Error("Runtime is not initialized");
                }
                try {
                    return F_1.apply(thisArg_1, args);
                }
                catch (err) {
                    console.error(err);
                }
            };
        }
        return _target;
    },
};
var webXMux = function (wasmPath) {
    return new Proxy(new WebPXMux(wasmPath), proxyHandler);
};
exports.default = webXMux;
module.exports = webXMux;
