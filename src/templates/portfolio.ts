export const portfolioTemplate = {
  id: 'portfolio',
  name: 'Portfolio Website',
  description: 'Showcase your work and skills',
  thumbnail: '/templates/portfolio.png',
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}} - Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">{{name}}</div>
            <ul class="nav-links">
                <li><a href="#about">About</a></li>
                <li><a href="#work">Work</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section class="hero">
        <div class="container">
            <h1>Hi, I'm {{name}}</h1>
            <p class="subtitle">{{title}}</p>
            <p>{{bio}}</p>
            <button class="btn btn-primary">View My Work</button>
        </div>
    </section>

    <section id="work" class="section">
        <div class="container">
            <h2>Featured Projects</h2>
            <div class="projects-grid">
                <div class="project-card card">
                    <div class="project-image">Project 1</div>
                    <h3>E-Commerce Platform</h3>
                    <p>A full-stack online shopping solution</p>
                </div>
                <div class="project-card card">
                    <div class="project-image">Project 2</div>
                    <h3>Mobile App</h3>
                    <p>iOS and Android fitness tracking app</p>
                </div>
                <div class="project-card card">
                    <div class="project-image">Project 3</div>
                    <h3>Dashboard Design</h3>
                    <p>Analytics dashboard for SaaS product</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="section bg-light">
        <div class="container">
            <h2>Get In Touch</h2>
            <form class="contact-form">
                <input type="text" placeholder="Your Name" class="form-input">
                <input type="email" placeholder="Your Email" class="form-input">
                <textarea placeholder="Your Message" class="form-input" rows="5"></textarea>
                <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 {{name}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
  `,
  defaultContent: {
    name: 'Alex Johnson',
    title: 'Full Stack Developer & Designer',
    bio: 'I create beautiful, functional websites and applications that solve real problems.',
  },
};
