# 🌿 Iedereen Mindful 🌿

Welcome to '**Iedereen Mindful**'! 🌟 This web application is designed to promote mindfulness, inner peace, and well-being through various exercises and techniques. Our goal is to help you find more balance and tranquility in your daily life.

This project was developed to support individuals with visual and cognitive impairments by providing an accessible and user-friendly mindfulness platform. The application follows **WCAG 2.1 accessibility guidelines** and is designed to be intuitive, allowing users to practice mindfulness independently or with minimal guidance.

## 📖 Contents

- [🌍 Overview](#-overview)
- [🛠 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
- [🚀 Usage](#-usage)
- [🔍 Features](#-features)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

## 🌍 Overview

In today's fast-paced world, mindfulness is more important than ever! '**Iedereen Mindful**' offers a collection of mindfulness exercises, guided meditations, and relaxation techniques that are easy to access for everyone. Whether you're a complete beginner or an experienced practitioner, this app is here to support you in integrating mindfulness into your daily routine.

This project was developed in collaboration with **Affect-Us** and **Bartiméus**, focusing on accessibility and usability for people with visual impairments. Extensive research and user testing ensured the app meets the needs of the target audience.

## 🔍 Features

✅ **Guided mindfulness exercises** 🎧
✅ **Relaxation techniques to reduce stress** 😌
✅ **Accessible design with screen reader support** 🦻
✅ **Speech-controlled navigation for ease of use** 🗣️
✅ **Customizable settings to fit your needs** 🔧
✅ **Integration with care systems for monitoring progress** 📊
✅ **Designed for visually and cognitively impaired users** 🦮
✅ **Available for both beginners and advanced users** 🚀

## 🛠 Installation

Follow these simple steps to get started with '**Everyone Mindful**' on your local machine:

1. **Clone the repository:** 🖥️
   ```bash
   git clone https://github.com/DaanFrankhuizen/iedereen_mindful.git
   ```

2. **Navigate to the project folder:** 📂
   ```bash
   cd iedereen_mindful
   ```
cd iedereen_mindful-main
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

## 🚀 Usage

Once everything is set up, start your local server with:

```bash
php artisan serve
```

And run npm with
```bash
npm run dev
```

Your application will be available at [http://localhost:8000](http://localhost:8000). Open this link in your browser and start your mindfulness journey today! 🌱

## 🤝 Contributing

We welcome contributions from everyone interested in improving '**Everyone Mindful**'! 💡 If you have ideas, bug reports, or feature requests, feel free to open an issue or pull request in this repository. 🛠️

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

We hope '**Iedereen Mindful**' helps you create a more balanced, peaceful, and joyful life! 💖✨

Happy Mindfulness! 🌿😊
