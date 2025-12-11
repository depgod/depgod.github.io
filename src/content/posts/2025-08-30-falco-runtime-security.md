---
title: "Falco 101 (2025): Real‑Time Linux Threat Detection"
date: 2025-08-30
draft: false
tags: [falco, security, linux, runtime, devops]
categories: [how-to]
summary: "What Falco is, why to use it, up-to-date install for 2025, a clean falco.yaml, a practical demo rules file for critical paths, and native Telegram alerts without Falcosidekick."
toc: true
tocBorder: true
---

Falco is a real‑time runtime security tool. It hooks into the Linux kernel (eBPF probe or kernel module) to detect suspicious behavior: unexpected writes in /etc, odd process spawns, privilege changes, and more. It emits structured events you can ship to logs or call a program for alerting.

Why use it
- Visibility: catches behavior you won’t see in app logs (e.g., /etc/shadow reads).
- Fast + lightweight: kernel-level signals with low overhead.
- Extensible: sane default rules plus your own.
- Simple outputs: stdout/file/program/http — no extra daemons required.

## 1) Install Falco (August 2025)

Debian/Ubuntu (bare‑metal):

```bash
curl -s https://falco.org/repo/falcosecurity-packages.asc \
  | sudo gpg --dearmor -o /usr/share/keyrings/falco-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/falco-archive-keyring.gpg] https://download.falco.org/packages/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/falcosecurity.list
sudo apt update
sudo apt install -y falco

# Enable and start
sudo systemctl enable --now falco
sudo systemctl status falco --no-pager
```

Notes
- eBPF is preferred on modern kernels; the package selects the best driver.
- Containers/Kubernetes: Falco also runs as a privileged container or DaemonSet. For a single VM, packages are simplest.

## 2) falco.yaml (clean, minimal)

Path: `/etc/falco/falco.yaml`

```yaml
json_output: true
priority: notice

stdout_output:
  enabled: true

file_output:
  enabled: true
  keep_alive: false
  filename: /var/log/falco-events.log

# Optional native hook for alerts (see section 4)
program_output:
  enabled: false
  keep_alive: false
  program: /usr/local/bin/falco-alert.sh "%output%"

rules_file:
  - /etc/falco/falco_rules.yaml
  - /etc/falco/falco_rules.local.yaml
  - /etc/falco/rules.d
```

Reload Falco after edits:

```bash
sudo systemctl reload falco || sudo systemctl restart falco
```

## 3) Demo rules file (protect critical paths)

Create `/etc/falco/rules.d/critical-files.yaml`:

```yaml
rule: Write below etc
desc: Detect any file write below /etc (excluding harmless temp writes)
condition: >
  evt.type in (open, openat, creat, rename, renameat, chmod, chown, unlink, link, linkat) and
  evt.dir in ("<", "=") and
  fd.name startswith "/etc" and
  not fd.name startswith "/etc/ld.so.cache" and
  not fd.name startswith "/etc/falco" and
  (evt.is_open_write=true or evt.type in (creat, rename, renameat, chmod, chown, unlink, link, linkat))
output: "Falco: Write below /etc by (user=%user.name cmd=%proc.cmdline file=%fd.name evt=%evt.type)"
priority: warning
tags: [filesystem, integrity]
---
rule: Modify ssh authorized_keys
desc: Detect write to any authorized_keys file
condition: >
  evt.type in (open, openat, creat, rename, chmod, chown, unlink) and
  evt.dir in ("<", "=") and
  (fd.name endswith "/.ssh/authorized_keys" or fd.name pmatch ("/root/.ssh/authorized_keys", "/home/*/.ssh/authorized_keys")) and
  (evt.is_open_write=true or evt.type in (creat, rename, chmod, chown, unlink))
output: "Falco: SSH authorized_keys modified by %proc.cmdline (user=%user.name file=%fd.name evt=%evt.type)"
priority: critical
tags: [ssh, integrity]
---
rule: Read shadow file
desc: Alert on processes reading /etc/shadow
condition: >
  evt.type in (open, openat, read) and
  fd.name = "/etc/shadow"
output: "Falco: /etc/shadow read by %proc.cmdline (user=%user.name)"
priority: critical
tags: [auth, integrity]
---
rule: Write below sensitive logs
desc: Unexpected writes to key auth logs
condition: >
  evt.type in (open, openat, write, creat, rename) and
  evt.dir in ("<", "=") and
  fd.name pmatch ("/var/log/auth.log", "/var/log/secure") and
  (evt.is_open_write=true or evt.type in (write, creat, rename))
output: "Falco: Auth log modified by %proc.cmdline (user=%user.name file=%fd.name evt=%evt.type)"
priority: warning
tags: [logging, integrity]
---
rule: Execution from /tmp or /var/tmp
desc: Detect execution of a binary/script dropped in temp dirs
condition: >
  evt.type in (execve, execveat) and
  (proc.exe startswith "/tmp/" or proc.exe startswith "/var/tmp/")
output: "Falco: Executed from temp %proc.exe by %proc.cmdline (user=%user.name)"
priority: critical
tags: [execution]
---
rule: Sudoers modified
desc: Detect modifications to sudoers config
condition: >
  evt.type in (open, openat, creat, rename, chmod, chown, unlink, write) and
  fd.name pmatch ("/etc/sudoers", "/etc/sudoers.d/*") and
  (evt.is_open_write=true or evt.type in (write, creat, rename, chmod, chown, unlink))
output: "Falco: sudoers modified by %proc.cmdline (user=%user.name file=%fd.name evt=%evt.type)"
priority: critical
tags: [privilege]
---
rule: Systemd unit changed
desc: Detect writes under /etc/systemd
condition: >
  evt.type in (open, openat, creat, rename, chmod, chown, unlink, write) and
  fd.name startswith "/etc/systemd/" and
  (evt.is_open_write=true or evt.type in (write, creat, rename, chmod, chown, unlink))
output: "Falco: systemd unit directory modified by %proc.cmdline (user=%user.name file=%fd.name evt=%evt.type)"
priority: warning
tags: [persistence, integrity]
```

Apply and watch events:

```bash
sudo systemctl reload falco || sudo systemctl restart falco
sudo tail -f /var/log/falco-events.log
```

Tip: Exclude known noisy actors with clauses like `and not proc.name in ("unattended-upgrade", "ansible", "dpkg", "apt")`.

## 4) Optional: Telegram alerts (native program_output)

If you want chat alerts without extra components, use Falco’s `program_output` to call a tiny script.

Create `/usr/local/bin/falco-alert.sh` and make it executable:

```bash
#!/usr/bin/env bash
set -euo pipefail
MSG="$1"

# Telegram bot settings
TOKEN="123456:ABCDEF_your_token"
CHAT_ID="-1001234567890"

curl -s -X POST \
  "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d chat_id="${CHAT_ID}" \
  -d parse_mode=MarkdownV2 \
  --data-urlencode text="${MSG}"
```

Enable in `/etc/falco/falco.yaml`:

```yaml
program_output:
  enabled: true
  keep_alive: false
  program: /usr/local/bin/falco-alert.sh "%output%"
```

Restart Falco:

```bash
sudo systemctl restart falco
```

## 5) Verify and tune

- Trigger a harmless event: `sudo touch /etc/test-falco` — you should see it in stdout/file and (if enabled) Telegram.
- Keep your custom rules in `/etc/falco/rules.d` so upgrades don’t clobber them.
- Iterate: tighten rules, add exceptions for your config management.

That’s it — Falco (2025) with a clean setup, a practical ruleset, and optional native chat alerts.
