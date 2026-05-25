# sample_gpu_3d User Manual
## Function Overview
3D GPU supports the following standard APIs:
- OpenGLES
- OpenCL
- Vulkan

Corresponding sample code is provided for two of these APIs:
1. OpenCL example
2. OpenGLES example

Please select the corresponding API example for reference and use based on specific requirements.

## OpenCL
### sample_matrix_multiply
#### Function Overview
Function description: `sample_matrix_multiply` performs the same matrix operation using both the 3D GPU and CPU, and prints the time taken by both

##### Code Location and Directory Structure
- Code location `/app/multimedia_samples/sample_gpu_3d/cl/sample_matrix_multiply`
- Directory structure
```
└── sample_matrix_multiply
    ├── Makefile
    └── matrix_multiply.c
```

#### Compilation

- Enter the sample_matrix_multiply directory and run `make` to compile
- The output artifact is `matrix_multiply` in the sample_matrix_multiply source directory

#### Execution
##### Program Execution Method
Run the executable program: `./matrix_multiply`
##### Program Parameter Options Description
None
##### Execution Effect
Execute command:
`./matrix_multiply`
Execution log:
```sh
./matrix_multiply
CPU execution time: 0.997923 seconds
OpenCL execution time: 0.038153 seconds
Matrices are identical!
```
Effect description
Performing the same matrix multiplication operation:
1. CPU time: 0.997923 seconds
2. GPU time: 0.038153 seconds

From the total time, it can be seen that the GPU has much higher performance than the CPU when performing matrix multiplication operations

## OpenGL ES

### sample_bezier
#### Function Overview
Function description: `sample_bezier` uses the 3D GPU to draw a Bezier curve, displayed in two ways
1. On the monitor desktop
2. Saved as an image

##### Code Location and Directory Structure
- Code location `/app/multimedia_samples/sample_gpu_3d/gles/sample_bezier`
- Directory structure
```
sample_bezier/
├── bezier.c
└── Makefile
```

#### Compilation
- Enter the sample_bezier directory and run `make` to compile
- The output artifact is `bezier` in the sample_bezier source directory

#### Execution
##### Program Execution Method
The following preparations need to be done before executing the program:
1. Connect the RDKS100 to a monitor via the HDMI interface
2. Connect a mouse and keyboard to the RDKS100, and log into the Ubuntu system through the monitor interface

Execute the program:
1. Enter the directory: `cd /app/multimedia_samples/sample_gpu_3d/gles/sample_bezier`
2. Execute the program: `./bezier`

Note: If the user executing the program is different from the user logged into the graphical interface, the following commands need to be executed: (The user can execute the program from a system logged in via `ssh` or serial port)
1. Take the `sunrise` user as an example, run `id -u sunrise` to check that the user ID of the sunrise user is 1000
2. Export the environment variable `WAYLAND_DISPLAY` using the `export` command. Note that 1000 in the command is the user ID obtained in step 1

```shell
root@ubuntu:/app/multimedia_samples/sample_gpu_3d/gles/sample_bezier# id -u sunrise
1000

root@ubuntu:/app/multimedia_samples/sample_gpu_3d/gles/sample_bezier# export WAYLAND_DISPLAY=/run/user/1000/wayland-0
```

##### Program Parameter Options Description
No parameter options

##### Execution Effect

Execution log: None

Effect description:
1. A window will be displayed on the monitor desktop: the window shows a red Bezier curve
2. The content displayed in the window will also be saved as a file: in the current directory, a bmp format image file named `bezier.bmp` will be generated