---
sidebar_position: 3
---

# 7.5.4 MCU1 Development Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## MCU Interrupt Number and Module Correspondence
<DocScope products="RDK S100">
| Module | Interrupt Number | Name |
|--------|----------------------------------------|---------------------------------------------|
| SGI| 0~15| |
| PPI| 16~31| |
| MCU_STCU | 32| Bist_Stcu0Isr|
| MEDIA_TOP_STCU|33|Bist_Stcu1Isr|
| VIDEO_STCU|34|Bist_Stcu2Isr|
|VDSP_STCU|35|Bist_Stcu3Isr|
|HSIS_STCU|36|Bist_Stcu4Isr|
|GPU_STCU|37|Bist_Stcu5Isr|
|DDR2_STCU|38|Bist_Stcu6Isr|
|DDR1_STCU|39|Bist_Stcu7Isr|
|DDR0_STCU|40|Bist_Stcu8Isr|
|CPU_MP4_STCU|41|Bist_Stcu9Isr|
|CPU_MP2_STCU|42|Bist_Stcu10Isr|
|CAM_STCU|43|Bist_Stcu11Isr|
|BPU0_STCU|44|Bist_Stcu12Isr|
|UART0|45|Uart0_Isr|
|UART1|46|Uart1_Isr|
|UART2|47|Uart2_Isr|
|ADC0|48|Adc_Ch0WdIsr|
||49|Adc_Ch1WdIsr|
||50|Adc_Ch2WdIsr|
||51|Adc_Ch3WdIsr|
||52|Adc_Ch4WdIsr|
||53|Adc_Ch5WdIsr|
||54|Adc_Ch6WdIsr|
||55|Adc_Ch7WdIsr|
||56|Adc_Ch8WdIsr|
||57|Adc_Ch9WdIsr|
||58|Adc_Ch10WdIsr|
||59|Adc_Ch11WdIsr|
||60|Adc_Ch12WdIsr|
||61|Adc_Ch13WdIsr|
||62|Adc_InjIsr|
||63|Adc_NorIsr|
|I2C0|64|I2c0_Isr|
|I2C1|65|I2c1_Isr|
|I2C2|66|I2c2_Isr|
|I2C3|67|I2c3_Isr|
|GPIO0|68|Gpio_Icu0ExtIsr|
|GPIO1|69|Gpio_Icu1ExtIsr|
|GPIO2|70|Gpio_Icu2ExtIsr|
|WWDT0|71|Wdg_Ins0RstIsr|
||72|Wdg_Ins0IntIsr|
|WWDT1|73|Wdg_Ins1RstIsr|
||74|Wdg_Ins1IntIsr|
|WWDT2|75|Wdg_Ins2RstIsr|
||76|Wdg_Ins2IntIsr|
|OTF_CRC0|77|Otf_Isr|
|CRC0|78|Crc_Isr|
|GPT0|79|Gpt_Ins0Ch0Isr|
||80|Gpt_Ins0Ch1Isr|
||81|Gpt_Ins0Ch2Isr|
||82|Gpt_Ins0Ch3Isr|
|GPT1|83|Gpt_Ins1Ch0Isr|
||84|Gpt_Ins1Ch1Isr|
||85|Gpt_Ins1Ch2Isr|
||86|Gpt_Ins1Ch3Isr|
|GPT2|87|Gpt_Ins2Ch0Isr|
||88|Gpt_Ins2Ch1Isr|
||89|Gpt_Ins2Ch2Isr|
||90|Gpt_Ins2Ch3Isr|
|GPT3|91|Gpt_Ins3Ch0Isr|
||92|Gpt_Ins3Ch1Isr|
||93|Gpt_Ins3Ch2Isr|
||94|Gpt_Ins3Ch3Isr|
|GPT4|95|Gpt_Ins4Ch0Isr|
||96|Gpt_Ins4Ch1Isr|
||97|Gpt_Ins4Ch2Isr|
||98|Gpt_Ins4Ch3Isr|
|GPT5|99|Gpt_Ins5Ch0Isr|
||100|Gpt_Ins5Ch1Isr|
||101|Gpt_Ins5Ch2Isr|
||102|Gpt_Ins5Ch3Isr|
|PMU|103|Pmu_ReqDeny0Isr|
|BIFSPI|104||
|PVT|105|Pvt_McuAlarmIsr|
|L1FCHM|106|Fchm_MissionIntIsr|
||107|Fchm_NcfIntIsr|
||108|Fchm_CfIntIsr|
|CMM0|109|Cmm_Ins0Isr|
|CMM1|110|Cmm_Ins1Isr|
|PWM0|111|Pwm_Generic0Isr|
|XSPI|112|Xspi_Isr|
|CANFD0|113|Can0_TimestampIsr|
||114|Can0_WakeupIsr|
||115|Can0_ErrorIsr|
||116|Can0_DataIsr|
|CANFD1|117|Can1_TimestampIsr|
||118|Can1_WakeupIsr|
||119|Can1_ErrorIsr|
||120|Can1_DataIsr|
|CANFD2|121|Can2_TimestampIsr|
||122|Can2_WakeupIsr|
||123|Can2_ErrorIsr|
||124|Can2_DataIsr|
|CANFD3|125|Can3_TimestampIsr|
||126|Can3_WakeupIsr|
||127|Can3_ErrorIsr|
||128|Can3_DataIsr|
|CANFD4|129|Can4_TimestampIsr|
||130|Can4_WakeupIsr|
||131|Can4_ErrorIsr|
||132|Can4_DataIsr|
|CANFD5|133|Can5_TimestampIsr|
||134|Can5_WakeupIsr|
||135|Can5_ErrorIsr|
||136|Can5_DataIsr|
|CANFD6|137|Can6_TimestampIsr|
||138|Can6_WakeupIsr|
||139|Can6_ErrorIsr|
||140|Can6_DataIsr|
|CANFD7|141|Can7_TimestampIsr|
||142|Can7_WakeupIsr|
||143|Can7_ErrorIsr|
||144|Can7_DataIsr|
|CANFD8|145|Can8_TimestampIsr|
||146|Can8_WakeupIsr|
||147|Can8_ErrorIsr|
||148|Can8_DataIsr|
|CANFD9|149|Can9_TimestampIsr|
||150|Can9_WakeupIsr|
||151|Can9_ErrorIsr|
||152|Can9_DataIsr|
|mcu eth|153|Gmac_TxCh0Isr|
||154|Gmac_TxCh1Isr|
||155|Gmac_TxCh2Isr|
||156|Gmac_TxCh3Isr|
||157|Gmac_TxCh4Isr|
||158|Gmac_TxCh5Isr|
||159|Gmac_RxCh0Isr|
||160|Gmac_RxCh1Isr|
||161|Gmac_RxCh2Isr|
||162|Gmac_RxCh3Isr|
||163|Gmac_RxCh4Isr|
||164|Gmac_RxCh5Isr|
||165|Gmac_SbdIsr|
||166|Gmac_PmtIsr|
||167|Gmac_LpiIsr|
|LIN0|168|Lin0_Isr|
|LIN1|169|Lin1_Isr|
|LIN2|170|Lin2_Isr|
|SPI0|171|Spi0_Isr|
|SPI1|172|Spi1_Isr|
|SPI2|173|Spi2_Isr|
|SPI3|174|Spi3_Isr|
|SPI4|175|Spi4_Isr|
|SPI5|176|Spi5_Isr|
|IPC|177|Ipc_Ch0Isr|
||178|Ipc_Ch1Isr|
||179|Ipc_Ch2Isr|
||180|Ipc_Ch3Isr|
||181|Ipc_Ch4Isr|
||182|Ipc_Ch5Isr|
||183|Ipc_Ch6Isr|
||184|Ipc_Ch7Isr|
||185|Ipc_Ch8Isr|
||186|Ipc_Ch9Isr|
||187|Ipc_Ch10Isr|
||188|Ipc_Ch11Isr|
||189|Ipc_Ch12Isr|
||190|Ipc_Ch13Isr|
||191|Ipc_Ch14Isr|
||192|Ipc_Ch15Isr|
||193|Ipc_Ch16Isr|
||194|Ipc_Ch17Isr|
||195|Ipc_Ch18Isr|
||196|Ipc_Ch19Isr|
||197|Ipc_Ch20Isr|
||198|Ipc_Ch21Isr|
||199|Ipc_Ch22Isr|
||200|Ipc_Ch23Isr|
||201|Ipc_Ch24Isr|
||202|Ipc_Ch25Isr|
||203|Ipc_Ch26Isr|
||204|Ipc_Ch27Isr|
||205|Ipc_Ch28Isr|
||206|Ipc_Ch29Isr|
||207|Ipc_Ch30Isr|
||208|Ipc_Ch31Isr|
|MDMA0|209|Mdma0_Ch0Isr|
||210|Mdma0_Ch1Isr|
|MDMA1|211|Mdma1_Ch0Isr|
||212|Mdma1_Ch1Isr|
|PDMA0|213|PDMA0_Ch0Isr|
||214|PDMA0_Ch1Isr|
||215|PDMA0_Ch2Isr|
||216|PDMA0_Ch3Isr|
||217|PDMA0_Ch4Isr|
||218|PDMA0_Ch5Isr|
|PMC0|219|Pmc0_Isr|
|PMC1|220|Pmc1_Isr|
|PPS(RTC)|221|Pps_IcuRtcIsr|
|PPS(TIME_SYNC0)|222|Pps_Icu0Isr|
|PPS(TIME_SYNC1)|223|Pps_Icu1Isr|
|PPS(TIME_SYNC2)|224|Pps_Icu2Isr|
|PPS_SYNC|225|Pps0_Isr|
||226|Pps1_Isr|
||227|Pps2_Isr|
||228|Pps3_Isr|
||229|Pps4_Isr|
|HSM_IPC0|230|Ipc_HsmIpc0Ch4Isr|
||231|Ipc_HsmIpc0Ch5Isr|
||232|Ipc_HsmIpc0Ch6Isr|
||233|Ipc_HsmIpc0Ch7Isr|
|Reserved|234||
||235||
||236||
||237||
||238||
||239||
||240||
|HSM_IPC1|241|Ipc_HsmIpc1Ch4Isr|
||242|Ipc_HsmIpc1Ch5Isr|
||243|Ipc_HsmIpc1Ch6Isr|
||244|Ipc_HsmIpc1Ch7Isr|
|CPU_MP4_CMM|245|Cmm_Ins13Isr|
|CPU_MP4_CLUSTER_PMU|246|Pmu_ReqDeny1Isr|
|CPU_MP4_CDB_PMU|247|Pmu_ReqDeny2Isr|
|CPU_MP2_CMM|248|Cmm_Ins14Isr|
|CPU_MP2_CLUSTER_PMU|249|Pmu_ReqDeny3Isr|
|CPU_MP2_CDB_PMU|250|Pmu_ReqDeny4Isr|
|CPU_IPC1_CH0|251|Ipc_CpuIpc1Ch0Isr|
|CPU_IPC1_CH1|252|Ipc_CpuIpc1Ch1Isr|
|CPU_IPC1_CH2|253|Ipc_CpuIpc1Ch2Isr|
|CPU_IPC0_CH0|254|Ipc_CpuIpc0Ch0Isr|
|CPU_IPC0_CH1|255|Ipc_CpuIpc0Ch1Isr|
|CPU_IPC0_CH2|256|Ipc_CpuIpc0Ch2Isr|
|CPU_IPC0_CH3|257|Ipc_CpuIpc0Ch3Isr|
|CPU_IPC0_CH4|258|Ipc_CpuIpc0Ch4Isr|
|CPU_IPC0_CH5|259|Ipc_CpuIpc0Ch5Isr|
|CPU_IPC0_CH6|260|Ipc_CpuIpc0Ch6Isr|
|CPU_IPC0_CH7|261|Ipc_CpuIpc0Ch7Isr|
|CPU_IPC0_CH8|262|Ipc_CpuIpc0Ch8Isr|
|CPU_IPC0_CH9|263|Ipc_CpuIpc0Ch9Isr|
|CPU_IPC0_CH10|264|Ipc_CpuIpc0Ch10Isr|
|CPU_IPC0_CH11|265|Ipc_CpuIpc0Ch11Isr|
|CPU_IPC0_CH12|266|Ipc_CpuIpc0Ch12Isr|
|CPU_IPC0_CH13|267|Ipc_CpuIpc0Ch13Isr|
|CPU_IPC0_CH14|268|Ipc_CpuIpc0Ch14Isr|
|CPU_IPC0_CH15|269|Ipc_CpuIpc0Ch15Isr|
|CPU_ROUTER_SWTRIG1_0|270|Router_Swtrig1Ch0Isr|
|CPU_ROUTER_SWTRIG1_1|271|Router_Swtrig1Ch1Isr|
|CPU_ROUTER_SWTRIG1_2|272|Router_Swtrig1Ch2Isr|
|CPU_ROUTER_SWTRIG1_3|273|Router_Swtrig1Ch3Isr|
|DDR0_CMM|291|Cmm_Ins2Isr|
|DDR1_CMM|294|Cmm_Ins3Isr|
|DDR2_CMM|297|Cmm_Ins4Isr|
|PERI_I2C0|300|Peri_I2C0Isr|
|PERI_I2C1|301|Peri_I2C1Isr|
|PERI_I2C2|302|Peri_I2C2Isr|
|PERI_I2C3|303|Peri_I2C3Isr|
|PERI_I2C4|304|Peri_I2C4Isr|
|PERI_I2C5|305|Peri_I2C5Isr|
|PERI_USB|306|Peri_UsbIsr|
|PERI_CMM|307|Cmm_Ins19Isr|
|CAM_ISP0_0|308|Cam_Isp0Ch0Isr|
|CAM_ISP0_1|309|Cam_Isp0Ch1Isr|
|CAM_ISP0_2|310|Cam_Isp0Ch2Isr|
|CAM_ISP0_3|311|Cam_Isp0Ch3Isr|
|CAM_CPE0_PYM|312|Cam_Cpe0PymIsr|
|CAM_CPE0_MIPI_RX_CSI|313|Cam_Cpe0MipiRxCsiIsr|
|CAM_CPE0_CIM|314|Cam_Cpe0CimIsr|
|CAM_CPE0_PYM_PRE_UV|315|Cam_Cpe0PymPreUvIsr|
|CAM_CPE0_PYM_PRE_Y|316|Cam_Cpe0PymPreYIsr|
|CAM_CPE0_CMM|317|Cmm_Ins8Isr|
|CAM_ISP1_0|318|Cam_Isp1Ch0Isr|
|CAM_ISP1_1|319|Cam_Isp1Ch1Isr|
|CAM_ISP1_2|320|Cam_Isp1Ch2Isr|
|CAM_ISP1_3|321|Cam_Isp1Ch3Isr|
|CAM_CPE1_YNR|322|Cam_Cpe1YnrIsr|
|CAM_CPE1_PYM|323|Cam_Cpe1PymIsr|
|CAM_CPE1_MIPI_RX_CSI|324|Cam_Cpe1MipiRxCsiIsr|
|CAM_CPE1_CIM|325|Cam_Cpe1CimIsr|
|CAM_CPE1_PYM_PRE_UV|326|Cam_Cpe1PymPreUvIsr|
|CAM_CPE1_PYM_PRE_Y|327|Cam_Cpe1PymPreYIsr|
|CAM_CPE1_CMM|328|Cmm_Ins7Isr|
|CAM_STITCH|329|Cam_StichIsr|
|CAM_CPE_LITE_MIPI_RX|330|Cam_CpeLiteMipiRxCsiIsr|
|CAM_GDC0|331|Cam_Gdc0Isr|
|CAM_CPE_LITE_PYM|332|Cam_CpeLitePymIsr|
|CAM_CPE_LITE_PYM_PRE_UV|333|Cam_CpeLitePymPreUvIsr|
|CAM_CPE_LITE_PYM_PRE_Y|334|Cam_CpeLitePymPreYIsr|
|CAM_CPE_LITE_CIM|335|Cam_CpeLiteCymIsr|
|CAM_CPE_LITE_CMM|336|Cmm_Ins6Isr|
|CAM_MIPI_TX1_DSI|337|Cam_MipiTx1DsiIsr|
|CAM_MIPI_TX1_CSI2|338|Cam_MipiTx1Csi2Isr|
|CAM_MIPI_TX0_DSI|339|Cam_MipiTx0DsiIsr|
|CAM_MIPI_TX0_CSI2|340|Cam_MipiTx0Csi2Isr|
|CAM_IDU0|341|Cam_Idu0Isr|
|CAM_IDU1|342|Cam_Idu1Isr|
|CAM_IDE_CMM|343|Cmm_Ins5Isr|
|CAM_GPIO|344|Cam_GpioIsr|
|CAM_TOP_CMM|345|Cmm_Ins9Isr|
|VIDEO_VPU|346|Vid_VpuIsr|
|VIDEO_JPU|347|Vid_JpuIsr|
|VIDEO_CMM|348|Cmm_Ins10Isr|
|VIDEO_GIPO|349|Vid_GpioIsr|
|VDSP_CMM|350|Cmm_Ins11Isr|
|VDSP_Q8_EARLY_REST|351|Vdsp_EarlyRestIsr|
|VDSP_Q8_REST|352|Vdsp_ResetIsr|
|HSIS_CMM|353|Cmm_Ins12Isr|
|BPU_VM0|354|Bpu_Vm0Isr|
|BPU_VM1|355|Bpu_Vm1Isr|
|BPU_HYP|356|Bpu_HypIsr|
|BPU_PVT|357|Pvt_BpuAlarmIsr|
|BPU_CMM|358|Cmm_Ins17Isr|
|GPU_CMM|359|Cmm_Ins18Isr|
|RTC|360|Rtc_Isr|
|AON_WAKEUP_GPIO|361|Aon_WakeUpGpioIsr|
|AON_GPIO|362|Aon_GpioIsr|
|AON_PMU_REQ_MOD|363|Aon_PmuReqModIsr|
|MEDIA_BOT_CMM|364|Cmm_Ins15Isr|
|MEDIA_TOP_CMM|366|Cmm_Ins16Isr|
|CMN_CMM|368|Cmm_Ins20Isr|
|CMN_PVTC|369|Pvt_CmnAlarmIsr|
|CMN_PPU_PMU|370|Pmu_Ppu0Isr|
</DocScope>
<DocScope products="RDK S600">
| Module | Interrupt Number | Name |
|--------|----------------------------------------|---------------------------------------------|
|SGI|0~15||
|PPI|16~31||
|MCU_STCU|32|Bist_Stcu0Isr|
|PERI_STCU|33|Bist_Stcu1Isr|
|VIDEO_STCU|34|Bist_Stcu2Isr|
|VDSP0_STCU|35|Bist_Stcu3Isr|
|VDSP1_STCU|36|Bist_Stcu4Isr|
|HSIS_STCU|37|Bist_Stcu5Isr|
|GPU_STCU|38|Bist_Stcu6Isr|
|DDR0_STCU|39|Bist_Stcu7Isr|
|DDR1_STCU|40|Bist_Stcu8Isr|
|DDR2_STCU|41|Bist_Stcu9Isr|
|DDR3_STCU|42|Bist_Stcu10Isr|
|MP4_0_STCU|43|Bist_Stcu11Isr|
|MP4_1_STCU|44|Bist_Stcu12Isr|
|MP4_2_STCU|45|Bist_Stcu13Isr|
|MP4_3_STCU|46|Bist_Stcu14Isr|
|MP2_4_STCU|47|Bist_Stcu15Isr|
|CAM_STCU|48|Bist_Stcu16Isr|
|BPU0_STCU|49|Bist_Stcu17Isr|
|BPU1_STCU|50|Bist_Stcu18Isr|
|BPU2_STCU|51|Bist_Stcu19Isr|
|BPU3_STCU|52|Bist_Stcu20Isr|
|SRAM0_STCU|53|Bist_Stcu21Isr|
|SRAM1_STCU|54|Bist_Stcu22Isr|
|SRAM2_STCU|55|Bist_Stcu23Isr|
|SRAM3_STCU|56|Bist_Stcu24Isr|
|RESERVED|57||
|RESERVED|58||
|RESERVED|59||
|UART0|60|Uart0_Isr|
|UART1|61|Uart1_Isr|
|UART2|62|Uart2_Isr|
|UART3|63|Uart3_Isr|
|ADC0|64|Adc0_Ch0WdIsr|
||65|Adc0_Ch1WdIsr|
||66|Adc0_Ch2WdIsr|
||67|Adc0_Ch3WdIsr|
||68|Adc0_Ch4WdIsr|
||69|Adc0_Ch5WdIsr|
||70|Adc0_Ch6WdIsr|
||71|Adc0_Ch7WdIsr|
||72|Adc0_InjIsr|
||73|Adc0_NorIsr|
|ADC1|74|Adc1_Ch0WdIsr|
||75|Adc1_Ch1WdIsr|
||76|Adc1_Ch2WdIsr|
||77|Adc1_Ch3WdIsr|
||78|Adc1_Ch4WdIsr|
||79|Adc1_Ch5WdIsr|
||80|Adc1_Ch6WdIsr|
||81|Adc1_Ch7WdIsr|
||82|Adc1_InjIsr|
||83|Adc1_NorIsr|
|I2C0|84|I2c0_Isr|
|I2C1|85|I2c1_Isr|
|I2C2|86|I2c2_Isr|
|I2C3|87|I2c3_Isr|
|I2C4|88|I2c4_Isr|
|GPIO0|89|Gpio_Icu0ExtIsr|
|GPIO1|90|Gpio_Icu1ExtIsr|
|GPIO2|91|Gpio_Icu2ExtIsr|
|GPIO3|92|Gpio_Icu3ExtIsr|
|WWDT0|93|Wdg_Ins0RstIsr|
||94|Wdg_Ins0IntIsr|
|WWDT1|95|Wdg_Ins1RstIsr|
||96|Wdg_Ins1IntIsr|
|WWDT2|97|Wdg_Ins2RstIsr|
||98|Wdg_Ins2IntIsr|
|WWDT3|99|Wdg_Ins3RstIsr|
||100|Wdg_Ins3IntIsr|
|WWDT4|101|Wdg_Ins4RstIsr|
||102|Wdg_Ins4IntIsr|
|OTF_CRC0|103|Otf_Isr|
|CRC0|104|Crc_Isr|
|GPT0|105|Gpt_Ins0Ch0Is|
||106|Gpt_Ins0Ch1Isr|
||107|Gpt_Ins0Ch2Isr|
||108|Gpt_Ins0Ch3Isr|
|GPT1|109|Gpt_Ins1Ch0Isr|
||110|Gpt_Ins1Ch1Isr|
||111|Gpt_Ins1Ch2Isr|
||112|Gpt_Ins1Ch3Isr|
|GPT2|113|Gpt_Ins2Ch0Isr|
||114|Gpt_Ins2Ch1Isr|
||115|Gpt_Ins2Ch2Isr|
||116|Gpt_Ins2Ch3Isr|
|GPT3|117|Gpt_Ins3Ch0Isr|
||118|Gpt_Ins3Ch1Isr|
||119|Gpt_Ins3Ch2Isr|
||120|Gpt_Ins3Ch3Isr|
|GPT4|121|Gpt_Ins4Ch0Isr|
||122|Gpt_Ins4Ch1Isr|
||123|Gpt_Ins4Ch2Isr|
||124|Gpt_Ins4Ch3Isr|
|GPT5|125|Gpt_Ins5Ch0Isr|
||126|Gpt_Ins5Ch1Isr
||127|Gpt_Ins5Ch2Isr|
||128|Gpt_Ins5Ch3Isr|
|GPT6|129|Gpt_Ins6Ch0Isr|
||130|Gpt_Ins6Ch1Isr|
||131|Gpt_Ins6Ch2Isr|
||132|Gpt_Ins6Ch3Isr|
|GPT7|133|Gpt_Ins7Ch0Isr|
||134|Gpt_Ins7Ch1Isr|
||135|Gpt_Ins7Ch2Isr|
||136|Gpt_Ins7Ch3Isr|
|GPT8|137|Gpt_Ins8Ch0Isr|
||138|Gpt_Ins8Ch1Isr|
||139|Gpt_Ins8Ch2Isr|
||140|Gpt_Ins8Ch3Isr|
|GPT9|141|Gpt_Ins9Ch0Isr|
||142|Gpt_Ins9Ch1Isr|
||143|Gpt_Ins9Ch2Isr|
||144|Gpt_Ins9Ch3Isr|
|PMU|145|Pmu_ReqDeny0Isr|
|BIFSPI|146|Bif_SpiIsr|
|PVT|147|Pvt_McuAlarmIsr|
|L1FCHM(RFCHM)|148|Fchm_MissionIntIsr|
||149|Fchm_NcfIntIsr|
||150|Fchm_CfIntIsr|
|CMM0|151|Cmm_Ins0Isr|
|CMM1|152|Cmm_Ins1Isr|
|CMM2|153|Cmm_Ins2Isr|
|PWM0|154|Pwm_Generic0Isr|
|PWM1|155|Pwm_Generic1Isr|
|PWM2|156|Pwm_Generic2Isr|
|XSPI|157|Xspi_Isr|
|CAN0|158|Can0_TimestampIsr|
||159|Can0_WakeupIsr|
||160|Can0_ErrorIsr|
||161|Can0_DataIsr|
|CAN1|162|Can1_TimestampIsr|
||163|Can1_WakeupIsr|
||164|Can1_ErrorIsr|
||165|Can1_DataIsr|
|CAN2|166|Can2_TimestampIsr|
||167|Can2_WakeupIsr|
||168|Can2_ErrorIsr|
||169|Can2_DataIsr|
|CAN3|170|Can3_TimestampIsr|
||171|Can3_WakeupIsr|
||172|Can3_ErrorIsr|
||173|Can3_DataIsr|
|CAN4|174|Can4_TimestampIsr|
||175|Can4_WakeupIsr|
||176|Can4_ErrorIsr|
||177|Can4_DataIsr|
|CAN5|178|Can5_TimestampIsr|
||179|Can5_WakeupIsr|
||180|Can5_ErrorIsr|
||181|Can5_DataIsr|
|CAN6|182|Can6_TimestampIsr|
||183|Can6_WakeupIsr|
||184|Can6_ErrorIsr|
||185|Can6_DataIsr|
|CAN7|186|Can7_TimestampIsr|
||187|Can7_WakeupIsr|
||188|Can7_ErrorIsr|
||189|Can7_DataIsr|
|CAN8|190|Can8_TimestampIsr|
||191|Can8_WakeupIsr|
||192|Can8_ErrorIsr|
||193|Can8_DataIsr|
|CAN9|194|Can9_TimestampIsr|
||195|Can9_WakeupIsr|
||196|Can9_ErrorIsr|
||197|Can9_DataIsr|
|CAN10|198|Can10_TimestampIsr|
||199|Can10_WakeupIsr|
||200|Can10_ErrorIsr|
||201|Can10_DataIsr|
|CAN11|202|Can11_TimestampIsr|
||203|Can11_WakeupIsr|
||204|Can11_ErrorIsr|
||205|Can11_DataIsr|
|CAN12|206|Can12_TimestampIsr|
||207|Can12_WakeupIsr|
||208|Can12_ErrorIsr|
||209|Can12_DataIsr|
|CAN13|210|Can13_TimestampIsr|
||211|Can13_WakeupIsr|
||212|Can13_ErrorIsr|
||213|Can13_DataIsr|
|CAN14|214|Can14_TimestampIsr|
||215|Can14_WakeupIsr|
||216|Can14_ErrorIsr|
||217|Can14_DataIsr|
|CAN15|218|Can15_TimestampIsr|
||219|Can15_WakeupIsr|
||220|Can15_ErrorIsr|
||221|Can15_DataIsr|
|MCU ETH|222|Gmac_TxCh0Isr|
||223|Gmac_TxCh1Isr|
||224|Gmac_TxCh2Isr|
||225|Gmac_TxCh3Isr|
||226|Gmac_TxCh4Isr|
||227|Gmac_TxCh5Isr|
||228|Gmac_TxCh6Isr|
||229|Gmac_TxCh7Isr|
||230|Gmac_RxCh0Isr|
||231|Gmac_RxCh1Isr|
||232|Gmac_RxCh2Isr|
||233|Gmac_RxCh3Isr|
||234|Gmac_RxCh4Isr|
||235|Gmac_RxCh5Isr|
||236|Gmac_RxCh6Isr|
||237|Gmac_RxCh7Isr|
||238|Gmac_SbdIsr|
||239|Gmac_PmtIsr|
||240|Gmac_LpiIsr|
|LIN0|241|Lin0_Isr|
|LIN1|242|Lin1_Isr|
|LIN2|243|Lin2_Isr|
|LIN3|244|Lin3_Isr|
|LIN4|245|Lin4_Isr|
|LIN5|246|Lin5_Isr|
|LIN6|247|Lin6_Isr|
|LIN7|248|Lin7_Isr|
|SPI0|249|Spi0_Isr|
|SPI1|250|Spi1_Isr|
|SPI2|251|Spi2_Isr|
|SPI3|252|Spi3_Isr|
|SPI4|253|Spi4_Isr|
|SPI5|254|Spi5_Isr|
|SPI6|255|Spi6_Isr|
|SPI7|256|Spi7_Isr|
|SPI8|257|Spi8_Isr|
|SPI9|258|Spi9_Isr|
|IPC0|259|Ipc0_Ch0Isr|
||260|Ipc0_Ch1Isr|
||261|Ipc0_Ch2Isr|
||262|Ipc0_Ch3Isr|
||263|Ipc0_Ch4Isr|
||264|Ipc0_Ch5Isr|
||265|Ipc0_Ch6Isr|
||266|Ipc0_Ch7Isr|
||267|Ipc0_Ch8Isr|
||268|Ipc0_Ch9Isr|
||269|Ipc0_Ch10Isr|
||270|Ipc0_Ch11Isr|
||271|Ipc0_Ch12Isr|
||272|Ipc0_Ch13Isr|
||273|Ipc0_Ch14Isr|
||274|Ipc0_Ch15Isr|
||275|Ipc0_Ch16Isr|
||276|Ipc0_Ch17Isr|
||277|Ipc0_Ch18Isr|
||278|Ipc0_Ch19Isr|
||279|Ipc0_Ch20Isr|
||280|Ipc0_Ch21Isr|
||281|Ipc0_Ch22Isr|
||282|Ipc0_Ch23Isr|
|IPC1|283|Ipc1_Ch0Isr|
||284|Ipc1_Ch1Isr|
||285|Ipc1_Ch2Isr|
||286|Ipc1_Ch3Isr|
||287|Ipc1_Ch4Isr|
||288|Ipc1_Ch5Isr|
||289|Ipc1_Ch6Isr|
||290|Ipc1_Ch7Isr|
||291|Ipc1_Ch8Isr|
||292|Ipc1_Ch9Isr|
||293|Ipc1_Ch10Isr|
||294|Ipc1_Ch11Isr|
||295|Ipc1_Ch12Isr|
||296|Ipc1_Ch13Isr|
||297|Ipc1_Ch14Isr|
||298|Ipc1_Ch15Isr|
|IPC2|299|Ipc2_Ch0Isr|
||300|Ipc2_Ch1Isr|
||301|Ipc2_Ch2Isr|
||302|Ipc2_Ch3Isr|
||303|Ipc2_Ch4Isr|
||304|Ipc2_Ch5Isr|
||305|Ipc2_Ch6Isr|
||306|Ipc2_Ch7Isr|
||307|Ipc2_Ch8Isr|
||308|Ipc2_Ch9Isr|
||309|Ipc2_Ch10Isr|
||310|Ipc2_Ch11Isr|
||311|Ipc2_Ch12Isr|
||312|Ipc2_Ch13Isr|
||313|Ipc2_Ch14Isr|
||314|Ipc2_Ch15Isr|
|MDMA0|315|Mdma0_CmnIsr|
||316|Mdma0_Ch0Isr|
||317|Mdma0_Ch1Isr|
|MDMA1|318|Mdma1_CmnIsr|
||319|Mdma1_Ch0Isr|
||320|Mdma1_Ch1Isr|
||321|Mdma1_Ch2Isr|
||322|Mdma1_Ch3Isr|
|MDMA2|323|Mdma2_CmnIsr|
||324|Mdma2_Ch0Isr|
||325|Mdma2_Ch1Isr|
||326|Mdma2_Ch2Isr|
||327|Mdma2_Ch3Isr|
|PDMA0|328|Pdma0_Ch0Isr|
||329|Pdma0_Ch1Isr|
||330|Pdma0_Ch2Isr|
||331|Pdma0_Ch3Isr|
||332|Pdma0_Ch4Isr|
||333|Pdma0_Ch5Isr|
|PMC0|334|Pmc0_Isr|
|PMC1|335|Pmc1_Isr|
|PMC2|336|Pmc2_Isr|
|GM_TRANS|337|Gm_TransIsr|
|AON_RTC_TRIGGER|338|Aon_RtcTrigIsr|
|PPS_IN0|340|Pps_Icu0Isr|
|PPS_IN1|341|Pps_Icu1Isr|
|PPS_IN2|342|Pps_Icu2Isr|
|PCIE_ETH|344|Pcie_EthPps0Isr|
||345|Pcie_EthPps1Isr|
||346|Pcie_EthPps2Isr|
||347|Pcie_EthPps3Isr|
|INT_ROUTER_SEL289|348||
|INT_ROUTER_SEL290|349||
|INT_ROUTER_SEL291|350||
|INT_ROUTER_SEL292|351||
|INT_ROUTER_SEL293|352||
|INT_ROUTER_SEL294|353||
|HSM_IPC2|354|Ipc_HsmIpc2Ch4Isr|
||355|Ipc_HsmIpc2Ch5Isr|
||356|Ipc_HsmIpc2Ch6Isr|
||357|Ipc_HsmIpc2Ch7Isr|
|HSM_IPC1|358|Ipc_HsmIpc1Ch4Isr|
||359|Ipc_HsmIpc1Ch5Isr|
||360|Ipc_HsmIpc1Ch6Isr|
||361|Ipc_HsmIpc1Ch7Isr|
|HSM_IPC0|362|Ipc_HsmIpc0Ch4Isr|
||363|Ipc_HsmIpc0Ch5Isr|
||364|Ipc_HsmIpc0Ch6Isr|
||365|Ipc_HsmIpc0Ch7Isr|
|HSM_IPC3|366|Ipc_HsmIpc3Ch4Isr|
||367|Ipc_HsmIpc3Ch5Isr|
||368|Ipc_HsmIpc3Ch6Isr|
||369|Ipc_HsmIpc3Ch7Isr|
|AON|370|Aon_PerimIsr|
||371|Aon_GpioIsr|
||372|Aon_WakeGpioIsr|
||373|Aon_RtcIsr|
|BPU|374|Bpu0_Vm0Isr|
||375|Bpu0_Vm1Isr|
||376|Bpu0_HypIsr|
||377|Bpu0_PvtRepIsr|
||378|Bpu0_ClkMonIsr|
||379|Bpu0_PvtcIsr|
||380|Bpu1_Vm0Isr|
||381|Bpu1_Vm1Isr|
||382|Bpu1_HypIsr|
||383|Bpu1_PvtRepIsr|
||384|Bpu1_ClkMonIsr|
||385|Bpu1_PvtcIsr|
||386|Bpu2_Vm0Isr|
||387|Bpu2_Vm1Isr|
||388|Bpu2_HypIsr|
||389|Bpu2_PvtRepIsr|
||390|Bpu2_ClkMonIsr|
||391|Bpu2_PvtcIsr|
||392|Bpu3_Vm0Isr|
||393|Bpu3_Vm1Isr|
||394|Bpu3_HypIsr|
||395|Bpu3_PvtRepIsr|
||396|Bpu3_ClkMonIsr|
||397|Bpu3_PvtcIsr|
||398|Cam_Cpe0CmmIsr|
||399|Cam_Cpe1CmmIsr|
||400|Cam_Cpe2CmmIsr|
||401|Cam_Cpe3CmmIsr|
||402|Cam_CpeLiteCmmIsr|
||403|Cam_IdeCmmIsr|
||404|Cam_TopCmmIsr|
|CPU_IPC2_CH0|405|Ipc_CpuIpc2Ch0Isr|
|CPU_IPC2_CH1|406|Ipc_CpuIpc2Ch1Isr|
|CPU_IPC2_CH2|407|Ipc_CpuIpc2Ch2Isr|
|CPU_IPC2_CH3|408|Ipc_CpuIpc2Ch3Isr|
|CPU_IPC2_CH4|409|Ipc_CpuIpc2Ch4Isr|
|CPU_IPC2_CH5|410|Ipc_CpuIpc2Ch5Isr|
|CPU_IPC2_CH6|411|Ipc_CpuIpc2Ch6Isr|
|CPU_IPC2_CH7|412|Ipc_CpuIpc2Ch7Isr|
|CPU_IPC3_CH0|413|Ipc_CpuIpc3Ch0Isr|
|CPU_IPC3_CH1|414|Ipc_CpuIpc3Ch1Isr|
|CPU_IPC3_CH2|415|Ipc_CpuIpc3Ch2Isr|
|CPU_IPC3_CH3|416|Ipc_CpuIpc3Ch3Isr|
|CPU_IPC3_CH4|417|Ipc_CpuIpc3Ch4Isr|
|CPU_IPC3_CH5|418|Ipc_CpuIpc3Ch5Isr|
|CPU_IPC3_CH6|419|Ipc_CpuIpc3Ch6Isr|
|CPU_IPC3_CH7|420|Ipc_CpuIpc3Ch7Isr|
|CPU_IPC4_CH0|421|Ipc_CpuIpc4Ch0Isr|
|CPU_IPC4_CH1|422|Ipc_CpuIpc4Ch1Isr|
|CPU_IPC4_CH2|423|Ipc_CpuIpc4Ch2Isr|
|CPU_IPC4_CH3|424|Ipc_CpuIpc4Ch3Isr|
|CPU_IPC5_CH0|425|Ipc_CpuIpc5Ch0Isr|
|CPU_IPC5_CH1|426|Ipc_CpuIpc5Ch1Isr|
|CPU_IPC5_CH2|427|Ipc_CpuIpc5Ch2Isr|
|CPU_IPC5_CH3|428|Ipc_CpuIpc5Ch3Isr|
|CPU_IPC6_CH0|429|Ipc_CpuIpc6Ch0Isr|
|CPU_IPC6_CH1|430|Ipc_CpuIpc6Ch1Isr|
|CPU_IPC6_CH2|431|Ipc_CpuIpc6Ch2Isr|
|CPU_IPC6_CH3|432|Ipc_CpuIpc6Ch3Isr|
|CPU_IPC7_CH0|433|Ipc_CpuIpc7Ch0Isr|
|CPU_IPC7_CH1|434|Ipc_CpuIpc7Ch1Isr|
|CPU_IPC7_CH2|435|Ipc_CpuIpc7Ch2Isr|
|CPU_IPC7_CH3|436|Ipc_CpuIpc7Ch3Isr|
||437|CpuMp2_CmmTopIsr|
||438|CpuMp2_Power0Isr|
||439|CpuMp2_Power1Isr|
||440|CpuMp2_CmmIsr|
||441|CpuMp4_0_CmmTopIsr|
||442|CpuMp4_0_Power0Isr|
||443|CpuMp4_0_Power1Isr|
||444|CpuMp4_0_CmmIsr|
||445|CpuMp4_1_CmmTopIsr|
||446|CpuMp4_1_Power0Isr|
||447|CpuMp4_1_Power1Isr|
||448|CpuMp4_1_CmmIsr|
||449|CpuMp4_2_CmmTopIsr|
||450|CpuMp4_2_Power0Isr|
||451|CpuMp4_2_Power1Isr|
||452|CpuMp4_2_CmmIsr|
||453|CpuMp4_3_CmmTopIsr|
||454|CpuMp4_3_Power0Isr|
||455|CpuMp4_3_Power1Isr|
||456|CpuMp4_3_CmmIsr|
||457|Gpu_CmmTopIsr|
||458|Hsi_Cmm1Isr|
||459|Hsi_Cmm0Isr|
||460|l20_SramIsr|
||461|l21_SramIsr|
||462|l22_SramIsr|
||463|l23_SramIsr|
||464|MediaBot_CmmIsr|
||465|MediaBot_Ddr2CmmIsr|
||466|MediaBot_Ddr3CmmIsr|
||467|MediaBot_DdrWrap1MainCmmIsr|
||468|MediaBot_DdrWrap1CmmIsr|
||469|MediaBot_DdrWrap1PvtIsr|
||470|MediaBot_Ddr6CmmIsr|
||471|MediaBot_Ddr7CmmIsr|
||472|MediaBot_DdrWrap3MainCmmIsr|
||473|MediaBot_DdrWrap3CmmIsr|
||474|MediaBot_DdrWrap3PvtIsr|
||475|MediaBot_Ddr0CmmIsr|
||476|MediaBot_Ddr1CmmIsr|
||477|MediaBot_DdrWrap0MainCmmIsr|
||478|MediaBot_DdrWrap0CmmIsr|
||479|MediaBot_DdrWrap0PvtIsr|
||480|MediaBot_Ddr4CmmIsr|
||481|MediaBot_Ddr5CmmIsr|
||482|MediaBot_DdrWrap2MainCmmIsr|
||483|MediaBot_DdrWrap2CmmIsr|
||484|MediaBot_DdrWrap2PvtIsr|
||485|MediaTop_CmmIsr|
||486|MediaTop_Cmn0Isr|
||487|MediaTop_Cmn1Isr|
||488|MediaTop_Cmn2Isr|
||489|MediaTop_Cmn3Isr|
||490|MediaTop_Cmn4Isr|
||491|MediaTop_Cmn5Isr|
||492|MediaTop_Cmn6Isr|
||493|MediaTop_Cmn7Isr|
||494|MediaTop_Cmn8Isr|
||495|MediaTop_Cmn9Isr|
||496|MediaTop_Cmn10Isr|
||497|MediaTop_Cmn11Isr|
||498|MediaTop_Cmn12Isr|
||499|MediaTop_Cmn13Isr|
||500|MediaTop_Cmn14Isr|
||501|MediaTop_Cmn15Isr|
||502|Peri_UsbIsr|
||503|Peri_Cmm0Isr|
||504|Vdsp0_CmmTopIsr|
||505|Vdsp1_CmmTopIsr|
||506|Video_Wrap0Isr|
||507|Video_Wrap1Isr|
||508|Video_Wrap2Isr|
||509|Video_Jpu0|
||510|Video_Jpu1|
||511|Video_Jpu2|
||512|Video_CmmIsr|
||513|Rec_Irq139|
||514|Rec_Irq140|
||515|Rec_Irq141|
||516|Rec_Irq142|
||517|Rec_Irq143|
||518|Rec_Irq144|
||519|Rec_Irq145|
||520|Rec_Irq146|
||521|Rec_Irq147|
||522|Rec_Irq148|
||523|Rec_Irq149|
</DocScope>

## MCU Interrupt Usage
Since MCU0 and MCU1 are in the same hardware domain, when an interrupt occurs, both MCU0 and MCU1 can receive the same interrupt. Therefore, to ensure the normal operation of the MCU system, the same interrupt can only be enabled by either MCU0 or MCU1. However, because MCU0 is not open-source, it is necessary to summarize the interrupts used by MCU0 to avoid conflicts during the development of MCU1 customers.

Currently, MCU0 has used the following interrupts:
<DocScope products="RDK S100">
| Module | Interrupt Number | Name |
|--------|----------------------------------------|---------------------------------------------|
|GPIO0|68|Gpio_Icu0ExtIsr|
|GPIO1|69|Gpio_Icu1ExtIsr|
|GPIO2|70|Gpio_Icu2ExtIsr|
|WWDT0|71|Wdg_Ins0RstIsr|
|WWDT0|72|Wdg_Ins0IntIsr|
|WWDT1|73|Wdg_Ins1RstIsr|
|WWDT1|74|Wdg_Ins1IntIsr|
|WWDT2|75|Wdg_Ins2RstIsr|
|WWDT2|76|Wdg_Ins2IntIsr|
|GPT0|81|Gpt_Ins0Ch2Isr|
|GPT1|83|Gpt_Ins1Ch0Isr|
|GPT1|84|Gpt_Ins1Ch1Isr|
|L1FCHM|106|Fchm_MissionIntIsr|
||107|Fchm_NcfIntIsr|
||108|Fchm_CfIntIsr|
|PWM0|111|Pwm_Generic0Isr|
|MDMA1|211|Mdma1_Ch0Isr|
|PDMA0|213|PDMA0_Ch0Isr|
|PPS(RTC)|221|Pps_IcuRtcIsr|
|HSM_IPC1|241|Ipc_HsmIpc1Ch4Isr|
|HSM_IPC1|242|Ipc_HsmIpc1Ch5Isr|
|CPU_IPC1_CH0|251|Ipc_CpuIpc1Ch0Isr|
|CPU_IPC1_CH1|252|Ipc_CpuIpc1Ch1Isr|
|CPU_IPC1_CH2|253|Ipc_CpuIpc1Ch2Isr|
|CPU_IPC0_CH8|262|Ipc_CpuIpc0Ch8Isr|
|CPU_IPC0_CH9|263|Ipc_CpuIpc0Ch9Isr|
|CPU_IPC0_CH10|264|Ipc_CpuIpc0Ch10Isr|
|CPU_IPC0_CH11|265|Ipc_CpuIpc0Ch11Isr|
|CPU_IPC0_CH12|266|Ipc_CpuIpc0Ch12Isr|
|CPU_IPC0_CH13|267|Ipc_CpuIpc0Ch13Isr|
|CPU_IPC0_CH14|268|Ipc_CpuIpc0Ch14Isr|
|CPU_IPC0_CH15|269|Ipc_CpuIpc0Ch15Isr|
|CPU_ROUTER_SWTRIG1_0|270|Router_Swtrig1Ch0Isr|
|CPU_ROUTER_SWTRIG1_1|271|Router_Swtrig1Ch1Isr|
|CPU_ROUTER_SWTRIG1_2|272|Router_Swtrig1Ch2Isr|
|CPU_ROUTER_SWTRIG1_3|273|Router_Swtrig1Ch3Isr|
|RTC|360|Rtc_Isr|
</DocScope>
<DocScope products="RDK S600">
| Module | Interrupt Number | Name |
|--------|----------------------------------------|---------------------------------------------|
|HSM_IPC3|366|Ipc_HsmIpc3Ch4Isr|
|HSM_IPC3|367|Ipc_HsmIpc3Ch5Isr|
|CPU_IPC2_CH0|405|Ipc_CpuIpc2Ch0Isr|
|CPU_IPC2_CH1|406|Ipc_CpuIpc2Ch1Isr|
|CPU_IPC2_CH2|407|Ipc_CpuIpc2Ch2Isr|
|CPU_IPC2_CH3|408|Ipc_CpuIpc2Ch3Isr|
|CPU_IPC2_CH4|409|Ipc_CpuIpc2Ch4Isr|
|CPU_IPC2_CH5|410|Ipc_CpuIpc2Ch5Isr|
|CPU_IPC2_CH6|411|Ipc_CpuIpc2Ch6Isr|
|CPU_IPC2_CH7|412|Ipc_CpuIpc2Ch7Isr|
|CPU_IPC3_CH0|413|Ipc_CpuIpc3Ch0Isr|
|CPU_IPC3_CH1|414|Ipc_CpuIpc3Ch1Isr|
|CPU_IPC3_CH2|415|Ipc_CpuIpc3Ch2Isr|
|CPU_IPC3_CH3|416|Ipc_CpuIpc3Ch3Isr|
|CPU_IPC3_CH4|417|Ipc_CpuIpc3Ch4Isr|
|CPU_IPC3_CH5|418|Ipc_CpuIpc3Ch5Isr|
|CPU_IPC3_CH6|419|Ipc_CpuIpc3Ch6Isr|
|CPU_IPC3_CH7|420|Ipc_CpuIpc3Ch7Isr|
|CPU_IPC4_CH0|421|Ipc_CpuIpc4Ch0Isr|
|CPU_IPC4_CH1|422|Ipc_CpuIpc4Ch1Isr|
|CPU_IPC4_CH2|423|Ipc_CpuIpc4Ch2Isr|
|CPU_IPC4_CH3|424|Ipc_CpuIpc4Ch3Isr|
|CPU_IPC5_CH0|425|Ipc_CpuIpc5Ch0Isr|
|CPU_IPC5_CH1|426|Ipc_CpuIpc5Ch1Isr|
|CPU_IPC5_CH2|427|Ipc_CpuIpc5Ch2Isr|
|CPU_IPC5_CH3|428|Ipc_CpuIpc5Ch3Isr|
|MDMA0_CH0|316|Mdma0_Ch0Isr|
|MDMA0_CH1|317|Mdma0_Ch1Isr|
|MDMA1_CH0|319|Mdma1_Ch0Isr|
|MDMA1_CH1|320|Mdma1_Ch1Isr|
|MDMA1_CH2|321|Mdma1_Ch2Isr|
|MDMA1_CH3|322|Mdma1_Ch3Isr|
|MDMA2_CH1|325|Mdma2_Ch1Isr|
|MDMA2_CH2|326|Mdma2_Ch2Isr|
|IPC0_CH1|260|Ipc0_Ch1Isr|
|IPC0_CH2|261|Ipc0_Ch2Isr|
|IPC0_CH3|262|Ipc0_Ch3Isr|
|IPC0_CH5|264|Ipc0_Ch5Isr|
|IPC0_CH6|265|Ipc0_Ch6Isr|
|IPC0_CH8|267|Ipc0_Ch8Isr|
|IPC0_CH9|268|Ipc0_Ch9Isr|
|IPC0_CH10|269|Ipc0_Ch10Isr|
|IPC0_CH11|270|Ipc0_Ch11Isr|
|IPC1_CH0|283|Ipc1_Ch0Isr|
|IPC1_CH1|284|Ipc1_Ch1Isr|
|IPC1_CH3|286|Ipc1_Ch3Isr|
|IPC1_CH4|287|Ipc1_Ch4Isr|
|IPC1_CH5|288|Ipc1_Ch5Isr|
|IPC1_CH6|289|Ipc1_Ch6Isr|
|IPC1_CH7|290|Ipc1_Ch7Isr|
|IPC2_CH0|299|Ipc2_Ch0Isr|
|IPC2_CH1|300|Ipc2_Ch1Isr|
|IPC2_CH2|301|Ipc2_Ch2Isr|
|IPC2_CH3|302|Ipc2_Ch3Isr|
|IPC2_CH4|303|Ipc2_Ch4Isr|
|IPC2_CH5|304|Ipc2_Ch5Isr|
|IPC2_CH6|305|Ipc2_Ch6Isr|
|IPC2_CH7|306|Ipc2_Ch7Isr|
</DocScope>

## Tutorial on Adding Compilation Directories
### Brief Introduction to Scons
Currently, the RDK-S100 mcu only supports the compilation of s100_sip_B, and uses the scons compilation method instead of Makefile.
Scons is similar to Makefile. Each folder uses a Sconscript compilation file (similar to Makefile), and a top-level SConstruct file controls the overall compilation.
For example, the image for MCU1 is controlled by SConstruct_Lite_FRtos_S100_sip_B.
### Process for Adding Compilation Directories
<DocScope products="RDK S100">
1. Modify the mcu/Build/FreeRtos_mcu1/SConstruct_Lite_FRtos_S100_sip_B file to add/remove corresponding modules.

   For example, to add the mcu/Service/Log folder, simply add it at the appropriate location. The variable False indicates that during the build process, source files will not be copied to the compilation output directory.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/FreeRTOS_development/scons_add_context.png" alt="" style={{ width: '100%' }} />

2. Add the SConscript file under the added compilation module. The SConscript file can be obtained from any already compiled module folder.

</DocScope>
<DocScope products="RDK S600">
1. Modify the mcu/Build/FreeRtos_mcu1/build_config/S600/lite-matrix-B-mcu1.yaml file to add/remove corresponding modules.

   For example, to add the mcu/Service/Log folder, simply add it at the appropriate location. Currently, Service/Platform/McalCdd/Common has an independent path, and adding this directory should be placed in the corresponding location. For any other folders, add them directly under BuildPath.

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/03_FreeRTOS_development/scons_add_context.jpg" alt="" style={{ width: '100%' }} />

2. Add the SConscript file under the added compilation module. The SConscript file can be obtained from any already compiled module folder.
</DocScope>

## Introduction to the MCU FreeRtos System
The MCU has several key system functions, as shown in the figure below:
<DocScope products="RDK S100">
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/FreeRTOS_development/freertos_system-en.jpg" alt="" style={{ width: '100%' }} />
</DocScope>
<DocScope products="RDK S600">
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/03_FreeRTOS_development/FreeRTOS_TaskInfo.png" alt="" style={{ width: '100%' }} />
</DocScope>

The figure above shows the relative priority of each function's tasks and the order of calls within the same task. When integrating, customers should maintain the relative priority of each function, the core they reside on, and the order of calls within the same task. The description and precautions for each function are as follows:

### Power
ScmiProcess: Placed in a high-priority task, recommended to be placed in a 2ms task. If not feasible, the maximum scheduling period should not exceed 100ms. Placing it in a task with a long scheduling period will affect startup time. Generally, the impact can be estimated using the formula: "number of scmi communications during startup × task period."

SysPower_State_Loop/SysPower_State_MainFunction: Placed in a low-priority task.

### Boot
AcoreBootProc: Placed in a low-priority task. This includes the initialization required for Acore startup. Among these is the initialization of the Housekeeping key function, Housekeeping_WriteMagicNum. If this function is not properly initialized, Acore's access to MCU registers may cause Acore exceptions.

Integration Note: Must be placed on MCU0 for processing. AcoreBoot uses flash, so flash conflict issues must be avoided. Place it in the same low-priority task as the OTA function mentioned below.

### OTA
OtaFlash_MainFunction: Placed in a low-priority task, handling OTA-related logic.

Integration Note: Must be placed on MCU0 for processing. The OTA function uses flash, IPC, and crypto functions. Flash concurrent operation conflicts must be avoided. It is recommended to place all flash-related functions in a single low-priority task for serial execution. For example, the previously mentioned AcoreBootProc is in the same low-priority task.

### Sleep/Wakeup
SysPower_McuCoreEnterLowPower: Placed in the highest priority task with the shortest cycle supported by this core.

Integration Note: This function only runs when sleep/wakeup is required. At other times, it exits quickly without causing additional overhead.

### System Interrupt Description
MCU communication with Acore/HSM relies on IPC. Interrupts involved in IPC system services can be referenced in the [Introduction to IPC](./08_mcu_ipc.md) section.
These interrupts should be configured with a higher priority than regular functional interrupts. These interrupts themselves can be configured with the same priority.

## Introduction to FreeRtos System
There are two mainstream startup methods for FreeRTOS: First, in the main function, initialize the hardware, RTOS system, and create all tasks, then start the RTOS scheduler to begin multitasking scheduling. Second, initialize the hardware and RTOS system in the main function, create a startup task, and then start the scheduler. Within the startup task, create various application tasks. After all tasks are created successfully, the startup task deletes itself. There is no strong advantage or disadvantage between the two methods. RDK-S100/RDK-S600 choose the first method.
### FreeRtos System Task Creation
Task creation is located in /mcu/Target/Target-hobot-lite-freertos-mcu1/target/FreeRtosOsHal/Task_Hal.c, as shown in the example below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/FreeRTOS_development/task_init.png" alt="" style={{ width: '100%' }} />

The xxx_Startup task is responsible for startup-related initialization and runs only once.
FreeRtos_OsTask_SysCore_BSW_xms and FreeRtos_OsTask_SysCore_ASW_xms are periodic tasks that schedule periodically based on different xms values. These periodic tasks also handle internal work, as detailed in the previous section "Introduction to the MCU FreeRtos System."

If customers are developing independently, they can refer to the two types of examples above. They can also handle their own demos within already created tasks, as described below.
Task functions are located in the /mcu/Target/Target-hobot-lite-freertos-mcu1/target/HorizonTask.c file.
Take OsTask_SysCore_BSW_10ms as an example; the task periodically checks shell transaction processing:
```c
TASK(OsTask_SysCore_BSW_10ms)
{
    #ifdef SHELL_ENABLE
        Shell_Handler();
    #endif
}
```
### FreeRtos System Interrupt Usage
Interrupt usage in FreeRtos is concentrated in the /mcu/Target/Target-hobot-lite-freertos/target/FreeRtosOsHal/Isr_Hal.c file.
```c
void FreeRtos_Irq_Init(void)
{
  int interrupt_index = 0;
  for(; interrupt_index < INTERRUPT_MCU_MAX_NUM; interrupt_index++)
  {
    if((!Interrupt_McuConfigs[interrupt_index].irqNumber) && (!Interrupt_McuConfigs[interrupt_index].priority)
        && (!Interrupt_McuConfigs[interrupt_index].Handler) && (!Interrupt_McuConfigs[interrupt_index].enable_flag))
    {
      break;
    }

    if(Interrupt_McuConfigs[interrupt_index].Handler)
    {
      INT_SYS_InstallHandler(Interrupt_McuConfigs[interrupt_index].irqNumber, Interrupt_McuConfigs[interrupt_index].Handler, NULL);
    }

    if(Interrupt_McuConfigs[interrupt_index].priority)
    {
      INT_SYS_SetPriority(Interrupt_McuConfigs[interrupt_index].irqNumber, Interrupt_McuConfigs[interrupt_index].priority);
    }

    if(Interrupt_McuConfigs[interrupt_index].enable_flag)
    {
      INT_SYS_EnableIRQ(Interrupt_McuConfigs[interrupt_index].irqNumber);
    }
  }

}
```

If no interrupt handler is set, the interrupt handler remains in its default state, as shown in the /mcu/Target/Target-hobot-lite-freertos-mcu1/target/SuperSoC_ISR.s file.
Take the RTC interrupt handler as an example:
```c
// DefaultISR---default interrupt handler
    .align  4
    .weak   DefaultISR
    .type   DefaultISR, %function
DefaultISR:
    hlt #0
    b   .
    .pool
    .size   DefaultISR, . - DefaultISR

/*    Macro to define default handlers. Default handler
 *    will be weak symbol and just dead loops. They can be
 *    overwritten by other handlers */
    .macro  def_irq_handler handler_name
    .weak   \handler_name
    .set    \handler_name, DefaultISR
    .endm

// Set the default interrupt handler for RTC
    def_irq_handler AON_RTC_INTR
```

Note:
When enabling interrupts on MCU1, ensure that the corresponding interrupts on MCU0 are disabled!!!

### Introduction to FreeRtos Memory Management Scheme
The FreeRtos memory management scheme is located in the /mcu/OpenSource/FreeRTOS/portable/MemMang/ folder. There are five types of memory management algorithms: heap_1.c, heap_2.c, heap_3.c, heap_4.c, and heap_5.c. FreeRTOS's memory management module manages memory allocation and deallocation for users and the system, optimizing memory utilization and efficiency while minimizing memory fragmentation issues that may arise in the system.
#### heap_1.c
The heap_1.c management scheme is the simplest among all memory management schemes provided by FreeRTOS. It only allows memory allocation and not deallocation. This is ideal for safety-critical embedded devices because disallowing memory deallocation prevents memory fragmentation that could crash the system. However, it has the drawback of low memory utilization, as a segment of memory can only be used for allocation and cannot be recycled by the system even if used only once.
#### heap_2.c
The heap_2.c scheme uses a different memory management algorithm than heap_1.c, employing a best-fit algorithm. For example, if you request 100 bytes of memory and there are available memory blocks of sizes 200 bytes, 500 bytes, and 1000 bytes, the algorithm's best fit would split the 200-byte block and return the starting address of the allocated memory, reinserting the remaining memory into the linked list for future requests. Heap_2.c supports freeing allocated memory and reinserting the freed memory into the linked list, sorted by size. However, it cannot merge two adjacent small memory blocks into a larger one. This approach works fine if memory allocation sizes are relatively fixed, but if allocation sizes vary, memory fragmentation can occur. The heap_4.c scheme, discussed later, addresses this issue by merging adjacent freed memory blocks into a larger block.
#### heap_3.c
The heap_3.c scheme simply wraps the standard C library's malloc() and free() functions and works with common compilers. The wrapped malloc() and free() functions include protection features, suspending the scheduler before memory operations and resuming it afterward.
#### heap_4.c
The heap_4.c scheme, like heap_2.c, uses the best-fit algorithm for dynamic memory allocation. However, heap_4.c also includes a merging algorithm that combines adjacent free memory blocks into a larger block, reducing memory fragmentation. heap_4.c is particularly suitable for code that can directly use pvPortMalloc() and vPortFree() functions for memory allocation and deallocation at the porting layer. The free block list in heap_4.c is not sorted by block size but by the starting address of the memory blocks, with smaller addresses first and larger addresses later. This change accommodates the merging algorithm, which merges adjacent free memory blocks if their addresses are continuous during deallocation.
#### heap_5.c
The heap_5.c scheme implements dynamic memory allocation similarly to heap_4.c, using the best-fit algorithm and merging algorithm. It also allows the memory heap to span multiple non-contiguous memory regions, enabling memory allocation across non-contiguous memory heaps. For example, users can define a memory heap in on-chip RAM and one or more additional memory heaps in external SDRAM, all managed by the system. This scheme is more complex and slightly less real-time than heap_4.c.

<DocScope products="RDK S100">
#### RDK-S100 Memory Scheme
RDK-S100 uses the heap_4.c scheme, which combines the best-fit algorithm and merging algorithm. It can allocate and deallocate random byte-sized memory, avoiding memory fragmentation while covering all scenarios of real-time system memory allocation, with good real-time performance.
</DocScope>
<DocScope products="RDK S600">
#### RDK-S600 Memory Scheme
RDK-S600 uses the heap_4.c scheme, which combines the best-fit algorithm and merging algorithm. It can allocate and deallocate random byte-sized memory, avoiding memory fragmentation while covering all scenarios of real-time system memory allocation, with good real-time performance.
</DocScope>
## LOG Area Adjustment
The examples in this section are based on S100; S600 is similar.
### MCU1 Area Adjustment
Modify the corresponding location in the /mcu/Build/FreeRtos_mcu1/Linker/gcc/S100.ld file. The size is not currently modifiable.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/FreeRTOS_development/mcu_log_address.png" alt="" style={{ width: '100%' }} />

### Acore Area Adjustment
Modify the corresponding location in the /source/hobot-drivers/kernel-dts/drobot-s100-soc.dtsi file, keeping it consistent with the MCU1 modification.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/FreeRTOS_development/acore_log_address.png" alt="" style={{ width: '100%' }} />

## Reserved Shared Memory Area Between MCU and Acore
This shared memory area is allocated in the MCU0 space. However, since MCU0 and MCU1 belong to the same MCU SRAM domain, MCU1 can also use the corresponding address.
```c
MCU_STATE_Reserved      : org = 0x0C800400, len = 1K
```
### Currently Occupied Areas:
```c
MCU1_VERSION:  org = 0x0C800400, len = 0x60
MCU_ALIVE:     org = 0x0C800460, len = 0x10
     ---MCU0_ALIVE：org = 0x0C800460, len = 0x04；
     ---MCU1_ALIVE：org = 0x0C800464, len = 0x04；
     ---REVERSED：  org = 0x0C800468, len = 0x08；
```
### Usage Precautions
If shared memory is used for data transfer, there may be an issue where MCU updates data to SRAM, but the Acore cache still contains old data, leading to data read inconsistencies.

To avoid data inconsistency between Acore and MCU, add "volatile" or the "ioremap_np() function" before the variable. Both methods avoid reading from the cache and instead read SRAM data directly.