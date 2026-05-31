# 🌿 Iedereen Mindful 🌿

Welcome to '**Iedereen Mindful**'! 🌟 This web application is designed to promote mindfulness, inner peace, and well-being through various exercises and techniques. Our goal is to help you find more balance and tranquility in your daily life.

This project was developed to support individuals with visual and cognitive impairments by providing an accessible and user-friendly mindfulness platform. The application follows **WCAG 2.1 accessibility guidelines** and is designed to be intuitive, allowing users to practice mindfulness independently or with minimal guidance.

## 📖 Contents

- [🌍 Overview](#-overview)
- [🛠 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
- [🚀 Usage](#-usage)
- [♿ Accessibility Testing](#-accessibility-testing)
- [🔍 Features](#-features)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

## 🌍 Overview

In today's fast-paced world, mindfulness is more important than ever! '**Iedereen Mindful**' offers a collection of mindfulness exercises, guided meditations, and relaxation techniques that are easy to access for everyone. Whether you're a complete beginner or an experienced practitioner, this app is here to support you in integrating mindfulness into your daily routine.

This project was developed in collaboration with **Affect-Us** and **Bartiméus**, focusing on accessibility and usability for people with visual impairments. Extensive research and user testing ensured the app meets the needs of the target audience.

**Key updates in this version:**
- Email encryption: Email addresses are stored encrypted in the database using libsodium + a nonce. An HMAC-SHA256 blind index makes lookups (login, registration, password reset) possible without the email address ever being stored as readable text.
- Course content backup & restore: Admins can download all exercise audio files as a ZIP and restore them later which is essential for server migrations or resets.
- Data export for researchers: Export survey data to CSV or JSON with filtering on date and research group.
- Research groups with customizable questions: Each group can have different mood questions (3–5 answer options) + emoticons. With 5 answer options, an automatic two-step flow is used.
- Favorites & insights for supervisors: Clients can mark exercises as favorites; supervisors can see which exercises are valued by their clients.
- Daily exercise unlock with progress indicator: One new exercise is unlocked each day (provided the previous one has been completed). A progress bar shows where the client left off.
- Progress tracking by supervisors: supervisors can track their clients' progress in real time. When a supervisor goes through an exercise together with a client, the progress is automatically saved to the client's account. Ensuring the administration always stays in sync, with no duplicate or missed registrations.
- Exercise duration indicator: Each exercise shows the estimated time (audio file length + ~1 minute for answering questions).
- Fixed introduction exercise: Always available, with no mood questions or progress tracking which is ideal for new users to learn how the app works.
- WCAG/COGA-based redesign: All client screens have been rebuilt according to Figma wireframes with consistent colors, typography, and active menu highlighting for better orientation.

## 🔍 Features

✅ **Guided mindfulness exercises** 🎧
✅ **Pre- and post-exercise mood tracking** 📊
✅ **Relaxation techniques to reduce stress** 😌
✅ **Accessible design with screen reader support** 🦻
✅ **Customizable settings to fit your needs** 🔧
✅ **Integration with care systems for monitoring progress** 📊
✅ **Designed for visually and cognitively impaired users** 🦮
✅ **Admin panel for managing exercises** ⚙️
✅ **Built with modern technologies:** Laravel, React, MariaDB

## 🛠 Installation

Follow these simple steps to get started with '**Iedereen Mindful**' on your local machine:

1. **Clone the repository:** 🖥️
   ```bash
   git clone https://github.com/Danae02/mindfulness-webapp.git
   ```

2. **Navigate to the project folder:** 📂
   ```bash
   cd iedereen_mindful
   cd iedereen_mindful-main
   ```

3. **Install PHP dependencies via Composer:** 🎼
   ```bash
   composer install
   ```
   *Ensure you have [Composer](https://getcomposer.org/) installed.*

4. **Install JavaScript dependencies via npm:** 📦
   ```bash
   npm install
   ```
   *Make sure you have [Node.js](https://nodejs.org/) and npm installed.*

## ⚙️ Configuration

1. **Create a `.env` file:** 📝
   ```bash
   cp .env.example .env
   ```

2. **Generate an application key:** 🔑
   ```bash
   php artisan key:generate
   ```

3. **Configure your database:** 🗄️
   Open the `.env` file and update your database settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=everyone_mindful
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

4. **Run database migrations:** 🛠️
   ```bash
   php artisan migrate
   ```

### 🔐 Default user accounts

After running the seeders, the following admin account is available. Configure it via `.env` before seeding:

```env
ADMIN_1_EMAIL=your-admin@example.com
ADMIN_1_PASSWORD=your-password
ADMIN_1_NAME=Admin
```

Then run:
```bash
php artisan db:seed
```

> **Note:** Never use weak passwords in a production environment!

### 👤 Creating a Supervisor (Begeleider)

From the admin account you can create new supervisors directly through the interface:

1. Log in with your admin account
2. Go to the **admin dashboard**
3. Click on **"Lijst van alle gebruikers"**
4. Click on the role of the user you want to change, click edit, and select the new role

## 🚀 Usage

Once everything is set up, start your local server with:

```bash
php artisan serve
```

And run the frontend with:
```bash
npm run dev
```

Your application will be available at [http://localhost:8000](http://localhost:8000). 🌱

## ♿ Accessibility Testing

The application is tested for WCAG 2.1 AA compliance using automated tests with [Playwright](https://playwright.dev/) and [axe-core](https://github.com/dequelabs/axe-core). The tests cover all pages and screens for all four user roles (client, admin, supervisor, researcher).

### Requirements

Make sure the following packages are installed:

```bash
npm install
npm install dotenv --save-dev
npx playwright install
```

### Creating test accounts

Add the following variables to your `.env` file with your own values:

```env
TEST_ADMIN_EMAIL=
TEST_ADMIN_PASSWORD=

TEST_CLIENT_EMAIL=
TEST_CLIENT_PASSWORD=

TEST_SUPERVISOR_EMAIL=
TEST_SUPERVISOR_PASSWORD=

TEST_RESEARCHER_EMAIL=
TEST_RESEARCHER_PASSWORD=
```

Then re-seed the database so the test accounts are created:

```bash
php artisan db:seed
```

### Running the tests

Make sure the Laravel server is running in a separate terminal:

```bash
php artisan serve
```

Then run the accessibility tests:

```bash
npx playwright test
```

To see the browser live during testing:

```bash
npx playwright test --headed
```

To generate a visual HTML report with results per test:

```bash
npx playwright test --reporter=html
npx playwright show-report
```

### What is tested?

The tests check all screens for WCAG 2.1 AA violations, per role:

| Role | Screens tested |
|------|---------------|
| Public | Login page, registration page, intro exercise |
| Client | Dashboard, pre-exercise feeling question, audio screen, favourites, profile |
| Admin | Dashboard, add course, data points, users, feeling questions, backup & restore |
| Supervisor | Dashboard, client detail panel |
| Researcher | Feeling measurements, duration log, all data points, export data |

> **Note:** The `aria-roles` rule is disabled in the tests. This is due to a known limitation in the Inertia.js progress bar (`role="bar"`), an external dependency outside the control of this application.

## 🤝 Contributing

We welcome contributions from everyone interested in improving '**Iedereen Mindful**'! 💡 If you have ideas, bug reports, or feature requests, feel free to open an issue or pull request in this repository. 🛠️

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

We hope '**Iedereen Mindful**' helps you create a more balanced, peaceful, and joyful life! 💖✨

Happy Mindfulness! 😊
