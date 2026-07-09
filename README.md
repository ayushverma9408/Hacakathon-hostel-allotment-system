# HOSTEL ALLOTMENT SYSTEM

A modern, full-featured hostel allotment system built with **SvelteKit** that automates the process of assigning participants to hostel rooms based on gender and capacity constraints. Upload participant and hostel data via Excel/CSV, and the system intelligently allocates rooms while managing capacity and generating a downloadable allocation report.

<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/8b6ebf7e-42f5-40c0-8f17-0fd3970fbe26" />

---

## ✨ Key Features

- **Dynamic Gender-Based Matching** — Automatically separates participants by gender and assigns them to matching hostel types
- **Capacity Management** — Tracks occupancy per room to ensure no overallocation
- **Waitlist Handling** — Flags unallocated participants when rooms are exhausted
- **Instant Preview** — Verify allocations in a live preview table before export
- **Excel Import/Export** — Upload .xlsx or .csv files and download results in Excel format
- **Responsive UI** — Modern, mobile-friendly interface built with Tailwind CSS
- **Type-Safe** — Full TypeScript support for robust development

<img width="1148" height="1751" alt="image" src="https://github.com/user-attachments/assets/2b501137-2464-481f-82dc-54cf5b2fa1a9" />

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | SvelteKit |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Spreadsheet Processing** | xlsx (SheetJS) |
| **State Management** | Svelte Stores |

---

## 📋 Prerequisites

- **Node.js** v16+ (v18+ recommended)
- **npm** v7+ or **pnpm** v6+
- A modern web browser (Chrome, Firefox, Safari, Edge)

---

<img width="2030" height="1406" alt="image" src="https://github.com/user-attachments/assets/e9c4fcb1-d822-4bc1-b59d-2beaa63f1b55" />

---

<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/8b6ebf7e-42f5-40c0-8f17-0fd3970fbe26" />

---

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushverma9408/Hcakathon-hostel-allotment-system.git
   cd Hcakathon-hostel-allotment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Usage

1. **Prepare your data files:**
   - **Participants Sheet** (.xlsx or .csv) — Must include columns: `Name`, `Gender`
   - **Hostels Sheet** (.xlsx or .csv) — Must include columns: `Hostel Type`, `Room Number`, `Capacity`

2. **Upload files** — Use the file upload interface to select participant and hostel data

3. **Review allocation** — Check the preview table to verify room assignments

4. **Export results** — Download the allocation report as an Excel file

---

## 🏗 Architecture

### Technical Architecture

The system is built on a client-side architecture that prioritizes performance and user control:

- **Frontend Framework**: SvelteKit with TypeScript for type safety and reactivity
- **Styling**: Tailwind CSS for a responsive, modern UI
- **Spreadsheet Engine**: xlsx (SheetJS) for handling .xlsx and .csv file parsing
- **State Management**: Svelte stores for managing participant and hostel data during the session

### Core Logic Implementation

The allocation algorithm intelligently matches participants to available rooms based on gender and capacity constraints.

#### A. Parsing Logic

The system reads the hostel sheet into an array of objects:
- If `Capacity` is absent, it defaults to 1
- Each room entry is expanded into individual available slots
- Participants are similarly parsed with their attributes

#### B. Allocation Algorithm

The engine performs the following matching process:

$$\text{Allotment}(P_i) = R_j \iff \text{Gender}(P_i) = \text{Type}(R_j) \land \text{Occupancy}(R_j) < \text{Capacity}(R_j)$$

Where:
- $P$ = participant set
- $R$ = room set
- Gender must match hostel type
- Current occupancy must be below capacity

**Allocation Flow:**
1. Parse and validate input files
2. Separate participants by gender
3. Filter available rooms by type
4. Sequentially assign participants to matching rooms
5. Flag unallocated participants as waitlisted

---

## 📊 Features Status

| Feature | Implementation | Status |
|---------|---|--------|
| Excel Upload | FileReader + xlsx.read | ✅ |
| Gender-Based Allocation | Filtered room selection | ✅ |
| Capacity Constraints | Reactive occupancy counter | ✅ |
| Excel Export | xlsx.writeFile | ✅ |
| Responsive UI | Tailwind Flex/Grid Layouts | ✅ |
| Waitlist Management | Unallocated participant tracking | ✅ |
| Live Preview | Interactive allocation table | ✅ |

---

## 📁 Project Structure

```
src/
├── routes/
│   ├── +page.svelte          # Main allocation interface
│   └── +page.ts              # Server-side logic (if any)
├── lib/
│   ├── components/           # Reusable UI components
│   ├── stores/              # Svelte stores for state management
│   └── utils/               # Utility functions (allocation logic, parsing)
└── app.css                   # Global styles
```

---

## 🔧 Development

### Build for Production

```bash
npm run build
npm run preview
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

---

## 📝 Input File Format

### Participants File (.xlsx or .csv)

| Name | Gender | Email (Optional) |
|------|--------|-----------------|
| John Doe | Male | john@example.com |
| Jane Smith | Female | jane@example.com |

### Hostels File (.xlsx or .csv)

| Hostel Type | Room Number | Capacity |
|------------|------------|----------|
| Male | M101 | 2 |
| Female | F201 | 3 |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 💡 Future Enhancements

- [ ] Support for additional allocation criteria (floor preference, room type)
- [ ] Database integration for persistent storage
- [ ] Advanced reporting and analytics
- [ ] API endpoint for programmatic access
- [ ] Multi-language support

---

## 📧 Support

For issues, questions, or feature requests, please open an [issue](https://github.com/ayushverma9408/Hcakathon-hostel-allotment-system/issues) on GitHub.

---

**Made with ❤️ by the **ayushverma9408** **
