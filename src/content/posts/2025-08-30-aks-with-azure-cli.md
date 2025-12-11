---
title: "AKS the Easy Way: Deploy a Kubernetes Cluster with Azure CLI"
date: 2025-05-30
draft: false
tags: [kubernetes, azure, aks, cli, devops]
categories: [how-to]
summary: "Fastest path to a working AKS cluster: create, connect with kubectl, and peek at workloads — with a bonus k9s TUI tip."
toc: true
tocBorder: true
---

This is a copy‑paste friendly guide to spin up a small AKS (Azure Kubernetes Service) cluster using the Azure CLI, grab cluster access for `kubectl`, and view workloads. Perfect for demos, learning, or a quick sandbox.

## Prerequisites

- Azure CLI installed (`az version`)
- `kubectl` installed (`kubectl version --client`)
- An Azure subscription (free trial works)

## 1) Sign in to Azure

```bash
az login
# If on a headless box: az login --use-device-code
az account show --output table
```

Optionally pick a specific subscription:

```bash
az account set --subscription "<SUBSCRIPTION NAME OR ID>"
```

## 2) Create a resource group

```bash
RG="rg-aks-demo"
LOC="eastus"   # pick your nearest region
az group create --name "$RG" --location "$LOC" --output table
```

## 3) Create a minimal AKS cluster

This creates a single‑node system pool — fast and inexpensive for testing.

```bash
AKS="aks-demo"
az aks create \
  --resource-group "$RG" \
  --name "$AKS" \
  --node-count 1 \
  --generate-ssh-keys \
  --output table
```

Provisioning takes a few minutes.

## 4) Get kubeconfig and connect with kubectl

```bash
az aks get-credentials --resource-group "$RG" --name "$AKS" --overwrite-existing

# Verify cluster access
kubectl cluster-info
kubectl get nodes -o wide
```

If you see nodes listed, you’re in.

## 5) View cluster workloads

Start with the basics:

```bash
# All namespaces at a glance
kubectl get pods -A
kubectl get deploy -A
kubectl get svc -A
```

Optionally, deploy a tiny sample and expose it:

```bash
kubectl create deployment hello --image=nginx --port=80
kubectl expose deployment hello --type=LoadBalancer --port=80
kubectl get svc hello -w
```

Once an external IP appears, open it in your browser.

## Tip: a nicer TUI with k9s

`k9s` gives you a fast, keyboard‑driven view of your cluster.

Install (pick one):

```bash
# macOS (Homebrew)
brew install derailed/k9s/k9s

# Linux (Debian/Ubuntu)
curl -sS https://webinstall.dev/k9s | bash   # or use your distro’s package manager

# Arch
pacman -S k9s
```

Launch it:

```bash
k9s
```

Use `:ns` to switch namespaces, `/` to search, `d` for deployments, `po` for pods.

## Cleanup (avoid surprise costs)

```bash
az group delete --name "$RG" --yes --no-wait
```

That’s it — you created an AKS cluster, connected with `kubectl`, and viewed workloads. Happy shipping!
