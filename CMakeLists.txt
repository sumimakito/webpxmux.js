include($ENV{EMSDK}/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake)

project (webpxmux.wasm)
cmake_minimum_required(VERSION 3.5.1)
set(CMAKE_SKIP_INSTALL_RULES True)

include_directories(
    src/libwebp 
    src/libwebp/src
)

file(GLOB SOURCES 
    src/*.c
    src/libwebp/src/dec/*.c
    src/libwebp/src/demux/*.c
    src/libwebp/src/dsp/*.c
    src/libwebp/src/enc/*.c
    src/libwebp/src/mux/*.c
    src/libwebp/src/utils/*.c
    src/libwebp/src/webp/*.c
    src/libwebp/imageio/*.c
)

add_definitions(-O3 -g0)

set(WASM_FLAGS "-s WASM=1")

set(EMCC_FLAGS "${WASM_FLAGS} -s MODULARIZE=1 -s EXTRA_EXPORTED_RUNTIME_METHODS='[cwrap, getValue, setValue]' -s LINKABLE=1 -s EXPORT_ALL=0 -s ALLOW_MEMORY_GROWTH=1 -s FORCE_FILESYSTEM=0")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/build")
add_executable(webpxmux ${SOURCES})

set(CMAKE_EXECUTABLE_SUFFIX ".js")
set_target_properties(webpxmux PROPERTIES LINK_FLAGS ${EMCC_FLAGS})
