# DevScaleSolution — Dockerized Website

A static agency website containerized using **Docker, Nginx, and Docker Compose**. This project demonstrates how to package and run a website in a container and use a bind mount to reflect host-side file changes.

## 🛠️ Technologies Used

- **Docker** — Containerization
- **Nginx** — Web server for static website files
- **Docker Compose** — Container configuration and lifecycle management
- **Bind Mounts** — Sharing website files between the host and container
- **HTML, CSS and JavaScript** — Website technologies
- **Linux** — Development environment

## 🏗️ Architecture

The browser accesses the website through port `8080` on the host. Docker forwards traffic to port `80` inside the Nginx container, which serves the website files.

```text
Browser
   |
   | http://localhost:8080
   v
Docker Port Mapping
Host: 8080 -> Container: 80
   |
   v
Nginx Container
   |
   v
/usr/share/nginx/html
   |
   v
HTML + CSS + JavaScript + Images
```

## 📁 Project Structure

```text
Project/
├── html/
│   └── Website files
├── devscale.Dockerfile
├── docker-compose.yml
└── README.md
```

Place the website's `index.html`, CSS, JavaScript, and image files inside the `html/` directory.

## 🐳 Dockerfile

The `devscale.Dockerfile` uses the official Nginx image and copies the website files into the directory served by Nginx.

```dockerfile
FROM nginx:latest

COPY ./html/ /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]
```

## ⚙️ Docker Compose

The `docker-compose.yml` file defines the website service.

```yaml
services:
  website:
    build:
      context: .
      dockerfile: devscale.Dockerfile
    image: devscale-website
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: unless-stopped
```

### Key Configuration

- **Build:** Builds the image using `devscale.Dockerfile`.
- **Image:** Names the image `devscale-website`.
- **Ports:** Maps host port `8080` to container port `80`.
- **Bind mount:** Maps the host's `html/` directory into Nginx's website directory.
- **Restart policy:** Restarts the container unless it has been explicitly stopped.

## 🚀 Getting Started

### Prerequisites

- Docker installed and running
- Docker Compose plugin

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/devscale-dockerized-website.git
cd devscale-dockerized-website
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Start the application

```bash
docker compose up -d --build
```

### 3. Access the website

Open your browser:

http://localhost:8080

### 4. Check the container

```bash
docker compose ps
docker compose logs
```

### 5. Stop the application

```bash
docker compose down
```

## 💾 Understanding Bind Mounts

This project uses a bind mount:

```yaml
volumes:
  - ./html:/usr/share/nginx/html
```

The host directory `./html` is mounted into the directory Nginx serves inside the container.

**Why use it?**

- Website files can be edited on the host machine.
- Changes to the mounted files are visible to Nginx without rebuilding the image.
- Website source files remain on the host when the container is removed.

**Important:** The bind mount hides the website files copied into that container directory during the image build. This setup is useful for development. A production-style deployment can omit the bind mount and serve the files packaged into the image.

## 📚 What I Learned

- Building a Docker image from a custom Dockerfile
- Running a static website with Nginx
- Mapping host ports to container ports
- Managing a container using Docker Compose
- Using bind mounts for development
- Understanding container lifecycle and restart policies

## 🔮 Future Improvements

- Add a `.dockerignore` file
- Use a pinned Nginx image version instead of `latest`
- Add automated validation and builds with GitHub Actions
- Publish the Docker image to Docker Hub
- Explore cloud deployment and monitoring

## 👨‍💻 Author

- GitHub: https://github.com/dineshanavod

---

This project is part of my ongoing practical learning in Docker, Linux, Cloud Computing, and DevOps.
