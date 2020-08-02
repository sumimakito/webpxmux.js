// Copyright 2015 Google Inc. All Rights Reserved.
// Modified version by Makito. Jul, 2020.
//
// Use of this source code is governed by a BSD-style license
// that can be found in the COPYING file in the root of the source
// tree. An additional intellectual property rights grant can be found
// in the file PATENTS. All contributing project authors may
// be found in the AUTHORS file in the root of the source tree.

#include "./errors.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef HAVE_CONFIG_H
#include "webp/config.h"
#endif

#include "imageio/image_enc.h"
#include "imageio/webpdec.h"

// returns a ptr -> [size_t, int width, int height, uint32_t(4)...]
// uncontrolled free
void *decodeWebP(uint8_t *data, size_t data_size) {
  WebPDecoderConfig config;
  WebPDecBuffer *const output_buffer = &config.output;
  WebPBitstreamFeatures *const bitstream = &config.input;
  VP8StatusCode status;
  int errcode = 0;
  void *out;

  if (!WebPInitDecoderConfig(&config)) {
    errcode = E_DEC_INIT_CONFIG;
    goto FinalCleanup;
  }

  output_buffer->colorspace = MODE_RGBA;
  config.input.has_animation = 0;

  status = WebPGetFeatures(data, data_size, &bitstream);
  if (status != VP8_STATUS_OK) {
    errcode = E_DEC_VP8_NOT_OK;
    goto FinalCleanup;
  }

  status = DecodeWebP(data, data_size, &config);
  if (status != VP8_STATUS_OK) {
    errcode = E_DEC_VP8_NOT_OK;
    goto FinalCleanup;
  }

  out = malloc(sizeof(size_t) + 2 * sizeof(int) + output_buffer->u.RGBA.size);
  void *outptr = out;

  memcpy(outptr, &output_buffer->u.RGBA.size, sizeof(size_t));
  outptr += sizeof(size_t);
  memcpy(outptr, &output_buffer->width, sizeof(int));
  outptr += sizeof(int);
  memcpy(outptr, &output_buffer->height, sizeof(int));
  outptr += sizeof(int);
  memcpy(outptr, output_buffer->u.RGBA.rgba, output_buffer->u.RGBA.size);

FinalCleanup:
  WebPFreeDecBuffer(output_buffer);

  if (errcode < 0) {
    return errcode;
  }

  return out;
}