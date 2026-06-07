# 8.7 Desktop Applications

URL: https://developer.d-robotics.cc/rdk_s_doc/en/FAQ/desktop_app

This section answers common issues when using third-party applications on the desktop.

### Q1: Visual Studio Code fails to open after installation?

**A:**

- **Launch from the command line:** The Electron shell used by Visual Studio Code has known issues with GPU (Graphics Processing Unit) hardware acceleration on some platforms. You can try disabling GPU acceleration by adding the Electron `--disable-gpu` command-line switch when starting VS Code ( [https://code.visualstudio.com/docs/supporting/faq#_vs-code-is-blank](https://code.visualstudio.com/docs/supporting/faq#_vs-code-is-blank) ):

```bash
code --disable-gpu
```

## Known Issues

1. Language switching may cause the following issue
Note
It is recommended not to use this feature for now. If you do, please follow the steps below to resolve the issue.

**Issue description:** After switching the system language in "Settings" and restarting, you may be unable to log in to the desktop even with the correct password.

**Steps:** Open the Settings app, navigate to Region & Language, select the target language, and click the restart button (this restart only restarts the desktop session, not the device). Enter your password on the lock screen.

**Solution:** If you cannot log in with the correct password during the steps above, power cycle the device or run `reboot` to complete the language switch.
