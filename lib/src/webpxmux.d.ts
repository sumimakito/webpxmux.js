declare type AlignedByteSize = 1 | 2 | 4 | 8;
declare type Ptr = number;
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
declare class WebPXMux {
    private SIZE_SIZE_T;
    private SIZE_INT;
    private waitRuntimeResolves;
    private waitRuntimeRejects;
    private Module?;
    private _runtimeInitialized;
    constructor(wasmPath?: string);
    get runtimeInitialized(): boolean;
    waitRuntime(): Promise<void>;
    getUnsigned(ptr: Ptr, typeByteSize: AlignedByteSize): number;
    copyU8aToHeap(u8a: Uint8Array): Ptr;
    copyFBSToHeap(frames: Frames): Ptr;
    generateWebPConfig(config: WebPConfig): Ptr;
    decodeFrames(webPData: Uint8Array): Promise<Frames>;
    encodeFrames(frames: Frames): Promise<Uint8Array>;
    decodeWebP(webPData: Uint8Array): Promise<Bitmap>;
    encodeWebPWithConfig(bitmap: Bitmap, config: WebPConfig): Promise<Uint8Array>;
    encodeWebP(bitmap: Bitmap): Promise<Uint8Array>;
    private unWrapFBS;
}
declare const webXMux: (wasmPath?: string | undefined) => WebPXMux;
export default webXMux;
