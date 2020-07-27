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
declare class WebPXMux {
    private SIZE_SIZE_T;
    private waitRuntimeResolves;
    private waitRuntimeRejects;
    private Module?;
    private _runtimeInitialized;
    constructor(wasmPath?: string);
    get runtimeInitialized(): boolean;
    waitRuntime(): Promise<void>;
    getUnsigned(ptr: Ptr, typeByteSize: AlignedByteSize): number;
    copyFBSToHeap(frames: Frames): Ptr;
    decodeFrames(webPData: Uint8Array): Promise<Frames>;
    private unWrapFBS;
    encodeFrames(frames: Frames): Promise<Uint8Array>;
    encodeWebP(rgba: Uint32Array, stride: number): Promise<Uint8Array>;
}
declare const webXMux: (wasmPath?: string | undefined) => WebPXMux;
export default webXMux;
