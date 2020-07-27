#ifndef __webpenc__h__
#define __webpenc__h__

#include "./flatten_bs.h"
#include "webp/encode.h"
#include "webp/mux_types.h"
#include <emscripten.h>
#include <inttypes.h>
#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

static int MemWriter(const uint8_t *data, size_t data_size,
                     const WebPPicture *const pic);

EMSCRIPTEN_KEEPALIVE void *encodeWebP(uint32_t *bs);

#ifdef __cplusplus
} // extern "C"
#endif

#endif // __webpenc__h__
