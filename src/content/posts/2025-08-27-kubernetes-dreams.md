---
title: "Kubernetes in My Dreams"
date: 2025-01-30
draft: false
tags: [kubernetes, nightmares, devops, humor, pipelines]
categories: [funny, diary]
summary: "Spent so long with Kubernetes and pipelines that I literally started dreaming about them. Even my maid thinks I’ve lost it."
---

There was a stretch of days when I was so deep into setting up Kubernetes and CI/CD pipelines that I stopped dreaming about anything else. My subconscious basically signed an SLA with GitOps.  

Every night, my brain would replay the same questions:  
- *Who in the world (obviously someone much, much smarter than me) decided we need pipelines in the first place?*  
- *Why does a simple code commit have to travel through commit → push → pull request → merge conflict hell before even thinking about deploying?*  
- *Why do builds always run out of storage right when you’re feeling confident?*  

And just when the images finally built and got pushed to the registry… along came **ArgoCD**. The god of auto-deployment. Watching over the Git repo like a divine auditor, ready to summon pods the second it senses a change — or a developer’s sneeze.  

You’d think that was the end of it. Nope. Because then came the aftershocks:  
*“Oops, I forgot one of the 1000 environment variables in the deployment manifest.”*  
Now the API refuses to start, and I’m staring at `kubectl logs` like it’s tea leaves predicting my doom.  

---

### Nightmares That Don’t End
At night, I’d toss and turn, muttering things like:  
- *“The pod is CrashLoopBackOff again…”*  
- *“Increase the replica count!”*  
- *“Why won’t the ingress work, even in my dreams?!”*  

My sleep wasn’t restful. It was like debugging an infinite pipeline where the only stage was “mental breakdown.”

---

### The Maid Incident
One morning, after several nights of Kubernetes-induced insomnia, I absentmindedly turned to my maid and asked:  
*“Do you know why the API isn’t working? I can’t seem to figure it out.”*  

She looked at me with genuine concern and said, *“Are you drunk?”*  

No, I wasn’t drunk. Just sleep-deprived, over-caffeinated, and haunted by YAML.  

---

### Lessons? None.
People say DevOps is about automation and efficiency. But at 4 AM, when you’re arguing with ArgoCD in your dreams and your maid thinks you’ve lost your mind, you realize something:  

Kubernetes isn’t just a tool.  
It’s a lifestyle.  
And sometimes… it’s a sleep disorder.
