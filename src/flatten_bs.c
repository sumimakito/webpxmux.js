#include <assert.h>
#include <memory.h>
#include <stdio.h>
#include <stdlib.h>

#include "./flatten_bs.h"

uint32_t *bs_alloc(uint32_t width, uint32_t height, uint32_t frame_count,
              uint32_t loop_count, uint32_t bgcolor) {
  uint32_t *bs =
      calloc(FBS_HEADER + (FBS_FRAME_HEADER + width * height) * frame_count,
             sizeof(uint32_t));
  bs[0] = 0;           // internal framecounter
  bs[1] = frame_count; // frame count
  bs[2] = width;
  bs[3] = height;
  bs[4] = loop_count;
  bs[5] = bgcolor;
  return bs;
}

void bs_append_frame(uint32_t **bs, uint32_t *frame, uint32_t duration,
                     uint32_t is_key_frame) {
  uint32_t current_frame = (*bs)[0];
  uint32_t frame_pixels = (*bs)[2] * (*bs)[3];
  assert((*bs)[0] < (*bs)[1]);
  uint32_t *offset =
      *bs + FBS_HEADER + current_frame * (FBS_FRAME_HEADER + frame_pixels);
  memcpy(offset, &duration, sizeof(uint32_t));
  memcpy(offset + 1, &is_key_frame, sizeof(uint32_t));
  memcpy(offset + FBS_FRAME_HEADER, frame, frame_pixels * sizeof(uint32_t));
  (*bs)[0]++;
}

uint32_t *bs_copy_frame(uint32_t *bs, uint32_t frame_id) {
  uint32_t width = bs[2];
  uint32_t height = bs[3];
  uint32_t *copied = bs_alloc(width, height, 1, bs[4], bs[5]);
  copied[0] = 1;
  copied[2] = width;
  copied[3] = height;
  memcpy((uint32_t *)(copied + FBS_HEADER),
         (uint32_t *)(bs + FBS_HEADER +
                      frame_id * (FBS_FRAME_HEADER + width * height)),
         (FBS_FRAME_HEADER + width * height) * sizeof(uint32_t));
  return copied;
}