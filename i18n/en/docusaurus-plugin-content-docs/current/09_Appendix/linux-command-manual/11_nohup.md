---
sidebar_position: 11
---

# nohup

**nohup** (short for no hang up) is used to run a command in the background without being affected by terminal closures.

By default (when not redirected), it outputs a file named nohup.out to the current directory. If the nohup.out file in the current directory is not writable, the output will be redirected to the `$HOME/nohup.out` file. If no file can be created or opened for appending, the specified command in the "command" parameter will not be executable. If the standard error is a terminal, all output from the specified command that is written to the standard error will be redirected to the same file descriptor as the standard output.

## Syntax

```
nohup COMMAND [ARG]... [ & ]
nohup OPTION
```

**COMMAND**: The command to be executed.

**ARG**: The parameters passed to the command.

**&**: Allows the command to be executed in the background, even after the terminal is closed.

## Option explanation

- `--help`: Display help information.
- `--version`: Display version information.

## Common commands

The following command executes the test.sh script in the background under the root directory:

```
nohup /root/test.sh &
```

Expected output (excerpt; the script output is written to nohup.out in the current directory by default):

```text
nohup test output
```

To stop the execution, you need to use the following command to find the PID of the running script using nohup, and then use the kill command to delete it:

```
ps aux | grep "test.sh" 
```

The following command executes the test.sh script in the background under the root directory and redirects the input to the test.log file:

```
nohup /root/test.sh > test.log 2>&1 &
```

Explanation of `2>&1`:

Redirect standard error 2 to standard output &1, and then redirect standard output &1 to the test.log file.

- 0 - stdin (standard input)
- 1 - stdout (standard output)
- 2 - stderr (standard error output)

## Related Documentation

- [ps](./12_ps.md)