# FAQ

## FAQ001: Memory Concepts

- Q: What is the purpose of the other two types of memory (cma_reserved and carveout) among the three types of ion-reserved memory?
    - A: Both types of memory are essentially carveout. The reason for distinguishing them is that one carveout is mainly used for bpu and codec memory allocation in the system, while modules in vio allocate memory from the other carveout.
- Q: Is Hbmem required because some IPs need contiguous physical memory?
    - A: Yes.

## FAQ002: Structure Explanation

- Q: What is the difference in meaning between com_buf and graph_buf?
    - A: com_buf is a single contiguous buffer with a relatively simple structure. graph_buf is more complex and is divided into multiple planes.
- Q: Does com_buf have length and width attributes, or does it only have a size?
    - A: It only has a size. The length and width attributes need to be obtained from each module. However, graph_buf does have length and width attributes.
- Q: Are the com_buf and graph_buf structures just different encapsulation formats, with graph_buf having more semantic meaning, but essentially the same?
    - A: Yes.
- Q: Does the offset only exist after we set it? Is this offset the base address when allocating memory?
    - A: Yes, it needs to be set manually. For example, if you obtain a buffer but want to pass it to another process with an offset address, you can set an offset here. This offset is then passed through the buffer to the other process. All offsets for allocated buffers are zero. The offset is used to carry transparent information during inter-process transmission, indicating the offset address within the buffer.
- Q: What is the difference between com_buf and graph_buf, and why was graph_buf added?
    - A: com_buf only allows specifying size and常规 allocation attributes during allocation. graph_buf allows specifying width, height, format, stride, contiguity, and other常规 allocation attributes during allocation. Compared to com_buf, graph_buf carries more buffer information, making it easier for users to directly allocate buffers in RGB/YUV/RAW formats.

## FAQ003: Operational Precautions

- Q: Does every process need to perform module_open? Does this mean an extra operation for the user? Can it be opened repeatedly? Is there protection inside?
    - A: Yes, every process needs to perform module_open. Since each process is developed by different engineers, each process needs to perform the module_open operation. It is not recommended and is unnecessary to open multiple times within a single process. Each open should have a corresponding close. Normally, if allocated memory is not freed, it will be freed during module_close. However, if the corresponding close operation is missing, the memory cannot be freed. However, when a process is destroyed, all memory allocated by ION will be released.
- Q: Can the file descriptor limit be increased using Linux ulimit?
    - A: Yes, you can increase the file descriptor limit using ulimit. In some scenarios, the issue is not actually insufficient file descriptors, but rather incorrect operations with some interfaces leading to file descriptor leaks.

## FAQ004: Function Interfaces

- Q: Are these interface functions equivalent to a封装 at the driver layer?
    - A: It is not just encapsulation. Buffers allocated by Hbmem are通用的 across modules, and all related information can be obtained through virtual addresses. For example, after obtaining a buffer from vio, you can convert it to com_buf and then pass it to another module, such as BPU.
- Q: Can I obtain buffer information through the get_buffer_info interface?
    - A: Yes. Additionally, you can use the hb_mem_get_com_buffer_info_with_vaddr interface to obtain related com_buf information using a virtual address.
- Q: Is invalid a blocking interface? Can invalid in two processes cause a deadlock? What happens after a timeout?
    - A: It is a blocking interface. Deadlock will not occur, as the function handles it internally. There is no timeout scenario; the function will not return until the operation is complete.

## FAQ005: Memory Allocation

- Q: Is the memory obtained through the interface physically contiguous?
    - A: First, it depends on which heap is selected. Memory obtained from the heaps corresponding to cma and carveout is physically contiguous. Second, you can select the heap through parameters.
- Q: Do the provided APIs essentially add an interface for inter-process sharing compared to general interfaces? If inter-process sharing is not needed, can malloc be used?
    - A: Using malloc directly results in memory that is not physically contiguous.
- Q: Does the allocated buffer support automatic format conversion? Does the S100X support hardware-based conversion?
    - A: Automatic format conversion is not supported. For hardware format conversion, you can try using CIM and Pyramid.
- Q: How do I specify a heap for memory allocation?
    - A: In the flags used during allocation, include one of the following attributes:
        ``` shell
        HB_MEM_USAGE_PRIV_HEAP_DMA;
        HB_MEM_USAGE_PRIV_HEAP_RESERVED;
        HB_MEM_USAGE_PRIV_HEAP_2_RESERVED;
        ```
- Q: If the allocated address is only accessed by the CPUs of processes A and B, from a performance perspective, should cacheable memory be requested? If cacheable, does process B need to perform invalidate when only reading?
    - A: If it is only used between CPUs, it is recommended to request cacheable memory. Enabling cacheable significantly speeds up memory access, expected to be over 1000 times faster. For read/write access only between CPUs, invalid and flush operations are not needed, as cache coherency is guaranteed by the CPU's MESI protocol.
- Q: If the memory is to be used by an IP such as GDC/codec, and process B's CPU will not access it, can the physical address be passed directly, or must the buffer be used?
    - A: If you use a physical address directly without requesting a buffer via ION, you cannot guarantee that only one user is using this address during its lifecycle. Because the memory might be requested by another user, so when hardware or software uses a buffer, you need to ensure it is within the buffer's lifecycle.
- Q: When allocating YUV memory, why does the corresponding virtual address need to be cast to uint8_t?
    - A: Storing the virtual address in a uint8_t * pointer is mainly for compatibility considerations, as some systems may be 32-bit while others are 64-bit.
- Q: What is the purpose of the offset in com_buf and graphic_buf?
    - A: The offset field indicates the offset of the data relative to the current buffer's virtual or physical address. Using the offset along with the virtual or physical address allows direct operation on the desired data.
- Q: What does the warning "No need to invalidate for uncached buffer" mean during invalid and flush operations?
    - A: This warning indicates that invalid and flush operations are not needed for uncacheable memory. You can check the memory attributes via flags to confirm if the memory is cacheable.
- Q: Are there any requirements for memory allocation when using hbmem_dmacpy, such as using hb_mem_alloc_com_buf or hbmem_alloc?
    - A: For memory allocated from Hbmem, the corresponding virtual address can be used directly. For memory not allocated from Hbmem, use the memcopy interface to perform memory copying.
- Q: How can I check memory attributes?
    - A: If the user has access to the common buffer or graphic buffer structure, they can check the flags to confirm memory attributes. If the user only has a virtual address, they can use the interface hb_mem_get_buf_info to obtain the corresponding flags.
- Q: It currently supports automatically allocating from another heap when a specific heap cannot allocate memory. Why are there still cases where memory cannot be allocated?
    - A: Saying that allocation from one heap falls back to another heap does not mean combining the two heaps for allocation again. It means allocating from the other heap's space, which is still limited by that heap's total size. Each heap is managed independently. Therefore, the allocatable size is limited by each heap's available size.

## FAQ006: Memory Sharing

- Q: What information is passed between processes when sharing memory?
    - A: The complete com_buf or graph_buf structure information is passed.
- Q: Does a com_buf need to be converted via the import interface before it can be used after being passed from one process to another?
    - A: Yes.
- Q: Does import have a corresponding release operation that decrements a reference count?
    - A: Yes. Every import must be freed. If you keep importing without freeing, the file descriptor count will keep increasing, exceeding 1024.
- Q: Do different hardware modules have different memory management APIs? Can memory be converted between them? And can all other hardware modules access it?
    - A: Yes.
- Q: In multi-process memory sharing, how does process A know whether process B has released after import? By querying via hb_mem_get_share_info?
    - A: You can use the interface hb_mem_wait_share_status to wait for the client count to change before import. You can also use the interface hb_mem_get_share_info to query the current client count before importing.
- Q: Why are both in_buf and out_buf needed when importing shared memory?
    - A: First, when sharing memory, a new dma_buf needs to be created for the buffer and associated with a new file descriptor. Also, the shared memory may not necessarily occupy the entire buffer size. Additionally, importing increments the underlying buffer's reference count.
- Q: Why does dma copy use memcopy for memory smaller than PAGE_SIZE instead of dmacopy?
    - A: Previously, dma copy had size limitations for memory, so memcopy was used for copies smaller than 4K. Now, dma copy has no size limitations, supporting a minimum of 1B.
- Q: Why does a buffer need to be released after import when it is no longer used?
    - A: Import essentially increments the buffer's reference count, while hb_mem_free_buf essentially decrements the buffer's reference count.
- Q: How can a thread or process confirm the validity of a com_buf it obtains?
    - A: When using a buffer, there might be cases where the current thread or process needs to check if the obtained buffer is valid. If it is invalid, it will allocate a buffer itself. \
         For synchronous threads within the same process, you can use the hb_mem_get_com_buf/hb_mem_get_graph_buf interface to obtain the buffer information stored in libhbmem and match the corresponding information to determine if the buffer was allocated. \
         For sharing scenarios between different processes, since the libhbmem information for different processes is independent, information confirmation cannot be done through libhbmem interfaces.
- Q: When sharing a buffer between processes, how can only a portion of the buffer be shared?
    - A: When process A allocates an 8K buffer but only wants to share the last 4K with process B, process A only needs to set the physical address to PA+4KB and the size to 4K in the buffer being passed. After process B imports this buffer, the obtained virtual address will be the buffer's mapped starting virtual address plus a 4KB offset. \
         Note that setting the offset does not achieve the above effect. After setting the offset, the virtual address in the buffer returned after import is the starting virtual address after mmap.
- Q: How do you get the ID if the address type (commonbuffer or graphicbuffer) is unknown, and must processes call the import function? What if the type is unknown?
    - A: You can call the interface hb_mem_get_buf_type_and_buf_with_vaddr to get the buffer type and buffer structure data corresponding to the virtual address, and extract the share ID from it. \
         For sharing buffers between different processes, import must be performed first. Otherwise, there is no guarantee of safe usage of the buffer within its normal lifecycle. Additionally, virtual addresses in different processes cannot be used directly; a new virtual address needs to be generated after import.
- Q: For multiple addresses, if it is uncertain whether the addresses are uniformly allocated via commonbuffer or graphicbuffer, or if they are allocated separately, how should this be handled?
    - A: After calling the interface hb_mem_get_buf_type_and_buf_with_vaddr to get the buffer type and buffer structure data corresponding to the virtual address, use it after import. The same buffer supports multiple imports.
- Q: In some special scenarios, process A allocates an address that A will no longer use and passes it to process B, which will manage it. In such cases, can process B actually release this memory?
    - A: Process A can release the memory after ensuring process B has imported it. Then, when process B releases the memory, it will be freed directly. In other words, the lifecycle of the buffer is transferred to process B for control.

## FAQ007: Memory Queue Management

- Q: It was mentioned earlier that memory queues are only for a single process, but later it was mentioned that shared memory can be used for inter-process communication. What exactly does memory queue management mean?
    - A: Memory sharing and memory queue management are actually two different functions. Memory sharing mainly means that when an IP obtains a buffer, it can directly pass it to another process. The other process can then use the import interface to directly obtain the corresponding information, achieving memory sharing. Memory queue management is about managing memory within a process. For example, you can create a buffer queue on the server side, add buffers to the queue, and the corresponding client can dequeue buffers. It is similar to a message queue. This queue does not enforce storing buffer information; storing other information is also acceptable.

## FAQ008: Memory Pool

- Q: How to understand allocating a large block of memory first for later use, and then managing it using your own memory management queue?
    - A: The memory pool allocation function first allocates a large block of memory from a heap. Subsequently, it can allocate from this block repeatedly. Allocation does not require entering kernel mode, so the allocation efficiency is much higher than directly calling the corresponding API. The free operation effectively returns the memory to the memory pool. Finally, the memory pool can be destroyed after use. If you need queue management for multiple allocated buffers, you can manage them yourself or use our provided management queue.
- Q: When using a memory pool, is it necessary to預先 estimate the total memory required and reserve it at the application layer?
    - A: Yes, that is correct.
- Q: Can a memory pool be used for inter-process operations?
    - A: This is not recommended. In essence, it is a single buffer.
- Q: Are there requirements for the size of a pool allocation request?
    - A: There are no requirements. You can allocate as much as needed, as long as sufficient space remains. Allocations are aligned to the page size.

## FAQ009: Software Performance

- Q: How is the stability of Hbmem ensured?
    - A: Hbmem itself is based on ION. We perform related异常 case, long-duration stability, and stress tests on the ion interface and Hbmem interface to ensure its functionality. Additionally, we conduct allocation function verification in scenarios such as vio, bpu, and codec.
- Q: How is the scenario where a user allocates but does not release memory handled?
    - A: First, if a single process exits without releasing memory, our system will automatically reclaim the memory. Second, if a single process does not release memory while running, you can check the relevant sys node to inspect the user's memory allocation status.

## FAQ010: Memory Leaks

- Q: Won't memory leaks occur when a process is destroyed?
    - A: Normally, all memory is reclaimed when a process is destroyed, and no leaks occur. However, there is one scenario: for example, memory is allocated in process A and shared with process B, incrementing the memory usage count. If process A is destroyed at this point, the corresponding memory will not be released. The memory will remain in process B and be released when process B is destroyed.

## FAQ011: Software Debugging

- Q: Are there diagnostic tools for these interfaces during use?
    - A: Yes, there are corresponding diagnostic tools. You can use sys nodes to view information.
        ```shell
        # Corresponding to HB_MEM_USAGE_PRIV_HEAP_DMA
        cat /sys/kernel/debug/ion/heaps/ion_cma
        ```

        ```shell
        # Corresponding to HB_MEM_USAGE_PRIV_HEAP_RESERVED
        cat /sys/kernel/debug/ion/heaps/carveout
        ```

        ```shell
        # Corresponding to HB_MEM_USAGE_PRIV_HEAP_2_RESERVED
        cat /sys/kernel/debug/ion/heaps/cma_reserved
        ```

        ```shell
        # Corresponding to getting all heap information
        cat /sys/kernel/debug/ion/heaps/all_heap_info
        ```

        ```shell
        cat /sys/kernel/debug/ion/clients/"client name"
        ```

## FAQ012: Module Usage

- Q: Do camera, pyramid, and other modules output com_buf?
    - A: Yes, currently, the modules on the system use com_buf, and the memory is contiguous.
- Q: Is the hbmem_alloc interface in the hbmem.h file not recommended for use?
    - A: It is not recommended. This is an old interface retained for compatibility. If you have an existing set of programs based on Hbmem, you can use it. If not, use the new interfaces.