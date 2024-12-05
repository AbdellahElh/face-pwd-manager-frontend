# Web Browser Password Manager with Face Authentication

This project is a browser-based password management application enhanced with facial recognition technology. Users can authenticate themselves by positioning their face in front of the webcam, after which they can securely store, retrieve, and manage passwords. The application leverages [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face recognition and uses encryption for password storage.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Security Considerations](#security-considerations)
- [Recommended Practices](#recommended-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Face Recognition Authentication:**  
  Users are authenticated via their webcam. After the face models load and the user’s face matches the stored descriptor, access is granted to the password manager.
- **Secure Password Storage:**  
  Passwords are encrypted before being stored (e.g., using `crypto-js`) and can be safely retrieved only after successful authentication.

- **User-Friendly Interface:**  
  A simple, clean UI allows you to add, view, and manage stored passwords with ease.

- **Local-Only Operation:**  
  All data (face descriptors, encrypted passwords) is stored locally in the browser, ensuring that no sensitive information leaves your machine.

## Prerequisites

- **Node.js & npm:**  
  Ensure that you have Node.js (LTS version recommended) and npm installed on your system.

- **Modern Browser:**  
  A recent version of Chrome, Firefox, or Edge is required for `getUserMedia` and webcam access.  
  Note: HTTPS or `localhost` is often required for webcam permissions.

- **Webcam:**  
  A working webcam is necessary for face recognition.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/web-browser-pwd-manager-face-auth.git
   cd web-browser-pwd-manager-face-auth
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Build the frontend:**

   ```bash
   npm run build
   ```

or, for development with hot-reloading:

```bash
npm run dev
```

## Configuration

- **Face Recognition Models:**
  Download the required face-api.js models and place them in a `/models` directory in the `public` folder. For example:
  ```arduino
  public/
  models/
    face_recognition_model-weights_manifest.json
    face_recognition_model-shard1
    ssd_mobilenetv1_model-weights_manifest.json
    ssd_mobilenetv1_model-shard1
    face_landmark_68_model-weights_manifest.json
    face_landmark_68_model-shard1
  images/
    user1.jpg
  ```

## Security Considerations

- **Local Encryption:**  
  Passwords are encrypted before storage to prevent easy reading even if someone opens Developer Tools.
- **No Server Storage:**  
  Since everything runs locally, the risk of server-side breaches is eliminated. However, if someone gains physical access to your machine, they might still attempt to extract passwords.

- **Use HTTPS in Production:**  
  For webcam access and security, serve the application over HTTPS. Modern browsers often require a secure context for `getUserMedia`.

## Recommended Practices

- **Optimize Reference Image:**  
  Use a high-quality, well-lit image for face recognition (`user1.jpg`). Consider resizing and compressing it to improve performance.

- **Improve Performance:**
  Experiment with shorter detection intervals (e.g., 300-500ms) for faster authentication but be mindful of CPU usage.

- **Regular Backups:**
  While local storage is convenient, consider exporting your encrypted passwords periodically.

## Troubleshooting

- **Webcam Not Accessible:**  
  Check browser permissions. For local development, try `localhost` or a secure context (`https://127.0.0.1`).

- **Authentication Slow or Inaccurate:**

  - Ensure good lighting and face visibility.
  - Try a clearer reference image.
  - Increase CPU/GPU power (close background apps) or reduce image size.

- **No `'play'` Event Triggered:**
  If face recognition doesn’t start, ensure that:
  - The video element is correctly referenced by `videoRef`.
  - The `FaceRecognition` component checks if the video is already playing.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub. Ensure that your code passes lint checks and that you’ve tested your changes thoroughly before proposing them.

## License

This project is licensed under the [MIT License](LICENSE), meaning you are free to use, modify, and distribute it as you please.

---

**Enjoy the convenience and security of managing your passwords with face authentication!**
