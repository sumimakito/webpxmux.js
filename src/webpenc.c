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

// returns a ptr -> WebPConfig *
// uncontrolled free
EMSCRIPTEN_KEEPALIVE void *new_webpwrapper_config() {
  WebPConfig * config = (WebPConfig *)malloc(sizeof(struct WebPConfig));
  memset((void *)config, 0, sizeof(struct WebPConfig));
  return config;
}

#define WEBP_PRESET_DEFAULT_TYPE  1
#define WEBP_PRESET_PICTURE_TYPE  2
#define WEBP_PRESET_PHOTO_TYPE    3
#define WEBP_PRESET_DRAWING_TYPE  4
#define WEBP_PRESET_ICON_TYPE     5
#define WEBP_PRESET_TEXT_TYPE     6

void load_webp_config_preset(WebPConfig * config, int value, float quality_factor) {
  WebPPreset preset = WEBP_PRESET_DEFAULT;
  switch (value) {
    case WEBP_PRESET_DEFAULT_TYPE:
      preset = WEBP_PRESET_DEFAULT;
      break;
    case WEBP_PRESET_PICTURE_TYPE:
      preset = WEBP_PRESET_PICTURE;
      break;
    case WEBP_PRESET_PHOTO_TYPE:
      preset = WEBP_PRESET_PHOTO;
      break;
    case WEBP_PRESET_DRAWING_TYPE:
      preset = WEBP_PRESET_DRAWING;
      break;
    case WEBP_PRESET_ICON_TYPE:
      preset = WEBP_PRESET_ICON;
      break;
    case WEBP_PRESET_TEXT_TYPE:
      preset = WEBP_PRESET_TEXT;
      break;
    default:
      break;
  }
  WebPConfigPreset(config, preset, quality_factor);
}

#define SET_WEBP_CONFIG_PARAM_INT(parameter_name) \
void set_webp_config_##parameter_name (WebPConfig * config, int value) {\
  config->parameter_name = value;\
}

#define SET_WEBP_CONFIG_PARAM_FLOAT(parameter_name) \
void set_webp_config_##parameter_name(WebPConfig * config, float value) {\
  config->parameter_name = value;\
}

#define GET_WEBP_CONFIG_PARAM_INT(parameter_name) \
int get_webp_config_##parameter_name (WebPConfig * config) {\
  return config->parameter_name;\
}

#define GET_WEBP_CONFIG_PARAM_FLOAT(parameter_name) \
float get_webp_config_##parameter_name(WebPConfig * config) {\
  return config->parameter_name;\
}

SET_WEBP_CONFIG_PARAM_INT(lossless)
SET_WEBP_CONFIG_PARAM_FLOAT(quality)
SET_WEBP_CONFIG_PARAM_INT(method)
SET_WEBP_CONFIG_PARAM_INT(target_size)
SET_WEBP_CONFIG_PARAM_FLOAT(target_PSNR)
SET_WEBP_CONFIG_PARAM_INT(segments)
SET_WEBP_CONFIG_PARAM_INT(sns_strength)
SET_WEBP_CONFIG_PARAM_INT(filter_strength)
SET_WEBP_CONFIG_PARAM_INT(filter_sharpness)
SET_WEBP_CONFIG_PARAM_INT(filter_type)
SET_WEBP_CONFIG_PARAM_INT(autofilter)
SET_WEBP_CONFIG_PARAM_INT(alpha_compression)
SET_WEBP_CONFIG_PARAM_INT(alpha_filtering)
SET_WEBP_CONFIG_PARAM_INT(alpha_quality)
SET_WEBP_CONFIG_PARAM_INT(pass)
SET_WEBP_CONFIG_PARAM_INT(preprocessing)
SET_WEBP_CONFIG_PARAM_INT(partitions)
SET_WEBP_CONFIG_PARAM_INT(partition_limit)
SET_WEBP_CONFIG_PARAM_INT(emulate_jpeg_size)
SET_WEBP_CONFIG_PARAM_INT(thread_level)
SET_WEBP_CONFIG_PARAM_INT(low_memory)
SET_WEBP_CONFIG_PARAM_INT(near_lossless)
SET_WEBP_CONFIG_PARAM_INT(exact)
SET_WEBP_CONFIG_PARAM_INT(use_delta_palette)
SET_WEBP_CONFIG_PARAM_INT(use_sharp_yuv)

GET_WEBP_CONFIG_PARAM_INT(lossless)
GET_WEBP_CONFIG_PARAM_FLOAT(quality)
GET_WEBP_CONFIG_PARAM_INT(method)
GET_WEBP_CONFIG_PARAM_INT(target_size)
GET_WEBP_CONFIG_PARAM_FLOAT(target_PSNR)
GET_WEBP_CONFIG_PARAM_INT(segments)
GET_WEBP_CONFIG_PARAM_INT(sns_strength)
GET_WEBP_CONFIG_PARAM_INT(filter_strength)
GET_WEBP_CONFIG_PARAM_INT(filter_sharpness)
GET_WEBP_CONFIG_PARAM_INT(filter_type)
GET_WEBP_CONFIG_PARAM_INT(autofilter)
GET_WEBP_CONFIG_PARAM_INT(alpha_compression)
GET_WEBP_CONFIG_PARAM_INT(alpha_filtering)
GET_WEBP_CONFIG_PARAM_INT(alpha_quality)
GET_WEBP_CONFIG_PARAM_INT(pass)
GET_WEBP_CONFIG_PARAM_INT(preprocessing)
GET_WEBP_CONFIG_PARAM_INT(partitions)
GET_WEBP_CONFIG_PARAM_INT(partition_limit)
GET_WEBP_CONFIG_PARAM_INT(emulate_jpeg_size)
GET_WEBP_CONFIG_PARAM_INT(thread_level)
GET_WEBP_CONFIG_PARAM_INT(low_memory)
GET_WEBP_CONFIG_PARAM_INT(near_lossless)
GET_WEBP_CONFIG_PARAM_INT(exact)
GET_WEBP_CONFIG_PARAM_INT(use_delta_palette)
GET_WEBP_CONFIG_PARAM_INT(use_sharp_yuv)

#define WEBP_HINT_DEFAULT_TYPE  1
#define WEBP_HINT_PICTURE_TYPE  2
#define WEBP_HINT_PHOTO_TYPE    3
#define WEBP_HINT_GRAPH_TYPE    4

void set_webp_config_image_hint(WebPConfig * config, int value) {
  switch (value) {
    case WEBP_HINT_DEFAULT_TYPE:
      config->image_hint = WEBP_HINT_DEFAULT;
      break;
    case WEBP_HINT_PICTURE_TYPE:
      config->image_hint = WEBP_HINT_PICTURE;
      break;
    case WEBP_HINT_PHOTO_TYPE:
      config->image_hint = WEBP_HINT_PHOTO;
      break;
    case WEBP_HINT_GRAPH_TYPE:
      config->image_hint = WEBP_HINT_GRAPH;
      break;
    default:
      break;
  }
}

#define WEBP_PRESET_DEFAULT_TYPE  1
#define WEBP_PRESET_PICTURE_TYPE  2
#define WEBP_PRESET_PHOTO_TYPE    3
#define WEBP_PRESET_DRAWING_TYPE  4
#define WEBP_PRESET_ICON_TYPE     5
#define WEBP_PRESET_TEXT_TYPE     6

void set_webp_config_preset(WebPConfig * config, int value, float quality_factor) {
  WebPPreset preset = WEBP_PRESET_DEFAULT;
  switch (value) {
    case WEBP_PRESET_DEFAULT_TYPE:
      preset = WEBP_PRESET_DEFAULT;
      break;
    case WEBP_PRESET_PICTURE_TYPE:
      preset = WEBP_PRESET_PICTURE;
      break;
    case WEBP_PRESET_PHOTO_TYPE:
      preset = WEBP_PRESET_PHOTO;
      break;
    case WEBP_PRESET_DRAWING_TYPE:
      preset = WEBP_PRESET_DRAWING;
      break;
    case WEBP_PRESET_ICON_TYPE:
      preset = WEBP_PRESET_ICON;
      break;
    case WEBP_PRESET_TEXT_TYPE:
      preset = WEBP_PRESET_TEXT;
      break;
    default:
      break;
  }
  WebPConfigPreset(config, preset, quality_factor);
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

// returns a ptr -> [size_t, uint_8(1)...]
// uncontrolled free
EMSCRIPTEN_KEEPALIVE void *encodeWebPWithConfig(uint32_t *bs, WebPConfig * config) {
  int errcode = 0;
  int ok = 1;
  WebPPicture picture;
  WebPData webp_data;
  uint32_t *argb = NULL;

  if (config == NULL) {
    ok = 0;
    errcode = E_CANNOT_ENCODE;
    return ok;
  }

  WebPDataInit(&webp_data);

  if (!WebPPictureInit(&picture)) {
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

  picture.use_argb = !!config->lossless;
  picture.argb = argb;
  picture.argb_stride = picture.width;
  picture.writer = MemWriter;
  picture.custom_ptr = (void *)&webp_data;

  if (!WebPEncode(config, &picture)) {
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

