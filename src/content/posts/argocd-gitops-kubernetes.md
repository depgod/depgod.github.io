---
title: "GitOps with ArgoCD: Declarative Kubernetes Deployments"
date: "2025-01-05"
excerpt: "Learn how to implement GitOps workflows using ArgoCD for automated, declarative Kubernetes deployments with rollback capabilities."
tags: ["kubernetes", "argocd", "gitops", "devops"]
---

# GitOps with ArgoCD: Declarative Kubernetes Deployments

ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. This guide covers installation, configuration, and best practices for production deployments.

## Why GitOps?

- **Single source of truth**: Git repository defines desired state
- **Auditability**: All changes tracked in version control
- **Rollback**: Instant rollback to any previous state
- **Security**: No direct cluster access needed for deployments

## Prerequisites

- Running Kubernetes cluster (K3s, EKS, GKE, etc.)
- `kubectl` configured with cluster access
- Git repository for application manifests

## Step 1: Install ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
```

## Step 2: Access ArgoCD UI

```bash
# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Or expose via Ingress (recommended for production)
```

### Ingress Configuration with Traefik

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    traefik.ingress.kubernetes.io/router.tls: "true"
spec:
  ingressClassName: traefik
  rules:
    - host: argocd.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 443
  tls:
    - hosts:
        - argocd.example.com
      secretName: argocd-tls
```

## Step 3: Install ArgoCD CLI

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/

# Login
argocd login localhost:8080 --username admin --password <password> --insecure
```

## Step 4: Configure Git Repository

```bash
# Add repository (HTTPS)
argocd repo add https://github.com/your-org/your-app-manifests.git \
  --username <username> \
  --password <token>

# Add repository (SSH)
argocd repo add git@github.com:your-org/your-app-manifests.git \
  --ssh-private-key-path ~/.ssh/id_ed25519
```

## Step 5: Create an Application

### Via CLI

```bash
argocd app create my-app \
  --repo https://github.com/your-org/your-app-manifests.git \
  --path kubernetes/ \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

### Via Manifest (Recommended)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/your-app-manifests.git
    targetRevision: HEAD
    path: kubernetes/
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

## Step 6: ApplicationSets for Multi-Cluster

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: my-app-set
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: production
            url: https://prod-cluster.example.com
          - cluster: staging
            url: https://staging-cluster.example.com
  template:
    metadata:
      name: '{{cluster}}-my-app'
    spec:
      project: default
      source:
        repoURL: https://github.com/your-org/your-app-manifests.git
        targetRevision: HEAD
        path: 'overlays/{{cluster}}'
      destination:
        server: '{{url}}'
        namespace: my-app
```

## Step 7: Webhook Configuration

Configure GitHub webhook for instant sync on push:

```bash
# Get webhook secret
kubectl -n argocd get secret argocd-secret -o jsonpath='{.data.webhook\.github\.secret}' | base64 -d

# GitHub Webhook URL: https://argocd.example.com/api/webhook
# Content type: application/json
# Events: Push events
```

## Best Practices

### Repository Structure

```
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── production/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── staging/
│       ├── kustomization.yaml
│       └── patches/
└── argocd/
    └── applications/
```

### Security Hardening

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  admin.enabled: "false"
  users.anonymous.enabled: "false"
  url: https://argocd.example.com
```

### RBAC Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.csv: |
    p, role:developer, applications, get, */*, allow
    p, role:developer, applications, sync, */*, allow
    p, role:admin, applications, *, */*, allow
    g, developers, role:developer
    g, admins, role:admin
  policy.default: role:readonly
```

## Monitoring ArgoCD

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: argocd-metrics
  namespace: argocd
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-server
  endpoints:
    - port: metrics
```

## Rollback Procedure

```bash
# List application history
argocd app history my-app

# Rollback to specific revision
argocd app rollback my-app <revision>

# Or sync to specific Git commit
argocd app sync my-app --revision <commit-sha>
```

## Summary

You now have:
- ArgoCD installed and configured
- GitOps workflow for automated deployments
- Webhook integration for instant sync
- Multi-cluster deployment capability
- RBAC and security hardening

**Next steps:** Set up monitoring with Prometheus and Grafana.
