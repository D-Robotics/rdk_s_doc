# FAQ

## FAQ001: 内存概念

- 问：三种 ion 预留的内存，其他两种内存（cma_reserved 和 carveout）的用途是什么？
    - 答：这两种内存本质上都属于 carveout，区分开来的原因是：一个 carveout 主要用于系统中 bpu、codec 内存分配，vio 中的模块从另外一个 carveout 分配内存。
- 问：是否因为部分 IP 需要连续的物理内存，所以需要使用 Hbmem？
    - 答：对。

## FAQ002: 结构体说明

- 问：com_buf 和 graph_buf 含义上有什么区别？
    - 答：com_buf 是单块的连续的 buffer，他的结构比较简单。graph_buf 的话比较复杂，分多个 plane。
- 问：com_buf 是否有长和宽的属性，还是说只有一个 size？
    - 答：只有一个 size，长和宽的属性需要去各个模块取；但是 graph_buf 是有长和宽的属性的。
- 问：com_buf 和 graph_buf 这两个结构体只是封装形式不一样，graph_buf 的结构体的语义更多，本质上这两个是没有什么区别的是吗？
    - 答：对。
- 问：offset 首先需要我们设置偏移才会有吗？这个 offset 是申请内存时候的基址吗？
    - 答：对，需要自行设置。比如说拿到一个 buffer，但是你传给另外一个进程，希望传送一个偏移地址过去，就可以在这里面设置一个 offset。然后这个 offset 就是通过 buffer 传递，透传到另一个进程。申请出来的 buffer，所有的 offset 都是零。offset 用于进程之间传输时，附带透传信息，用于表示 buffer 中的偏移地址。
- 问：com_buf 和 graph_buf 的区别，为什么增加一个 graph_buf？
    - 答：com_buf 在分配时只可指定 size 和常规分配属性；graph_buf 在分配时可指定宽、高、格式、跨距、是否连续以及其他常规分配属性；graph_buf 相较于 com_buf 带有更多的 buffer 信息，便于用户直接分配 RGB/YUV/RAW 格式的 buffer。

## FAQ003: 操作注意点

- 问：是不是每个进程都需要进行 module_open？是相当于用户多一次操作吗？可以重复打开吗？里面带有保护吗？
    - 答：对，每个进程都需要进行 module_open，由于每个进程都是由不同的工程师开发的，所以需要每个进程都进行一次 module_open 的操作。在一个进程内，不建议做多次 open，且没有必要，同时 open 需要有相应的 close。因为，正常情况下，如果申请的内存没有 free，会在 module_close 的时候将内存 free，但是如果少了对应的 close 操作，就会导致内存无法 free。但是，在进程销毁的时候，会将所有 ION 申请的内存进行释放。
- 问：fd 的数量限制可以使用 Linux ulimit 进行修改扩充吗？
    - 答：可以通过 ulimit 的方式去提高 fd 的数量。有些场景中，fd 并不是真正不够用，而是一些接口的错误操作，导致 fd 出现泄漏。

## FAQ004: 函数接口

- 问：这些接口函数是不是相当于在驱动层进行了一个封装？
    - 答：不仅仅是进行了封装。Hbmem 申请的 buffer，在各个模块之间都是通用的，而且可以通过虚拟地址拿到所有的相关信息。比如说从 vio 那边拿到了一块 buffer 之后，就可以把它转成 com_buf，然后再给到另外一个模块去使用，比如说 BPU。
- 问：是否可以通过 get_buffer_info 这个接口获得一些 buffer 的信息？
    - 答：可以。此外可以通过 hb_mem_get_com_buffer_info_with_vaddr 这个接口，利用虚拟地址得到相关的 com_buf 的信息。
- 问：invalid 是一个阻塞接口吗？在两个进程中 invalid 是否会导致死锁？超时之后会怎么样？
    - 答：是一个阻塞接口；不会存在死锁的情况，函数内部会处理；不会存在超时的情况，该函数直到操作完成才会返回。

## FAQ005: 内存分配

- 问：接口申请得到的内存是否物理连续？
    - 答：首先看，选择的 heap 是哪一个，cma 和 carveout 对应的 heap 申请到的内存都是物理连续的。其次，可以通过参数来选择 heap。
- 问：提供的 API 接口是不是等同于比通用接口多了一个进程间共享的这样一个接口，如果不需要进程间共享，是否可以使用 malloc？
    - 答：如果使用本身的 malloc，申请得到的内存物理不连续。
- 问：内存分配得到的 buffer 支持自动格式转换吗？S100X 上有支持硬件转换的功能吗？
    - 答：不支持自动格式转换，硬件格式转换可以尝试使用 CIM 和 Pyramid。
- 问：如何指定 heap 申请内存？
    - 答：在申请时使用的 flags 里面，带上以下属性的一种:
        ``` shell
        HB_MEM_USAGE_PRIV_HEAP_DMA;
        HB_MEM_USAGE_PRIV_HEAP_RESERVED;
        HB_MEM_USAGE_PRIV_HEAP_2_RESERVED;
        ```
- 问：假设申请的地址仅限于 AB 进程 cpu 访问，从性能来看，需要申请 cacheable 的吗？如果 cacheable 的话，b 进程只读的时候需要做 invalidate 吗？
    - 答：如果只是在 CPU 之间使用，那推荐申请 cacheable 的内存。开启 cacheable 之后，内存的访问速率会加快很多，预期1000倍以上。只是在 CPU 之间进行读写访问，不需要进行 invalid 和 flush 等操作，cache 一致性由 CPU 的 MESI 协议保证。
- 问：假设内存是要跑某个 ip，比如 gdc/codec 这种，b 进程的 cpu 不会访问，那可以直接传物理地址吗，还是也必须走 buffer？
    - 答：如果直接使用物理地址，而不使用 ION 申请 buffer，无法保证生命周期中这段地址只有一个用户在使用。因为该内存可能会被其他用户申请走，所以在硬件或者软件使用 buffer 时，需要保证在 buffer 的生命周期中。
- 问：在进行 yuv 内存申请的时候，对应的虚拟地址为什么要转换成 uint8_t？
    - 答：将虚拟地址存放在一个 uint8_t *的指针中，主要是为了考虑兼容性的问题。因为有些系统可能是32位的，有些系统为64位。
- 问：com_buf 和 graphic_buf 中的 offset 的作用是什么？
    - 答：offset 字段可以表明数据相对于当前 buffer 中虚拟地址或者物理地址的偏移量，利用 offset 和虚拟地址或者物理地址可以直接操作期望的数据。
- 问：invalid 和 flush 时出现"No need toinvalidate for uncached buffer"警告，是什么意思？
    - 答：该警告表示针对 uncacheable 的内存不需要使用 invalid 和 flush 等操作。可以通过 flags 查看对应的内存属性确认该内存是否是 cacheable 的。
- 问：如果想用 hbmem_dmacpy 对内存申请有要求么 比如 hb_mem_alloc_com_buf 还是 hbmem_alloc 上？
    - 答：针对从 Hbmem 分配的内存可以直接使用相应的虚拟地址；对于非 Hbmem 分配的内存，通过接口 memcopy 实现内存拷贝。
- 问：如何查看内存的属性？
    - 答：如果用户当前可以获得 common buffer 或者 graphic buffer 结构体，可以根据其中的 flags 进行确认内存属性；如果用户当前只有虚拟地址，可以通过接口 hb_mem_get_buf_info 获取对应 flags。
- 问：目前支持某个 heap 无法分配时自动从另一个 heap 分配内存，为什么还存在无法分配内存的情况？
    - 答：所谓的某一个 heap 分配不出来去另一个 heap 分配，不是说把两个 heap 拼凑起来再次分配，而是去另一个 heap 空间分配，仍然受到这个 heap 的总大小限制，每个 heap 是单独管理的。因此可分配的大小受到每个 heap 可用大小的限制。

## FAQ006: 内存共享

- 问：内存在进程间共享时，进程间传递的是哪些信息？
    - 答：传送一个完整的 com_buf 或 graph_buf 结构体信息。
- 问：com_buf 从一个进程传到另一个进程需要通过 import 接口转一下，才能使用吗？
    - 答：对。
- 问：improt 是不是对应有个释放的，对应计数减一？
    - 答：对。所有的 import 都要做 free 操作。如果一直 import，而没有 free，就会导致 fd 一直增加，超过1024。
- 问：不同的硬件是有不同的内存管理 API 吗？他们之间的内存可以相互转换？且其他硬件模块都能访问？
    - 答：是的。
- 问：多进程内存共享，A 进程如何知道 B 进程 import 后有没有释放？通过 hb_mem_get_share_info 查询吗？
    - 答：可以使用接口 hb_mem_wait_share_status 等待 client count 变为 import 之前，可以在 import 之前使用接口 hb_mem_get_share_info 查询当前的 client count。
- 问：在内存共享 import 的时候，为什么需要 in_buf 与 out_buf 两个 buffer？
    - 答：首先是，内存共享时，需要重新对该 buffer 进行 dma_buf 创建，并关联新的 fd。同时共享的内存并不一定占用整个 buffer 的大小。同时 import 的时候会增加底层该 buffer 的引用计数。
- 问：为什么 dma copy 中小于 PAGE_SIZE 的内存使用 memcopy 而不用 dmacopy？
    - 答：由于之前 dma copy 对于内存的大小有限制，所以在拷贝内存小于4K 的时候使用 memcopy。现在 dma copy 对于内存大小没有限制，最小支持1B
- 问：import 之后 buffer 不再使用为什么需要释放？
    - 答：import 本质上是增加对应 buffer 的引用计数，而 hb_mem_free_buf 本质上是减少对应 buffer 的引用计数。
- 问：一个线程或者一个进程获得一个 com_buf 如何确认 buffer 的有效性？
    - 答：用户使用时，存在一种情况当前线程或者进程需要检查获取的 buffer 是否有效，如果无效则自己去申请 buffer。 \
         针对同一个进程中的同步线程的场景下，可以通过 hb_mem_get_com_buf/hb_mem_get_graph_buf 接口获取 libhbmem 中保存的该 buffer 的信息，并通过匹配相应的信息判断 buffer 是否是申请得到的。 \
         针对不同进程之间的共享的场景，由于不同进程 libhbmem 的信息是独立的，所以无法通过 libhbmem 的接口进行信息确认。
- 问：进程间共享 buffer 时，如何只共享 buffer 的一部分？
    - 答：当进程 A 申请了8K 大小的 buffer 时，但是只想将其中后4K 共享给进程 B。进程 A 只需在传递 buffer 时，在要传递的 buffer 中，将物理地址设置为 PA+4KB，将 size 设置为4K。这样在进程 B import 该 buffer 之后，获取到的虚拟地址就是 buffer 映射后起始虚拟地址加上4KB 的偏移量。
需要注意，设置 offset 不能起到上述的作用，设置 offset 之后，在 buffer import 后返回的 buffer 中，虚拟地址是 mmap 之后的起始虚拟地址。
- 问：地址不确定是 commonbuffer 或者 graphicbuffer 怎么获取 id，同时进程间必须调用 import 函数吗，不确定是那种类型怎么办？
    - 答：可以通过调用接口 hb_mem_get_buf_type_and_buf_with_vaddr 获取虚拟地址对应的 buffer 类型和 buffer 结构体数据，并从中获取 share id。
同进程之间共享 buffer，必须先进行 import 操作。不然无法保证在正常生命周期中安全使用该 buffer，同时不同进程中的虚拟地址无法直接使用，需要 import 之后生成新的虚拟地址。
- 问：多个地址的情况下，不确定是否地址统一通过 commonbuffer 或者 graphicbuffer 分配，还是都单独分配的情况应该怎么使用？
    - 答：通过调用 hb_mem_get_buf_type_and_buf_with_vaddr 接口虚拟地址对应的 buffer 类型和 buffer 结构体数据 import 之后使用，同一个 buffer 支持多次 import。
- 问：某些特殊场景，a 进程申请的地址，a 不会再用，传给 b 进程，b 会管理，这种场景下，可以 b 来真正的释放这块内存吗？
    - 答：A 进程在确保 B 进程 import 之后就可以释放内存，这样 B 进程释放内存之后，该内存就会直接释放。换句话说，该 buffer 的生命周期转由 B 进程控制。

## FAQ007: 内存队列管理

- 问：前面提到内存队列只是单进程的，但是后面提到共享内存是可以用作进程间通信的，内存队列的管理具体是怎么样一个含义？
    - 答：内存共享和内存队列管理其实是两个功能。内存共享主要是指，当某个 IP 拿到一块 buffer 的时候，可以直接把它传给另外一个进程。然后另外一个进程可以利用 import 的接口直接拿到它对应的一个信息，实现内存共享。内存队列管理，就是在进程内进行内存的管理。例如可以在 server 端创建一个 buffer queue，然后将 buffer 添加到队列中，对应的 client 端可以去 dequeue buffer。类似于消息队列。同时这个队列并没有强制要求放 buffer 信息，放其他信息都是可以的。

## FAQ008: 内存池

- 问：如何理解先申请一大块内存再去使用，然后利用自己的内存管理队列管理？
    - 答：内存池分配函数，首先会从某个 heap 中分配得到一大块内存。后续可以在这块内存中去反复分配，它分配时不需要进入内核态处理，所以分配效率是比直接调用对应的 API 接口要高很多。free 的操作相当于将内存还给内存池，最后使用完之后可以将内存池销毁。对于分配得到的多块 buffer，如果需要进行队列管理，可以自己管理，或者利用我们提供的管理队列去管理。
- 问：使用内存池，是否需要提前预判一下，总共需要多少内存，在应用层预留出来？
    - 答：是这样的。
- 问：Memory pool 是否能进行进程间操作？
    - 答：这个不是很推荐，本质来说，它是一块 buf。
- 问：pool 申请大小是否有要求？
    - 答：没有要求，需要多少分配多少，只要剩余空间足够。同时分配以 pagesize 对齐。

## FAQ009: 软件性能

- 问：如何保证 Hbmem 的稳定性？
    - 答：Hbmem 本身是基于 ION 实现，我们会针对 ion 接口和 Hbmem 的接口做相关的异常 case、长稳和压力测试来保证其功能，此外还会在 vio、bpu、codec 等场景中开展分配功能的验证。
- 问：对于用户分配了未释放的场景如何保证？
    - 答：首先对于单个进程退出时不释放的话，我们系统是会自动内存回收；其次如果单个进程运行时不释放的话，可以查看相关 sys 节点检查该用户的内存分配情况。

## FAQ010: 内存泄漏

- 问：进程销毁的时候不会导致内存泄漏吗？
    - 答：正常情况下，进程销毁时所有的内存都会被回收，不会存在任何的泄漏。但是有一种情况，比如说在 A 进程中分配了内存，然后共享给 B 进程，这导致内存使用计数加一。如果这时候销毁 A 进程，就不会去释放对应的内存。内存会留在 B 进程中，会在 B 进程销毁的时候被释放。

## FAQ011: 软件调试

- 问：这些接口在使用过程中，是否有诊断工具？
    - 答：有相应的诊断工具，可以利用 sys 节点查看。
        ```shell
        #对应HB_MEM_USAGE_PRIV_HEAP_DMA
        cat /sys/kernel/debug/ion/heaps/ion_cma
        ```

        ```shell
        #对应HB_MEM_USAGE_PRIV_HEAP_RESERVED
        cat /sys/kernel/debug/ion/heaps/carveout
        ```

        ```shell
        #对应HB_MEM_USAGE_PRIV_HEAP_2_RESERVED
        cat /sys/kernel/debug/ion/heaps/cma_reserved
        ```

        ```shell
        #对应获取所有heap信息
        cat /sys/kernel/debug/ion/heaps/all_heap_info
        ```

        ```shell
        cat /sys/kernel/debug/ion/clients/"client名称"
        ```

## FAQ012: 模块使用

- 问：camera、金字塔等模块输出的都是 com_buf？
    - 答：对，现在系统上的模块使用的都是 com_buf，内存都是连续的。
- 问：hbmem.h 文件中的 hbmem_alloc 接口不建议使用吗？
    - 答：不建议使用，这是原来的接口，留下来是为了兼容性。如果以前有一套程序基于 Hbmem，就可以使用这个，如果没有，使用新的接口就行。
