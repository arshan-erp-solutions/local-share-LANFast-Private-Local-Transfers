# Local Share – Fast, Private LAN Transfers

**Local Share LAN** is a desktop-friendly web app for **fast and private file transfer over your local network (LAN)**.  
You can send files between devices on the same Wi‑Fi/router or hotspot without uploading anything to the internet.

> Powered by [Arshan ERP Solutions]

---

## 🚀 Key Features

- **Pure LAN transfers (no internet required)**  
  All file transfers happen only inside your local network (router / hotspot). No external cloud server is used.

- **Automatic local IP detection**  
  The app automatically detects your current local IP, whether you are on a router, a PC hotspot, or a different network.  
  When you change networks, the “Your IP” value updates dynamically (e.g. from `192.168.100.x` on a router to `192.168.137.1` on Windows hotspot), without reloading the app.

- **Real-time device discovery**  
  Devices announce themselves over WebSockets, so the available device list updates in real time with online/offline status.

- **Dedicated Sender and Receiver pages**  
  - **Sender page:** Choose files, select a target device, and start a transfer.  
  - **Receiver page:** See incoming transfer requests, accept or reject them, and save files locally.

- **Device status checks (ping)**  
  Each device can be checked via a backend ping endpoint, and the UI shows whether a device is reachable (online) or not (offline).

- **Modern, responsive UI**  
  A clean dark-themed interface with simple navigation, designed for comfortable use on laptops and desktops.

- **Privacy-first design**  
  Files never leave your private network, making it ideal for offices, homes, schools, and offline environments.

---

## 🧠 How It Works (Functional Overview)

### Local IP detection

- The frontend uses a custom hook (for example, `useDevices`) that regularly calls a backend endpoint like `/api/local-ip`.  
- The backend inspects active network interfaces and returns the current local IP of the machine running the server.  
- When you:

  - Turn off your router and enable a PC hotspot, or  
  - Move to a different router / Wi‑Fi network,

  the hook fetches the new IP and updates “Your IP” in the UI within a few seconds.

### Device discovery and real-time updates

- A WebSocket server (e.g. Socket.io) runs on the backend and handles device connect/disconnect events.  
- When a device opens the app:

  - It connects to the WebSocket server.  
  - Sends basic information (device name, IP, mode, etc.).  
  - The backend broadcasts a “device_join” event to all connected clients.

- On the frontend:

  - The app listens for join/leave events.  
  - A shared context (like `DeviceContext`) keeps the global device list in sync.  
  - Sender and Receiver pages render the updated list immediately.

### Device status (online/offline)

- For each device, the frontend can call a backend endpoint such as `/api/device/ping`.  
- A helper like `refreshDeviceStatus(ip)`:

  - Sends a POST request with the target IP.  
  - Marks the device as `online` if the response is OK.  
  - Marks it as `offline` if the request fails or times out.

- The UI shows this as a status badge beside each device in the list.

### File transfer flow

**Sender side:**

1. User opens the Sender page and sees the list of available devices.  
2. User selects the target device and picks one or more files from the file picker.  
3. The app streams file data to the target device via the backend (HTTP/WebSocket) over LAN.

**Receiver side:**

1. The Receiver page listens for incoming transfer requests.  
2. When a sender initiates a transfer, the receiver sees the file name, size, and sender identity.  
3. The user can accept the transfer and save the file locally (download dialog or predefined folder).  
4. Optional: transfer progress and status can be displayed if implemented.

### Network flexibility

- The app is designed to handle changing networks gracefully:

  - Router connected → IP like `192.168.100.17`.  
  - Router off + Windows hotspot → IP like `192.168.137.1`.  
  - Different router → another `192.168.x.x` range.

- The IP shown in “Your IP” adapts to each change automatically using periodic polling from the frontend.

---

## 🧭 Pages and UI

### Sender Page (`/sender`)

- Shows the current local IP (“Your IP”).  
- Displays all discovered devices with names, IP addresses, and online/offline status.  
- Allows selecting files via a file picker (or drag & drop, if implemented).  
- Provides a “Send” button to start the transfer to the selected device.  
- Can optionally show recent transfers or history.

### Receiver Page (`/receiver`)

- Shows the current local IP.  
- Lists incoming transfer requests or displays a popup.  
- Allows users to accept or reject incoming files.  
- Shows transfer progress and result (if implemented).

### Settings Page (`/settings`)

- Provides manual actions like re-discovering devices or refreshing the IP.  
- Optionally shows debug information (last detected IP, backend status, etc.).  
- Includes the app footer with credit and a link:  
  “Powered by Arshan ERP Solutions”.

---

## 🖼 Screenshots

Place your screenshots in a `screenshots/` folder in the repository, and adjust the file names below to match your PNG files. This uses standard Markdown image syntax as recommended for GitHub READMEs. [web:745][web:744][web:747]

### 1. Sender Page

File you will add: `screenshots/sender-page.png`

```md

```

### 2. Receiver Page

File you will add: `screenshots/receiver-page.png`

```md

```

### 3. Settings / IP Detection

File you will add: `screenshots/settings-ip-detection.png`

```md


```


## 🔒 Privacy and Usage

- All transfers happen inside your LAN or Wi‑Fi network.  
- The local IP is used only for routing traffic between devices on the same network.  
- For production or business environments, it is recommended to:

  - Run the backend on a trusted machine.  
  - Limit access to your internal network or VPN.  
  - Add authentication or access control if many people share the same network.

---

## 📞 Installation & Commercial Use

The source code in this repository is shared for **learning, testing, and evaluation**.  
If you want:

- A full installation on your office or company network,  
- Custom features, branding, or integration with other systems,

please contact:

**Arshan ERP Solutions**  
**Name:** Muhammad Arshan  

- WhatsApp / Phone: `+92 323 9385714`  
- Email: `Khanarshan750@gmail.com`

---

## 📄 License

This project is shared for **learning and evaluation purposes**.  
For commercial deployment or business use, please contact **Arshan ERP Solutions**.

> © 2026 Arshan ERP Solutions. All rights reserved.
