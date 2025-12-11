---
title: "One-Command Server Setup with Ansible: Nginx + Docker + Certbot + Django/React"
date: 2025-06-30
draft: false
tags: [ansible, devops, nginx, docker, certbot, django, react]
categories: [how-to]
summary: "A copy-paste Ansible skeleton that installs Nginx, Docker, handy CLI tools, issues TLS certificates with Certbot, and deploys a Django API + React frontend behind Nginx."
toc: true
tocBorder: true
---

This guide shows an opinionated, minimal Ansible layout to turn a fresh Linux VM into a production‑ish web host:

- Installs system tools (batcat, ncdu, trash-cli)
- Installs Docker and Docker Compose (plugin)
- Deploys two containers: Django API and React frontend
- Installs and configures Nginx as a reverse proxy
- Issues HTTPS certificates via Certbot and reloads Nginx

Assumptions:
- Your domain points to the server’s public IP (A/AAAA records)
- You have SSH access as a sudo‑capable user
- You have container images for Django and React (or use the examples)

## 0) Install Ansible on your laptop

Pick one method:

```bash
# Using pipx (recommended)
pipx install ansible

# Or on Debian/Ubuntu
sudo apt update && sudo apt install -y ansible

# Verify
ansible --version
```

## 1) Project structure

Create a folder like `infra/` with the following skeleton:

```text
infra/
  inventory/
    hosts.ini
  group_vars/
    prod.yml
  roles/
    common/
      tasks/main.yml
    docker/
      tasks/main.yml
    app/
      templates/docker-compose.yml.j2
      tasks/main.yml
    nginx/
      templates/site.conf.j2
      tasks/main.yml
    certbot/
      tasks/main.yml
  site.yml
```

### inventory/hosts.ini

```ini
[prod]
your.server.fqdn ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

### group_vars/prod.yml

```yaml
domain: example.com
admin_email: admin@example.com
app_root: /srv/webapp

# Published ports for host Nginx to proxy to
react_host: 127.0.0.1
react_port: 3000
django_host: 127.0.0.1
django_port: 8000

# Container images (replace with your own)
react_image: ghcr.io/example/react-frontend:latest
django_image: ghcr.io/example/django-api:latest

# Optional env
django_env:
  DJANGO_SETTINGS_MODULE: app.settings
  SECRET_KEY: changeme
  ALLOWED_HOSTS: "{{ domain }}"
  DB_HOST: 127.0.0.1
  DB_NAME: app
  DB_USER: app
  DB_PASSWORD: secret
```

## 2) site.yml (the playbook)

```yaml
---
- name: Provision web host
  hosts: prod
  become: true
  vars:
    ansible_python_interpreter: /usr/bin/python3
  roles:
    - common
    - docker
    - app
    - nginx
    - certbot
```

## 3) Role: common (tools and basics)

roles/common/tasks/main.yml

```yaml
---
- name: Update apt cache
  apt:
    update_cache: true

- name: Install useful CLI tools
  apt:
    name:
      - bat
      - ncdu
      - trash-cli
      - ca-certificates
      - curl
      - gnupg
    state: present

- name: Create app root
  file:
    path: "{{ app_root }}"
    state: directory
    mode: '0755'
```

Note: On Debian bullseye/bookworm, `bat` is installed as the `batcat` binary.

## 4) Role: docker (Docker Engine + Compose plugin)

roles/docker/tasks/main.yml

```yaml
---
- name: Add Docker’s official GPG key
  apt_key:
    url: https://download.docker.com/linux/debian/gpg
    state: present
  when: ansible_facts['os_family'] == 'Debian'

- name: Add Docker repository
  apt_repository:
    repo: "deb [arch={{ ansible_architecture }}] https://download.docker.com/linux/{{ ansible_facts['distribution'] | lower }} {{ ansible_facts['distribution_release'] }} stable"
    state: present
  when: ansible_facts['os_family'] == 'Debian'

- name: Install Docker Engine and Compose plugin
  apt:
    name:
      - docker-ce
      - docker-ce-cli
      - containerd.io
      - docker-buildx-plugin
      - docker-compose-plugin
    state: present
    update_cache: true

- name: Ensure Docker service is running
  service:
    name: docker
    state: started
    enabled: true
```

## 5) Role: app (docker-compose stack for React + Django)

roles/app/templates/docker-compose.yml.j2

```yaml
version: '3.8'
services:
  react:
    image: {{ react_image }}
    restart: unless-stopped
    ports:
      - "{{ react_host }}:{{ react_port }}:3000"
    environment:
      - NODE_ENV=production

  django:
    image: {{ django_image }}
    restart: unless-stopped
    environment:
      - DJANGO_SETTINGS_MODULE={{ django_env.DJANGO_SETTINGS_MODULE }}
      - SECRET_KEY={{ django_env.SECRET_KEY }}
      - ALLOWED_HOSTS={{ django_env.ALLOWED_HOSTS }}
      - DB_HOST={{ django_env.DB_HOST }}
      - DB_NAME={{ django_env.DB_NAME }}
      - DB_USER={{ django_env.DB_USER }}
      - DB_PASSWORD={{ django_env.DB_PASSWORD }}
    command: ["gunicorn", "app.wsgi:application", "-b", "0.0.0.0:8000", "-w", "3"]
    ports:
      - "{{ django_host }}:{{ django_port }}:8000"
```

roles/app/tasks/main.yml

```yaml
---
- name: Copy docker-compose file
  copy:
    dest: "{{ app_root }}/docker-compose.yml"
    content: "{{ lookup('template', 'docker-compose.yml.j2') }}"

- name: Start app stack
  community.docker.docker_compose_v2:
    project_src: "{{ app_root }}"
    state: present
```

Tip: Install `community.docker` collection once on your control machine: `ansible-galaxy collection install community.docker`.

## 6) Role: nginx (reverse proxy)

roles/nginx/templates/site.conf.j2

```nginx
server {
  listen 80;
  server_name {{ domain }};

  # Let’s Encrypt HTTP-01 challenge
  location ^~ /.well-known/acme-challenge/ {
    root /var/www/letsencrypt;
  }

  # React frontend
  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://{{ react_host }}:{{ react_port }};
  }

  # Django API
  location /api/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://{{ django_host }}:{{ django_port }};
  }
}
```

roles/nginx/tasks/main.yml

```yaml
---
- name: Install nginx
  apt:
    name: nginx
    state: present

- name: Create webroot for ACME challenges
  file:
    path: /var/www/letsencrypt
    state: directory
    owner: www-data
    group: www-data
    mode: '0755'

- name: Deploy site config
  copy:
    dest: "/etc/nginx/sites-available/{{ domain }}.conf"
    content: "{{ lookup('template', 'site.conf.j2') }}"

- name: Enable site
  file:
    src: "/etc/nginx/sites-available/{{ domain }}.conf"
    dest: "/etc/nginx/sites-enabled/{{ domain }}.conf"
    state: link

- name: Remove default site if present
  file:
    path: /etc/nginx/sites-enabled/default
    state: absent

- name: Test nginx config
  command: nginx -t
  register: nginx_test
  changed_when: false

- name: Reload nginx
  service:
    name: nginx
    state: reloaded
```

## 7) Role: certbot (issue TLS and reload nginx)

roles/certbot/tasks/main.yml

```yaml
---
- name: Install Certbot for Nginx
  apt:
    name:
      - certbot
      - python3-certbot-nginx
    state: present
    update_cache: true

- name: Obtain/renew certificate (nginx plugin)
  command: >-
    certbot --nginx -d {{ domain }}
    --non-interactive --agree-tos -m {{ admin_email }} --redirect
  args:
    creates: "/etc/letsencrypt/live/{{ domain }}/fullchain.pem"

- name: Ensure systemd timer for renewals is active
  service:
    name: certbot.timer
    state: started
    enabled: true
```

This uses the Nginx plugin to edit the HTTP vhost and add HTTPS + automatic redirection. If you prefer an immutable Nginx config, switch to the `--webroot` method and add an HTTPS server block to the template.

## 8) Run it

```bash
cd infra
ansible-playbook -i inventory/hosts.ini site.yml
```

When it finishes, visit https://{{ domain }} — the request hits host Nginx on 443, which proxies `/` to the React container and `/api/` to the Django container. Certificates renew automatically.

## Notes and tweaks

- Build pipelines: push your Django and React images to a registry (GHCR, Docker Hub) and deploy by tag.
- Static React: If your React image already serves static files via an embedded Nginx, the proxy works the same.
- Healthchecks: add `healthcheck` to services and `location /healthz` in Nginx if useful.
- Logs: use `docker logs` or route to a collector (Loki, etc.).
- Firewalls: open 80/443 only; block 3000/8000 from the internet by binding to 127.0.0.1 (as above).

That’s it — a tidy Ansible starter you can extend with roles for Postgres, Redis, or metrics.
