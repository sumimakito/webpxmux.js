#ifndef __flatten_bs_h__
#define __flatten_bs_h__

#include <inttypes.h>

#ifdef __cplusplus
extern "C" {
#endif

#define FBS_HEADER 6
#define FBS_FRAME_HEADER 2

uint32_t *bs_alloc(uint32_t width, uint32_t height, uint32_t frame_count,
                   uint32_t loop_count, uint32_t bgcolor);
void bs_append_frame(uint32_t **bs, uint32_t *frame, uint32_t duration,
                     uint32_t is_key_frame);
uint32_t *bs_copy_frame(uint32_t *bs, uint32_t frame_id);

#ifdef __cplusplus
} // extern "C"
#endif

#endif // __flatten_bs_h__