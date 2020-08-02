// Copyright 2015 Google Inc. All Rights Reserved.
// Modified version by Makito. Jul, 2020.
//
// Use of this source code is governed by a BSD-style license
// that can be found in the COPYING file in the root of the source
// tree. An additional intellectual property rights grant can be found
// in the file PATENTS. All contributing project authors may
// be found in the AUTHORS file in the root of the source tree.

#ifdef HAVE_CONFIG_H
#include "webp/config.h"
#endif

#include "./errors.h"
#include "./flatten_bs.h"
#include "./unicode.h"
#include "./webpenc.h"
#include "./webpmux.h"
#include "imageio/imageio_util.h"
#include "webp/decode.h"
#include "webp/mux.h"
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int setFrameParam(int duration, int x_offset /* 0 */, int y_offset /* 0 */,
                  WebPMuxAnimDispose dispose_method /* 0 */,
                  char plus_minus /* '+' */, char blend_method /* 'b' */,
                  WebPMuxFrameInfo *const info) {
  info->duration = duration;
  info->x_offset = x_offset;
  info->y_offset = y_offset;

  info->dispose_method = (WebPMuxAnimDispose)dispose_method;

  if (blend_method != 'b')
    return 0;
  if (plus_minus != '-' && plus_minus != '+')
    return 0;
  info->blend_method = (plus_minus == '+') ? WEBP_MUX_BLEND : WEBP_MUX_NO_BLEND;
  return 1;
}

// returns a ptr -> [size_t, uint_8(1)...]
// uncontrolled free
EMSCRIPTEN_KEEPALIVE void *encodeFrames(uint32_t *bs) {
  WebPMux *mux = NULL;
  WebPMuxError err = WEBP_MUX_OK;
  WebPData data;
  void *encoded = NULL;
  int errcode = 0;
  int ok = 1;

  WebPDataInit(&data);

  uint32_t frame_count = bs[1];
  uint32_t width = bs[2];
  uint32_t height = bs[3];
  uint32_t loop_count = bs[4];
  uint32_t bgcolor = bs[5];
  uint32_t bgcolor_argb = (bgcolor >> 8) | ((bgcolor & 0xFF) << 24);

  int i;
  WebPMuxAnimParams params = {bgcolor_argb, loop_count};

  mux = WebPMuxNew();
  if (mux == NULL) {
    // fprintf(stderr, "ERROR (%d): Could not allocate a mux object.\n",
    // WEBP_MUX_MEMORY_ERROR);
    ok = 0;
    errcode = E_MUX_MEMORY_ERROR;
    goto ErrorCleanup;
  }

  WebPMuxFrameInfo frame = {.id = WEBP_CHUNK_ANMF, .bitstream = data};

  // Process frames
  for (int i = 0; i < frame_count; i++) {
    uint32_t duration = *((uint32_t *)(bs + 6 + i * (2 + width * height)));

    uint32_t *still = bs_copy_frame(bs, i);

    void *webp_raw = encodeWebP(still);

    size_t size = *((size_t *)webp_raw);
    frame.bitstream.size = size;
    frame.bitstream.bytes = malloc(size);
    memcpy((void *)frame.bitstream.bytes, (void *)(webp_raw + sizeof(size_t)),
           size);

    ok = setFrameParam(duration, 0, 0, WEBP_MUX_DISPOSE_BACKGROUND, '+', 'b',
                       &frame);
    if (!ok) {
      WebPDataClear(&frame.bitstream);
      // fprintf(stderr, "%s", "ERROR: Could not parse frame properties.\n");
      ok = 0;
      errcode = E_PARSE_FRAME_PROPS;
      goto ErrorCleanup;
    }
    err = WebPMuxPushFrame(mux, &frame, 1);
    WebPDataClear(&frame.bitstream);
    if (err != WEBP_MUX_OK) {
      // fprintf(stderr, "ERROR (%d): Could not add a frame at index %d.\n",
      // err, i);
      ok = 0;
      errcode = E_ADD_FRAME;
      goto ErrorCleanup;
    }
  }

  // Set final params
  err = WebPMuxSetAnimationParams(mux, &params);
  if (err != WEBP_MUX_OK) {
    // fprintf(stderr, "ERROR (%d): Could not set animation parameters.\n",
    // err);
    ok = 0;
    errcode = E_SET_ANIM_PARAMS;
    goto ErrorCleanup;
  }

  // Write to output
  WebPData webp_data;
  err = WebPMuxAssemble(mux, &webp_data);
  if (err != WEBP_MUX_OK) {
    // fprintf(stderr, "Error (%d) assembling the WebP file.\n", err);
    ok = 0;
    errcode = E_ASSEMBLY;
    goto ErrorCleanup;
  }

  encoded = malloc(sizeof(webp_data.size) + webp_data.size);
  memcpy(encoded, &webp_data.size, sizeof(webp_data.size));
  memcpy(encoded + sizeof(webp_data.size), webp_data.bytes, webp_data.size);
  WebPDataClear(&webp_data);

ErrorCleanup:
  WebPMuxDelete(mux);

  if (!ok) {
    return errcode;
  }
  return encoded;
}