#ifndef __webpxmux_h__
#define __webpxmux_h__

#ifdef HAVE_CONFIG_H
#include "webp/config.h"
#endif

#include "webp/types.h"
#include <emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

static int IsWebP(const WebPData *const webp_data);

static uint32_t *_decodeFrames(const WebPData *const webp_data);

EMSCRIPTEN_KEEPALIVE uint32_t *decodeFrames(uint8_t *bytes, size_t size);

#ifdef __cplusplus
} // extern "C"
#endif

#endif // __webpxmux_h__
