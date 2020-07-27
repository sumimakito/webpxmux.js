#ifndef __webpmux_h__
#define __webpmux_h__

#ifdef HAVE_CONFIG_H
#include "webp/config.h"
#endif

#include "./flatten_bs.h"
#include "webp/mux.h"
#include <emscripten.h>

static const char *ErrorString(WebPMuxError err);

int setFrameParam(int duration, int x_offset /* 0 */, int y_offset /* 0 */,
                  WebPMuxAnimDispose dispose_method /* 0 */,
                  char plus_minus /* '+' */, char blend_method /* 'b' */,
                  WebPMuxFrameInfo *const info);

EMSCRIPTEN_KEEPALIVE void *encodeFrames(uint32_t *bs);

#endif // __webpmux_h__
