# Function Description

The Hbmem module primarily implements functions including **memory allocation**, **memory sharing**, **memory queue management**, and **memory pool**, and is specifically used to manage **system-reserved memory**.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/01_func_overview-en.png" alt="" style={{ width: '100%' }} />

## Memory Allocation

The memory allocation-related interfaces mainly implement functions such as allocation, release, and flush of contiguous physical memory. This module provides two types of memory allocation: `com_buf` is used for regular contiguous memory allocation, suitable for scenarios such as voice and pure feature maps, while `graph_buf` is used for memory allocation of RGB, RAW, and YUV images. For RGB and RAW formats, a single buffer is used; for planar YUV formats, the physical addresses of each component are non-contiguous, making it suitable for scenarios like the output buffer of Pyramid.

Additionally, if you need to allocate multiple graphics, you can use the graphic buffer group-related interfaces. This set of interfaces supports allocating multiple graphic buffers at once and returning them as a group.

This module also supports setting memory attributes, including cache attributes and memory heap attributes. After successful memory allocation, **the user obtains the corresponding file handle**. Based on this file handle, the user can release the related physical memory, invalidate/flush it, retrieve buffer information, and perform other operations. To facilitate memory operations, the module also supports using virtual addresses for operations such as invalidate/flush and retrieving buffer information.

It is not recommended for users to directly mmap or pass physical addresses, as these operations **do not increase the memory's reference count**, leading to scenarios where the user may still access the memory after it has been released.

## Memory Sharing

The memory sharing module interfaces enable safe memory sharing between multiple threads/processes. Users can directly pass a buffer of type `com_buf` or `graph_buf` to another thread or process, and then import the buffer using the relevant import interface, thereby obtaining the buffer's information and increasing its reference count to prevent it from being released by other modules, thus achieving safe buffer sharing. This is primarily implemented through memory queue management to facilitate the sharing of buffers between producers and consumers.

Similarly, graphic buffer groups also support safe memory sharing across multiple threads/processes, similar to graphic buffers.

## Memory Queue Management

The memory queue management module provides a general queue management mechanism that supports producers and consumers operating queue elements in four states: **FREE/DEQUEUE/QUEUE/REQUEST**. The FREE state indicates that the producer can acquire the queue space and fill in element information; the DEQUEUE state indicates that the element has been acquired by the producer and not yet returned; the QUEUE state indicates that the producer has filled the queue element and it can be acquired by the consumer; the REQUEST state indicates that the element has been acquired by the consumer and not yet released. Producers and consumers use their respective interfaces to ensure the proper rotation of buffer elements between them.

**It is important to note that because the memory queue is a circular queue, writing events to the queue when it is full will overwrite the first existing event. Additionally, this queue only supports operations within a single process.**

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/01_memory_queue-en.jpg" alt="" style={{ width: '100%' }} />

## Memory Pool

The memory pool module interfaces allow users to create a local memory pool through memory allocation functions and then allocate and release small blocks of memory from this pool.

**Using the memory pool module ensures that users can quickly allocate memory without going through kernel space**, thereby achieving more efficient memory management. Currently, user programs (such as hbrt, dnn, etc.) often implement their own memory management modules to increase memory allocation speed, leading to code duplication and difficulties in development and maintenance. Therefore, users can utilize the memory pool module for memory management, improving module reusability.

During system startup, a large block of memory is pre-allocated for the user, so when users request memory, they can directly use memory from the pool, bypassing the step of trapping into kernel space to allocate memory, or rather, this step has been implemented in advance. **It is important to note that this memory pool currently only supports operations within a single process, and memory allocated from the pool does not support sharing across multiple processes.**

## Shared Memory Pool

The shared memory pool function is the same as above, except that memory allocated from the shared memory pool supports sharing across multiple processes. However, the buffers allocated from the shared memory pool are of the same size, and the buffer size can only be specified when creating the shared memory pool. Due to support for multi-process sharing, operations such as importing and freeing memory allocated from the shared memory pool are slightly less efficient than those of ordinary memory.