---
title: "Permissions Adventures: A Sysadmin’s Guide to Not Locking Yourself Out"
date: 2025-04-30
draft: false
tags: [linux, permissions, security, nginx, devops]
categories: [how-to]
summary: "Users, groups, setuid, setgid, ACLs, and the sticky truth — with practical, day-to-day sysadmin examples."
---

Every Linux box has a personality. Some are friendly jump hosts. Some are moody CI runners. And some — usually the production web servers — silently judge you for every `chmod 777` you ever typed in a hurry.

Here’s a fast, fun tour of file permissions the way a sysadmin actually uses them on a typical day.

## Users, Groups, and the "Why can’t nginx read my files?" classic

Scenario: you deploy a static site to `/srv/www/site` but nginx serves only… blank. Logs say `Permission denied`.

Who’s nginx? On Debian/Ubuntu it’s user `www-data`, group `www-data`. On RHEL-ish it’s often `nginx:nginx`.

Step 1: make sure the files are at least world-readable or, better, readable by the web group.

```bash
# Create a shared group for web content
sudo groupadd web  # if it doesn’t exist
sudo usermod -aG web www-data

# Make the site owned by your deploy user, but group-owned by web
sudo chown -R deploy:web /srv/www/site

# Directories need execute (x) to traverse; files need read (r)
find /srv/www/site -type d -exec chmod 2750 {} +   # rwx for owner, r-x for group, setgid (2) on dirs
find /srv/www/site -type f -exec chmod 0640 {} +   # rw- for owner, r-- for group
```

That leading `2` on directories is the setgid bit — we’ll get to it shortly. For now, nginx can traverse directories and read files through the `web` group without making everything world-readable.

If you don’t want to change groups or ownerships, ACLs are your friend:

```bash
# Grant nginx read+traverse to everything under the site
sudo setfacl -R -m u:www-data:rX /srv/www/site

# Ensure new stuff inherits the same permissions
sudo setfacl -R -d -m u:www-data:rX /srv/www/site
```

`rX` says: give read everywhere, and only add execute on directories (and files that already have x). Very neat for web roots.

## Quick refresher: rwx, octal, and umask

- `r` (4): read file or list directory
- `w` (2): write file or create/delete in directory
- `x` (1): execute file or traverse directory

Octal cheatsheet:

```text
chmod 640 file   # owner: rw-, group: r--, other: ---
chmod 755 dir    # owner: rwx, group: r-x, other: r-x
```

Umask makes default permissions less permissive:

```bash
# Common default for shells
umask 0022  # new files 644, new dirs 755

# For collaborative repos (let group write)
umask 0002  # new files 664, new dirs 775
```

## setuid and setgid on files: when programs borrow privileges

Some binaries need elevated rights for a moment. Classic examples:

```bash
/bin/ping     # usually setuid root so it can open raw ICMP sockets
/usr/bin/passwd  # setuid root so it can update /etc/shadow
```

You can spot them with the `s` bit:

```bash
ls -l /bin/ping /usr/bin/passwd
# -rwsr-xr-x 1 root root ... /bin/ping
# -rwsr-xr-x 1 root root ... /usr/bin/passwd
```

That `s` in the owner’s execute slot means "run as the file owner" (here, root). Powerful, sometimes necessary, and absolutely should be limited to audited system binaries. Don’t sprinkle setuid on your own scripts — it’s unsafe (and ignored on scripts on many distros).

## setgid on directories: automatic group sharing

Remember that `2` we used earlier? The setgid bit on a directory makes new files inherit the directory’s group. It keeps a team repo collaborative without fighting your umask.

```bash
sudo chgrp -R web /srv/www/site
sudo chmod 2750 /srv/www/site
```

Now anything created inside `/srv/www/site` will get group `web`. Combine with umask `0002` and you get frictionless teamwork.

## Sticky bit: /tmp without the chaos

Sticky bit on a directory means: users can create files, but can only delete their own. `/tmp` uses this:

```bash
ls -ld /tmp
# drwxrwxrwt ... /tmp
```

That trailing `t` is the sticky bit. If you host shared scratch spaces (e.g., `/srv/scratch`), enable it:

```bash
sudo mkdir -p /srv/scratch
sudo chmod 1777 /srv/scratch  # world-writable, sticky
```

## ACLs (setfacl/getfacl): when UNIX bits aren’t enough

UNIX bits give you one owner and one group. ACLs let you say "this one extra user or group can read/write too" and set defaults.

Common patterns:

```bash
# Give nginx read access without touching group ownerships
sudo setfacl -m u:www-data:rX -R /srv/app/releases/current/public

# Default ACLs so new files inherit permissions
sudo setfacl -m d:u:www-data:rX -R /srv/app/releases/current/public

# Give your CI user write access alongside the team
sudo setfacl -m u:ci:rwX -R /srv/repos/project
sudo setfacl -m d:u:ci:rwX -R /srv/repos/project

# Inspect what’s set
getfacl /srv/app/releases/current/public
```

If you ever get confusing behavior, check for ACLs — they can trump what `ls -l` suggests. `getfacl` is your truth.

## nginx logs: permissions that won’t bite you at 3AM

Nginx typically writes logs to `/var/log/nginx`. Make sure logrotate and permissions are friendly:

```bash
sudo install -o root -g adm -m 2755 -d /var/log/nginx
sudo chown root:adm /var/log/nginx
sudo usermod -aG adm www-data   # if you want nginx readable by ops
```

And in logrotate snippets, ensure rotated files keep the right owner/group:

```text
/var/log/nginx/*.log {
  daily
  missingok
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 www-data adm
  sharedscripts
  postrotate
    [ -s /run/nginx.pid ] && kill -USR1 "$(cat /run/nginx.pid)"
  endscript
}
```

## Debugging permission issues like a pro

- "It works as root" is a clue, not a solution.
- Check the whole path: every parent directory needs execute (`x`) to traverse.
- Verify the actual user: `ps aux | grep nginx` or `sudo -u www-data -s` to reproduce.
- Look for ACLs: `getfacl` will reveal hidden rules.
- SELinux/AppArmor can also block you — if standard permissions look right, check `auditd` logs.

## Quick cheats

```bash
# Show numeric and symbolic modes
stat -c "%A %a %U:%G %n" /path/to/thing

# Find world-writable (and flag suspicious setuid)
sudo find / -xdev -type f -perm -4000 -o -type d -perm -0002 2>/dev/null

# Safely make a directory collaborative for a team
sudo chgrp -R web /srv/project
sudo chmod 2775 /srv/project
umask 0002   # for users in the team

# Grant one-off read to nginx via ACL
sudo setfacl -m u:www-data:rX -R /srv/www/site
```

Master these and you’ll spend less time whispering apologies to production and more time sipping coffee while logs glow green.
