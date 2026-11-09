// scripts/generate_ict_qa.cjs
// Comprehensive question-and-answer dataset for Grade 7 ICT: Computer Systems and Digital Devices
// Aligned strictly with ZIMSEC HBC Syllabus

const ictQA = [
  // 1. Digital Devices & Parts of a Computer
  {
    id: "ict_digital_devices_and_parts",
    topic: "Digital devices and parts of a computer",
    section: "ICT: Computer systems and digital devices",
    question: "identify common digital devices state what each device is used for tell input devices from output devices name the main hardware parts of a computer explain what the processor, memory and storage do tell hardware from software",
    normalizedQuestions: [
      "identify common digital devices",
      "tell input devices from output devices",
      "name the main hardware parts of a computer",
      "what the processor memory and storage do",
      "tell hardware from software",
      "digital devices grade 7"
    ],
    answer: `### Digital Devices, Input/Output, and Computer Hardware

#### 1. Common Digital Devices:
- **Smartphone:** Portable handheld computer used for phone calls, internet browsing, mobile banking (EcoCash), and messaging.
- **Laptop / Desktop Computer:** Powerful computing devices used for typing documents, data analysis, coding, and graphic design.
- **Tablet:** Touchscreen device ideal for e-learning, reading digital textbooks, and drawing.
- **Smartwatch:** Wearable device tracking health metrics (heart rate, step count) and notifications.
- **Barcode / QR Scanner:** Optical device used in supermarkets to read product prices instantly.

#### 2. Input Devices vs Output Devices:
- **Input Devices:** Hardware used to enter raw data and instructions into a computer.
  - *Examples:* Keyboard (typing text), Mouse (pointing/clicking), Microphone (audio recording), Scanner (converting physical documents to digital), Webcam (video input).
- **Output Devices:** Hardware that presents processed data (information) to the user.
  - *Examples:* Monitor / Screen (visual display), Printer (hard copy on paper), Speakers and Headphones (audio output), Projector (displaying large visuals).

#### 3. Main Hardware Parts of a Computer:
- **CPU (Central Processing Unit / Processor):** The "brain" of the computer that carries out instructions, performs arithmetic calculations, and controls all other components.
- **RAM (Random Access Memory / Main Memory):** High-speed temporary working memory that holds currently active programs and data while the computer is turned on. Data is lost when powered off (volatile).
- **Storage (Hard Drive / SSD / ROM):** Non-volatile permanent storage that retains the operating system, installed applications, and personal files even when the computer is turned off.
- **Motherboard:** The main circuit board that connects and allows communication between the CPU, RAM, storage, and peripheral devices.

#### 4. Hardware vs Software:
- **Hardware:** The physical, tangible electronic components of a computer system that you can touch and see (e.g. keyboard, monitor, hard drive).
- **Software:** The intangible set of programs, instructions, and operating procedures that tell the hardware what to do (e.g. Windows operating system, Microsoft Word, web browsers, mobile apps).`,
    keywords: ["digital devices", "input and output devices", "parts of a computer", "processor memory storage", "hardware vs software"]
  },

  // 2. Caring for Devices, Files, Folders, and Storage
  {
    id: "ict_caring_for_devices_files_storage",
    topic: "Caring for devices, Files and folders, Storing and sharing data",
    section: "ICT: Computer systems and digital devices",
    question: "explain how to look after digital devices use a device safely state the effects of heat, water and dust on devices create, name and move files organise work in folders compare ways of storing data explain what a backup is",
    normalizedQuestions: [
      "how to look after digital devices",
      "effects of heat water and dust on devices",
      "create name and move files",
      "organise work in folders",
      "ways of storing data and backup",
      "caring for computers"
    ],
    answer: `### Caring for Devices, File Management, and Data Storage

#### 1. Caring for Digital Devices:
- Keep food and liquids away from keyboards and screens.
- Avoid exposing devices to direct sunlight or hot car interiors.
- Shut down computers properly using the operating system menu; never pull out the power cord while running.
- Use surge protectors to guard against electricity fluctuations and lightning strikes.
- Clean screens and keyboards with a soft, dry lint-free microfiber cloth.

#### 2. Effects of Heat, Water, and Dust on Devices:
- **Excessive Heat:** Causes the CPU to overheat, leading to unexpected shutdowns, hardware throttling, and permanent battery degradation.
- **Water / Moisture:** Causes short circuits in electronic circuit boards, severe corrosion, and permanent electrical failure.
- **Dust:** Clogs cooling fans and air vents, trapping heat inside the computer and causing mechanical component failure.

#### 3. Files and Folders Management:
- **File:** A digital container storing data (text, image, audio, video) identified by a name and extension (e.g., *Science_Notes.docx*, *Family_Photo.jpg*).
- **Folder (Directory):** A virtual container used to group and organize related files systematically.
- **Best Practices:** Use descriptive file names (e.g., *Grade7_Maths_Homework_Nov2026*); create subject folders (English, Maths, Science); regularly delete obsolete files to free storage space.

#### 4. Data Storage and Backups:
- **Storage Media:** Internal SSD/HDD (fast, large capacity), USB Flash Drives (portable, convenient), Cloud Storage like Google Drive / OneDrive (accessible anywhere with internet).
- **What is a Backup?** A backup is a duplicate copy of important digital files saved on a separate secondary storage device or cloud platform, ensuring files can be recovered if the primary device is stolen, broken, or infected by malware.`,
    keywords: ["caring for digital devices", "effects of dust heat water", "files and folders", "what is a backup", "data storage"]
  },

  // 3. Productivity Tools: Word Processing, Spreadsheets, Presentations
  {
    id: "ict_productivity_word_spreadsheets_presentations",
    topic: "Word processing, Spreadsheets, Presentations",
    section: "ICT: Computer systems and digital devices",
    question: "create and edit a document format text save and print a document describe rows, columns and cells enter data and simple formulas make a simple chart plan a short presentation add text and pictures to slides",
    normalizedQuestions: [
      "create and edit a document",
      "format text save and print",
      "rows columns cells and formulas",
      "make a simple chart in spreadsheets",
      "plan a presentation in powerpoint",
      "word processing spreadsheets presentations"
    ],
    answer: `### Word Processing, Spreadsheets, and Presentations

#### 1. Word Processing (e.g. Microsoft Word, Google Docs):
- **Creating & Editing:** Typing text, using Backspace/Delete to correct typos, and using Cut, Copy, and Paste (*Ctrl+X, Ctrl+C, Ctrl+V*).
- **Text Formatting:** Changing font type and size; applying **Bold** (*Ctrl+B*), *Italic* (*Ctrl+I*), and <u>Underline</u> (*Ctrl+U*); setting line spacing and text alignment (Left, Center, Right, Justified).
- **Saving & Printing:** Saving documents regularly (*Ctrl+S*) in formats like *.docx* or *.pdf*; previewing before printing (*Ctrl+P*) to verify margins.

#### 2. Spreadsheets (e.g. Microsoft Excel, Google Sheets):
- **Structure:**
  - **Rows:** Horizontal lines of data identified by numbers (1, 2, 3...).
  - **Columns:** Vertical sections of data identified by letters (A, B, C...).
  - **Cell:** The intersection of a row and a column identified by a unique cell address (e.g., **B4** is column B, row 4).
- **Formulas:** Always begin with an equals sign (**=**):
  - Addition: \`=A1 + B1\`
  - Sum: \`=SUM(A1:A10)\` (calculates total of a range)
  - Average: \`=AVERAGE(B1:B5)\`
- **Charts:** Selecting numeric data and inserting visual Bar Charts, Column Charts, or Pie Charts to represent trends clearly.

#### 3. Presentations (e.g. Microsoft PowerPoint, Google Slides):
- **Planning:** Defining the presentation theme, keeping bullet points short (rule of 6 lines per slide), and selecting high-contrast colors.
- **Building Slides:** Adding slide titles, concise text boxes, relevant pictures/diagrams, and clean slide transitions.
- **Presenting:** Running the full-screen Slide Show (*F5*), making eye contact with the audience, and speaking clearly without reading directly off the screen.`,
    keywords: ["word processing", "spreadsheets", "rows columns cells", "excel formulas", "presentations", "powerpoint"]
  },

  // 4. Cybersecurity, Passwords, Malware, Online Safety
  {
    id: "ict_cybersecurity_passwords_malware_privacy",
    topic: "Passwords and accounts, Malware and antivirus, Safe and respectful online behaviour, Privacy and personal data",
    section: "ICT: Computer systems and digital devices",
    question: "make a strong password keep passwords private log out of shared devices say what a computer virus is name ways viruses spread protect a device from malware behave kindly and safely online recognise cyberbullying explain what personal information is",
    normalizedQuestions: [
      "make a strong password",
      "keep passwords private",
      "what is a computer virus",
      "ways viruses spread and protect from malware",
      "safe online behaviour and cyberbullying",
      "privacy and personal data",
      "cybersecurity grade 7"
    ],
    answer: `### Cybersecurity, Strong Passwords, Malware, and Online Safety

#### 1. Passwords and Account Security:
- **Strong Password Rules:** At least 8 to 12 characters long; combines uppercase letters (A–Z), lowercase letters (a–z), numbers (0–9), and special symbols (@, #, $, !). Example: \`Zimb@bwe#2026\`.
- **Password Privacy:** Never share passwords with friends or write them on sticky notes attached to monitors.
- **Shared Devices:** Always remember to **Log Out / Sign Out** of email, e-learning platforms, or social accounts on school or internet café computers.

#### 2. Computer Malware and Antivirus Protection:
- **What is a Computer Virus?** A malicious software program (malware) written to copy itself, corrupt files, steal private data, or slow down computer operations.
- **How Malware Spreads:**
  - Inserting infected USB flash drives into a computer.
  - Clicking suspicious email attachments or phishing links.
  - Downloading pirated movies, games, or unverified software from unsafe websites.
- **Protecting Devices:** Installing reliable antivirus software (e.g. Windows Defender); updating antivirus definitions regularly; scanning external flash drives before opening files.

#### 3. Safe Online Behaviour and Cyberbullying:
- **Netiquette:** Communicating politely, refraining from offensive language, and avoiding writing in ALL CAPS (which implies shouting).
- **Cyberbullying:** Using digital devices, messaging apps, or social media to intimidate, threaten, humiliate, or spread lies about another person.
- **Responding to Cyberbullying:** Do NOT reply or retaliate; take screenshots as evidence; block the bully; report the incident immediately to parents or teachers.

#### 4. Personal Information and Online Privacy:
- **Personal Identifiable Information (PII):** Full legal name, date of birth, home address, phone number, school name, and parents' banking details.
- **Privacy Rule:** Never share personal identifiable information with online strangers. Privacy protects you from identity theft, scams, and physical endangerment.`,
    keywords: ["strong password", "computer virus", "malware and antivirus", "cyberbullying", "privacy and personal data", "online safety"]
  },

  // 5. The Internet, Email, Mobile Technology, Digital Payments
  {
    id: "ict_internet_email_mobile_payments",
    topic: "The internet and the web, Email and messaging, Mobile technology and digital payments",
    section: "ICT: Computer systems and digital devices",
    question: "say what the internet is tell the internet from the web name ways to connect send and read an email write a clear email describe uses of a smartphone explain mobile money use mobile money safely",
    normalizedQuestions: [
      "what the internet is",
      "tell the internet from the web",
      "send and read an email",
      "uses of a smartphone",
      "explain mobile money and use safely",
      "internet vs web",
      "ecocash mobile money"
    ],
    answer: `### The Internet, Email, and Mobile Money

#### 1. The Internet vs The World Wide Web:
- **The Internet:** The global physical network of billions of interconnected computers, servers, cables, and satellites communicating via standardized protocols (TCP/IP).
- **The World Wide Web (WWW / Web):** A vast collection of digital web pages, documents, pictures, and videos hosted on the internet and viewed using a web browser (Google Chrome, Mozilla Firefox). *The internet is the highway; the web is the traffic moving on it.*
- **Ways to Connect:** Wi-Fi wireless networks, fiber optic cables, and cellular mobile data (3G, 4G, 5G).

#### 2. Email Communication:
- **Parts of an Email:**
  - **To:** The recipient's email address (e.g., \`teacher@school.ac.zw\`).
  - **Subject:** A brief, clear summary of the email topic (e.g., *Grade 7 History Assignment*).
  - **Body:** The polite message containing greeting, clear message, and closing signature.
  - **Attachment:** Attaching external files (documents, images) using the paperclip icon.

#### 3. Mobile Technology and Digital Payments (Mobile Money):
- **Smartphone Uses:** Voice/video calls, WhatsApp messaging, studying educational apps, GPS navigation, photography, and mobile banking.
- **What is Mobile Money?** A digital financial service that allows users to deposit, send, receive, and store money, and pay for goods and utility bills using a mobile phone SIM card (e.g., **EcoCash**, **OneMoney**, **Telecash**).
- **Using Mobile Money Safely:**
  - Keep your 4-digit secret PIN private; never share your PIN with mobile money agents or strangers.
  - Always double-check the recipient's phone number and registered name before confirming payments.
  - Beware of fraudulent scam SMS messages claiming you have won prizes or sent money by mistake.`,
    keywords: ["the internet and the web", "send an email", "smartphone uses", "mobile money", "ecocash", "mobile payments safety"]
  },

  // 6. Artificial Intelligence (AI) and Responsible Use
  {
    id: "ict_artificial_intelligence_and_responsible_use",
    topic: "What artificial intelligence is, Applications of artificial intelligence, Using AI responsibly",
    section: "ICT: Computer systems and digital devices",
    question: "define artificial intelligence explain how AI learns from data tell AI from ordinary programs give examples of AI in daily life describe uses of AI in farming, health and school explain the risks of AI check AI answers protect private data when using AI",
    normalizedQuestions: [
      "define artificial intelligence",
      "how AI learns from data",
      "tell AI from ordinary programs",
      "examples of AI in daily life",
      "AI in farming health and school",
      "risks of AI and check AI answers",
      "responsible use of AI"
    ],
    answer: `### Artificial Intelligence (AI) and Responsible Usage

#### 1. What is Artificial Intelligence (AI)?
**Artificial Intelligence (AI)** is the simulation of human intelligence by computer systems and software, enabling machines to learn, reason, solve complex problems, recognize speech, and make predictions.
- **How AI Learns:** AI uses Machine Learning algorithms trained on vast datasets. It detects patterns, adjusts mathematical weights, and improves accuracy through experience without being explicitly hardcoded for every single task.
- **AI vs Ordinary Programs:** Ordinary programs follow rigid, pre-written "if-this-then-that" rules and cannot handle unfamiliar variations. AI analyzes new, unseen data, adapts, and generates novel solutions.

#### 2. Applications of AI:
- **In Daily Life:** Smartphone face-unlock, voice assistants (Siri, Google Assistant), autocomplete text suggestions, streaming recommendation algorithms (YouTube, Netflix).
- **In Farming (Agriculture):** Drone aerial cameras using AI image recognition to detect crop diseases and weed infestations; automated irrigation systems adjusting water based on soil moisture data.
- **In Healthcare:** AI software analyzing X-rays and MRI scans to assist doctors in diagnosing tuberculosis and cancer early.
- **In School (Education):** Personalized tutoring apps that adapt difficulty to a learner's individual pace; instant translation between languages.

#### 3. Risks and Responsible Use of AI:
- **AI Hallucinations / Errors:** AI can generate convincing but completely incorrect or fabricated facts. **Always verify AI answers** using approved ZIMSEC textbooks and teacher guidance.
- **Data Privacy Risks:** Never enter private personal information (names, home addresses, phone numbers) into online AI tools, as input data may be stored on public servers.
- **Academic Integrity:** Use AI as a study assistant to clarify difficult concepts, not to cheat or copy homework essays directly (plagiarism).`,
    keywords: ["artificial intelligence", "define AI", "how AI learns", "AI applications in farming health school", "risks of AI", "responsible use of AI"]
  },

  // 7. Algorithms, Block Coding, Robotics, Design Process, Careers
  {
    id: "ict_algorithms_coding_robotics_careers",
    topic: "Algorithms, Block coding, Robotics, The design process, ICT careers",
    section: "ICT: Computer systems and digital devices",
    question: "define an algorithm write steps in the right order find a mistake in an algorithm use loops, conditions and variables in blocks predict what a program will do say what a robot is name the parts of a robot list the stages of the design process name careers that use ICT",
    normalizedQuestions: [
      "define an algorithm",
      "block coding loops conditions variables",
      "what a robot is and parts of a robot",
      "stages of the design process",
      "careers that use ICT",
      "algorithms coding robotics"
    ],
    answer: `### Algorithms, Block Coding, Robotics, and ICT Careers

#### 1. Algorithms:
- **Definition:** An **algorithm** is a precise, step-by-step sequence of clear instructions designed to solve a specific problem or complete a task.
- **Characteristics:** Unambiguous, sequentially ordered, and has a defined start and finish.
- **Example (Algorithm to Make Tea):**
  1. Boil clean water in a kettle.
  2. Place a teabag into a clean cup.
  3. Pour boiling water into the cup.
  4. Stir and allow to brew for 2 minutes.
  5. Remove teabag, add sugar and milk, stir, and serve.
- **Debugging:** Identifying and fixing errors (bugs) in an algorithm when the output is incorrect.

#### 2. Block Coding (e.g. Scratch, Blockly):
- **Visual Blocks:** Connecting visual drag-and-drop code puzzle pieces rather than typing complex syntax.
- **Loops (Iteration):** Instructions that repeat actions multiple times (e.g. \`repeat 10 times\`, \`forever\`).
- **Conditionals (Selection):** Decision-making blocks that execute only when a condition is met (e.g. \`if touching obstacle then turn 90 degrees\`).
- **Variables:** Named digital storage containers that store changing values (e.g. \`Score = 0\`).

#### 3. Robotics:
- **What is a Robot?** A programmable electro-mechanical machine capable of carrying out complex actions automatically.
- **Main Parts of a Robot:**
  - **Sensors:** Act as the robot's senses (ultrasonic distance sensors, light sensors, temperature sensors).
  - **Controller (Microprocessor):** The computer "brain" that processes sensor inputs and executes program instructions.
  - **Actuators & Motors:** The "muscles" that produce physical movement (wheels, robotic arms, grippers).
  - **Power Source:** Rechargeable battery pack providing electrical energy.

#### 4. The Engineering Design Process:
1. **Ask / Identify:** Define the problem and constraints.
2. **Imagine / Brainstorm:** Research and generate multiple creative solutions.
3. **Plan:** Draw sketches, choose suitable materials, and plan steps.
4. **Create / Prototype:** Build a working model.
5. **Test & Evaluate:** Experiment to see if it works as intended.
6. **Improve:** Fix flaws and refine the design.

#### 5. Careers in ICT:
- **Software Engineer / Programmer:** Writes code and develops applications.
- **Cybersecurity Specialist:** Protects networks and data against hackers.
- **Network Administrator:** Sets up and maintains school or office internet connections.
- **Data Scientist:** Analyzes big data to guide business and national decisions.
- **Graphic Designer / Web Developer:** Creates websites and visual media.`,
    keywords: ["define an algorithm", "block coding", "what is a robot", "parts of a robot", "design process stages", "ICT careers"]
  }
];

module.exports = { ictQA };
