---
title: "The 4AM Omarchy Misadventure (With Crispy Dosa on the Side)"
date: 2024-10-30
draft: false
tags: [omarchy, linux, regex, insomnia, humor]
categories: [funny, diary]
summary: "As per IST, I was up all night tinkering with Linux. No deadlines, no pressure. Just me, Omarchy, regex, a stale dosa, and `/var/log/archinstall/install.log` mocking me."
---

It was one of *those* nights again.  
As per IST, it was about 4 AM. No work pressure, no deadlines, no production outage. Just me, my stubborn itch to tinker with Linux, and the questionable life choice of downloading yet another ISO instead of getting sleep.

A few days earlier, I had learned about Omarchy. Minimalist tiling vibes, fancy fonts, that whole *ricer aesthetic*. I had already done the full **Arch-from-scratch to GNOME DE** thing before — the sort of nerd rite of passage you brag about in forums. But that morning, my sleep-deprived brain whispered:  
*“Why not try Omarchy ISO? How bad can it be?”*

---

### The Dosa Incident
Just as I was burning the ISO, my maid appeared. She looked at me — clearly wondering why I was still awake — and casually asked if I wanted a dosa. Now, if you’ve ever been debugging Linux at 4 AM, you know food is both a distraction and salvation. I said yes.  

Big mistake.  

The dosa batter had been in the fridge for five days. The result? A dosa that was more “crispy disaster” than breakfast. It broke into pieces the moment I picked it up. Still, in true sysadmin fashion, I ate it without complaint. No need to escalate a sev-1 to the maid. I quietly accepted my fate, fueled myself with broken dosa shards, and went back to my terminal.

---

### /var/log/archinstall/install.log — My Frenemy
Back at the Omarchy installer, I noticed something odd in `/var/log/archinstall/install.log`.  
The log was basically screaming:  
*“Please restart your system. The configurator can’t alert the kernel about the extensive changes being made.”*  

Wait, what? Restart? During install? That wasn’t in the brochure.  
DHH promised this was supposed to take **5–15 minutes**. Yet here I was, an hour in, being mocked by a log file.  

I sat there, thinking: *“This wasn’t supposed to be a full-blown adventure. This was supposed to be quick!”* Famous last words.

---

### The Theme Rabbit Hole
Of course, instead of finishing the install, I decided to explore **extra Omarchy themes**. My 4 AM brain said, *“Yeah, let’s automate this!”* Because nothing screams productivity like writing a fragile regex pipeline when you’re already sleep-deprived.

So I proudly typed:

```bash
curl -s https://learn.omacom.io/2/the-omarchy-manual/90/extra-themes \
  | grep -oP 'https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+' \
  | xargs -r -n1 omarchy-theme-install
