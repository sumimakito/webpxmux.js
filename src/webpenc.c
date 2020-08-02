// Copyright 2015 Google Inc. All Rights Reserved.
// Modified version by Makito. Jul, 2020.
//
// Use of this source code is governed by a BSD-style license
// that can be found in the COPYING file in the root of the source
// tree. An additional intellectual property rights grant can be found
// in the file PATENTS. All contributing project authors may
// be found in the AUTHORS file in the root of the source tree.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef HAVE_CONFIG_H
#include "webp/config.h"
#endif

#include "./errors.h"
#include "./flatten_bs.h"
#include "./unicode.h"
#include "./webpenc.h"
#include "imageio/image_dec.h"
#include "imageio/imageio_util.h"
#include "webp/encode.h"
#include "webp/mux_types.h"
#include <emscripten.h>

static const char *const kErrorMessages_VP8_ENC_ERROR_LAST = {
    "OK",
    "OUT_OF_MEMORY: Out of memory allocating objects",
    "BITSTREAM_OUT_OF_MEMORY: Out of memory re-allocating byte buffer",
    "NULL_PARAMETER: NULL parameter passed to function",
    "INVALID_CONFIGURATION: configuration is invalid",
    "BAD_DIMENSION: Bad picture dimension. Maximum width and height "
    "allowed is 16383 pixels.",
    "PARTITION0_OVERFLOW: Partition #0 is too big to fit 512k.\n"
    "To reduce the size of this partition, try using less segments "
    "with the -segments option, and eventually reduce the number of "
    "header bits using -partition_limit. More details are available "
    "in the manual (`man cwebp`)",
    "PARTITION_OVERFLOW: Partition is too big to fit 16M",
    "BAD_WRITE: Picture writer returned an I/O error",
    "FILE_TOO_BIG: File would be too big to fit in 4G",
    "USER_ABORT: encoding abort requested by user"};

static int MemWriter(const uint8_t *data, size_t data_size,
                     const WebPPicture *const pic) {
  WebPData *webp_data = (WebPData *)pic->custom_ptr;
  if (webp_data->bytes == NULL) {
    webp_data->bytes = calloc(webp_data->bytes, data_size);
  } else {
    webp_data->bytes = realloc(webp_data->bytes, webp_data->size + data_size);
  }
  memcpy(webp_data->bytes + webp_data->size, data, data_size);
  webp_data->size += data_size;
  return 1;
}

// returns a ptr -> [size_t, uint_8(1)...]
// uncontrolled free
EMSCRIPTEN_KEEPALIVE void *encodeWebP(uint32_t *bs) {
  int errcode = 0;
  int ok = 1;
  WebPPicture picture;
  WebPConfig config;
  WebPData webp_data;
  uint32_t *argb = NULL;

  WebPDataInit(&webp_data);

  if (!WebPPictureInit(&picture) || !WebPConfigInit(&config)) {
    // fprintf(stderr, "Error! Version mismatch!\n");
    ok = 0;
    errcode = E_CANNOT_ENCODE;
    return ok;
  }

  picture.width = bs[2];
  picture.height = bs[3];

  // RGBA to ARGB
  argb = malloc(picture.width * picture.height * sizeof(uint32_t));
  memcpy(argb, (uint32_t *)(bs + FBS_HEADER + FBS_FRAME_HEADER),
         picture.width * picture.height * sizeof(uint32_t));
  for (int i = 0; i < picture.width * picture.height; i++) {
    uint32_t *pixel = (uint32_t *)(argb + i);
    *pixel = (((*pixel & 0xff) << 24) | (*pixel >> 8));
  }

  picture.use_argb = 1;
  picture.argb = argb;
  picture.argb_stride = picture.width;
  picture.writer = MemWriter;
  picture.custom_ptr = (void *)&webp_data;

  if (!WebPEncode(&config, &picture)) {
    // fprintf(stderr, "Error! Cannot encode picture as WebP\n");
    // fprintf(stderr, "Error code: %d (%s)\n", picture.error_code,
    // kErrorMessages_VP8_ENC_ERROR_LAST[picture.error_code]);
    ok = 0;
    errcode = E_CANNOT_ENCODE;
    goto ErrorCleanup;
  }

  void *encoded = NULL;

  if (ok) {
    encoded = malloc(sizeof(webp_data.size) + webp_data.size);
    memcpy(encoded, &webp_data.size, sizeof(webp_data.size));
    memcpy(encoded + sizeof(webp_data.size), webp_data.bytes, webp_data.size);
  }

ErrorCleanup:
  WebPFree(picture.extra_info);
  WebPPictureFree(&picture);
  WebPDataClear(&webp_data);
  free(argb);

  if (!ok) {
    return errcode;
  }
  return encoded;
}