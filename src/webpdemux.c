// Copyright 2015 Google Inc. All Rights Reserved.
// Modified version by Makito. Jul, 2020.
//
// Use of this source code is governed by a BSD-style license
// that can be found in the COPYING file in the root of the source
// tree. An additional intellectual property rights grant can be found
// in the file PATENTS. All contributing project authors may
// be found in the AUTHORS file in the root of the source tree.

#include <assert.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "imageio/imageio_util.h"
#include "webp/decode.h"
#include "webp/demux.h"
#include "webp/format_constants.h"

#include "./errors.h"
#include "./flatten_bs.h"
#include "./unicode.h"
#include "./webpdemux.h"

#if defined(_MSC_VER) && _MSC_VER < 1900
#define snprintf _snprintf
#endif

typedef void (*BlendRowFunc)(uint32_t *const, const uint32_t *const, int);

struct WebPAnimDecoder {
  WebPDemuxer *demux_;       // Demuxer created from given WebP bitstream.
  WebPDecoderConfig config_; // Decoder config.
  // Note: we use a pointer to a function blending multiple pixels at a time to
  // allow possible inlining of per-pixel blending function.
  BlendRowFunc blend_func_;      // Pointer to the chose blend row function.
  WebPAnimInfo info_;            // Global info about the animation.
  uint8_t *curr_frame_;          // Current canvas (not disposed).
  uint8_t *prev_frame_disposed_; // Previous canvas (properly disposed).
  int prev_frame_timestamp_;     // Previous frame timestamp (milliseconds).
  WebPIterator prev_iter_;       // Iterator object for previous frame.
  int prev_frame_was_keyframe_;  // True if previous frame was a keyframe.
  int next_frame_;               // Index of the next frame to be decoded
                                 // (starting from 1).
};

static int IsWebP(const WebPData *const webp_data) {
  return (WebPGetInfo(webp_data->bytes, webp_data->size, NULL, NULL) != 0);
}

static uint32_t *_decodeFrames(const WebPData *const webp_data) {
  WebPAnimDecoderOptions dec_options;
  WebPAnimDecoderOptionsInit(&dec_options);
  dec_options.color_mode = MODE_RGBA;
  dec_options.use_threads = 1;

  uint32_t frame_index = 0;
  int prev_frame_timestamp = 0;
  WebPAnimDecoder *dec;
  WebPAnimInfo anim_info;

  dec = WebPAnimDecoderNew(webp_data, &dec_options);
  if (dec == NULL) {
    // fprintf(stderr, "Error parsing image\n");
    return E_PARSING;
  }

  if (!WebPAnimDecoderGetInfo(dec, &anim_info)) {
    // fprintf(stderr, "Error getting global info about the animation\n");
    WebPAnimDecoderDelete(dec);
    return E_ANIM_INFO;
  }

  uint32_t bgcolor_rgba =
      (anim_info.bgcolor >> 24) | ((anim_info.bgcolor & 0xFFFFFF) << 8);

  uint32_t *bs =
      bs_alloc(anim_info.canvas_width, anim_info.canvas_height,
               anim_info.frame_count, anim_info.loop_count, bgcolor_rgba);

  // Decode frames.
  while (WebPAnimDecoderHasMoreFrames(dec)) {
    uint8_t *abgr;
    int timestamp;

    if (!WebPAnimDecoderGetNext(dec, &abgr, &timestamp)) {
      // fprintf(stderr, "Error decoding frame #%u\n", frame_index);
      free(bs);
      WebPAnimDecoderDelete(dec);
      return E_DECODING_FRAME;
    }

    uint32_t *color;
    for (int i = 0; i < anim_info.canvas_width * anim_info.canvas_height; i++) {
      color = (uint32_t *)((uint32_t *)abgr) + i;
      *color = ((*color >> 24) & 0xFF) | (((*color >> 16) & 0xFF) << 8) |
               (((*color >> 8) & 0xFF) << 16) | ((*color & 0xFF) << 24);
    }

    assert(frame_index < anim_info.frame_count);

    uint8_t *rgba = abgr;

    bs_append_frame(&bs, (uint32_t *)rgba, timestamp - prev_frame_timestamp,
                    frame_index > 0 ? dec->prev_frame_was_keyframe_ : 0);

    ++frame_index;
    prev_frame_timestamp = timestamp;
  }
  WebPAnimDecoderDelete(dec);
  return bs;
}

EMSCRIPTEN_KEEPALIVE uint32_t *decodeFrames(uint8_t *bytes, size_t size) {
  WebPData webp_data;

  WebPDataInit(&webp_data);

  webp_data.bytes = bytes;
  webp_data.size = size;

  if (IsWebP(&webp_data)) {
    uint32_t *bs = _decodeFrames(&webp_data);
    WebPDataClear(&webp_data);
    return bs;
  } else {
    // fprintf(stderr, "Unknown file type\n");
    WebPDataClear(&webp_data);
    return E_UNKNOWN_TYPE;
  }
}
