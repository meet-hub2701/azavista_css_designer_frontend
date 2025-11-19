export const eventLandingTemplate = {
  id: 'event-landing',
  name: 'Event Landing Page',
  description: 'Perfect for conferences, workshops, and events',
  thumbnail: '/templates/event-landing.png',
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{eventName}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">{{eventName}}</div>
            <ul class="nav-links">
                <li><a href="#about">About</a></li>
                <li><a href="#schedule">Schedule</a></li>
                <li><a href="#speakers">Speakers</a></li>
                <li><a href="#register">Register</a></li>
            </ul>
        </div>
    </nav>

    <section class="hero">
        <div class="container">
            <h1>{{eventName}}</h1>
            <p class="subtitle">{{eventTagline}}</p>
            <div class="event-details">
                <span>📅 {{eventDate}}</span>
                <span>📍 {{eventLocation}}</span>
            </div>
            <button class="btn btn-primary">Register Now</button>
        </div>
    </section>

    <section id="about" class="section">
        <div class="container">
            <h2>About the Event</h2>
            <p>{{aboutText}}</p>
        </div>
    </section>

    <section id="schedule" class="section bg-light">
        <div class="container">
            <h2>Event Schedule</h2>
            <div class="schedule-grid">
                <div class="schedule-item card">
                    <div class="time">9:00 AM</div>
                    <h3>Registration & Breakfast</h3>
                    <p>Check-in and networking</p>
                </div>
                <div class="schedule-item card">
                    <div class="time">10:00 AM</div>
                    <h3>Opening Keynote</h3>
                    <p>Welcome address and introduction</p>
                </div>
                <div class="schedule-item card">
                    <div class="time">11:30 AM</div>
                    <h3>Panel Discussion</h3>
                    <p>Industry experts share insights</p>
                </div>
                <div class="schedule-item card">
                    <div class="time">1:00 PM</div>
                    <h3>Lunch Break</h3>
                    <p>Networking and refreshments</p>
                </div>
            </div>
        </div>
    </section>

    <section id="speakers" class="section">
        <div class="container">
            <h2>Featured Speakers</h2>
            <div class="speakers-grid">
                <div class="speaker-card card">
                    <div class="speaker-avatar">JS</div>
                    <h3>John Smith</h3>
                    <p class="speaker-title">CEO, Tech Corp</p>
                </div>
                <div class="speaker-card card">
                    <div class="speaker-avatar">SD</div>
                    <h3>Sarah Davis</h3>
                    <p class="speaker-title">CTO, Innovation Labs</p>
                </div>
                <div class="speaker-card card">
                    <div class="speaker-avatar">MJ</div>
                    <h3>Michael Johnson</h3>
                    <p class="speaker-title">Founder, StartupX</p>
                </div>
            </div>
        </div>
    </section>

    <section id="register" class="section bg-light">
        <div class="container">
            <h2>Register Now</h2>
            <form class="register-form">
                <input type="text" placeholder="Full Name" class="form-input">
                <input type="email" placeholder="Email Address" class="form-input">
                <input type="tel" placeholder="Phone Number" class="form-input">
                <select class="form-input">
                    <option>Select Ticket Type</option>
                    <option>Early Bird - $99</option>
                    <option>Regular - $149</option>
                    <option>VIP - $299</option>
                </select>
                <button type="submit" class="btn btn-primary">Complete Registration</button>
            </form>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 {{eventName}}. All rights reserved.</p>
            <div class="social-links">
                <a href="#">Twitter</a>
                <a href="#">LinkedIn</a>
                <a href="#">Facebook</a>
            </div>
        </div>
    </footer>
</body>
</html>
  `,
  defaultContent: {
    eventName: 'Tech Summit 2024',
    eventTagline: 'Join us for the biggest tech conference of the year',
    eventDate: 'March 15-17, 2024',
    eventLocation: 'San Francisco, CA',
    aboutText: 'Tech Summit brings together industry leaders, innovators, and enthusiasts for three days of learning, networking, and inspiration. Discover the latest trends, technologies, and best practices shaping the future of technology.',
  },
};
