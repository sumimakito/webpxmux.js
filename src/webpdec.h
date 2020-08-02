#ifndef __webpdec__h__
#define __webpdec__h__

#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>

#ifdef HAVE_CONFIG_H
#include "webp/config.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE void *decodeWebP(uint8_t *data, size_t data_size);

#ifdef __cplusplus
} // extern "C"
#endif

#endif // __webpdec__h__