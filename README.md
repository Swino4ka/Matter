# Matter

An idle/incremental web game built with HTML, CSS and JavaScript, inspired by Antimatter Dimensions. Generate Matter, buy Generators, prestige via Distillation to earn permanent upgrades, and eventually perform Reality Merges for ever‑greater boosts.

The project is also hosted on itch.io! Go check it: https://swino4ka.itch.io/matter

## Table of Contents

- [Demo](#demo)  
- [Features](#features)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Game Mechanics](#game-mechanics)  
  - [Matter & Generators](#matter--generators)  
  - [Distillation (Prestige)](#distillation-prestige)  
  - [Reality Merges (Hard Prestige)](#reality-merges-hard-prestige)  
  - [Shop & Upgrades](#shop--upgrades)  
  - [Achievements](#achievements)  
- [Controls](#controls)  
- [Customization & Translation](#customization--translation)  
- [Development](#development)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact & Support](#contact--support)  

## Demo

Open the index.html file in any browser. All progress is saved to localStorage; no server is required.
Use google chrome for the best expirience.
To play the game in your language: Right click the page -> Translate to (your language name)

## Features

- Idle & clicker gameplay: generate Matter manually or automatically via Generators  
- Prestige system: reset your progress with Distillation to earn Distillation Points (DP) for permanent upgrades  
- Hard Prestige: perform Reality Merges to reset everything for a permanent production multiplier  
- Upgrade shop: spend DP on boosts (unlock Generator 5, reduce costs, boost generator output, etc.)  
- Achievements: 30+ achievements, including secret ones (“Master of Rest”, “Simulation Glitch”)  
- Dynamic UI effects: glitching title, confetti bursts, floating click effects, animated backgrounds  
- Responsive & themed: dark, cosmic‑themed design with smooth CSS animations  

## Installation

1. Clone / Download the repository  
    
    git clone https://github.com/Swino4ka/matter.git  
    cd matter

   OR

   Download source code from the latest release.

3. Open locally  
   - Double‑click `index.html` in your file explorer  
   - Or serve via a local HTTP server:  
       
       npx http-server .  
       (Then navigate to http://localhost:8080)  

4. Play! All data is stored in your browser; clearing cache will reset progress.

## Usage

- Click “Generate Matter” or let your Generators produce Matter per second  
- Open the Prestige tab to see how many DP you can earn  
- After accumulating DP, open the Premium Shop to buy upgrades  
- Unlock Reality Merges to access hard‑prestige once you purchase “Слияния Реальностей”  
- Track your progress and secrets in the Achievements tab  

## Game Mechanics

### Matter & Generators

- Matter is your primary resource  
- Generators 1–4 produce Matter automatically; each higher Generator multiplies production by 1.02^n  
- Clicking the Generate Matter button yields manual Matter equal to Generator 1’s base production × all boosts  

### Distillation (Prestige)

- Formula:  
    
    DP = floor( sqrt( Matter / 1e6 ) )  
    
- Resets only your current Matter; you keep Generators, upgrades, achievements, and totalMatter for Reality calculations  

### Reality Merges (Hard Prestige)

- Unlocked by the “Reality Merge” upgrade (costs 10 DP)  
- Formula:  
    
    Boost = floor( ( totalMatter / 1e6 ) ^ 0.25 )  
    
- Resets everything—Matter, Generators, DP, shop upgrades—while preserving totalMatter to accumulate more boosts  

### Shop & Upgrades

- Premium Shop (spend DP):  
  - Unlock Generators 5–7  
  - Boost each Generator 1–4 by ×1.2  
  - Reduce all generator costs by 10%  
  - Starter pack: start with 10 of Generator 1 after Distillation  
  - Unlock Reality Merges 
- Reality Shop (spend Reality Merges):  
  - Time Accelerator (increase ticks per second from 10 to 13)  
  - Additional future upgrades  

### Achievements

- Over 30 achievements, including:  
  - Milestones: accumulate ≥100 Matter, 1 k, 1 M, 1 B  
  - Speedruns: Distill within 10 minutes  
  - Return Challenges: reopen the game after one day  
  - Secrets: idle 5 minutes, click empty space 10×, random glitch drop (1 in 1 000 000 000)  
- Each unlocked achievement grants +10% production  

## Controls

- Click “Generate Matter” or press space (page must be focused)  
- Use generator buttons or “Buy Max” to purchase Generators  
- Open tabs on the right side: Prestige, Achievements, Statistics, Settings  
- In Settings, you can save now, reset progress, export or import a save string  

## Translation

- Default text is Russian. Right click at any browser that is using chromium -> Translate to (your language name) to translate

## Development

- Stack: vanilla HTML, CSS, JavaScript (ES6)  
- File structure:  
  - index.html — layout and modals  
  - css.css     — all styles and animations  
  - js.js       — core game logic, save/load, UI updates  

## Contributing

1. Fork the repository  
2. Create a branch (`git checkout -b feature/your-feature`)  
3. Commit your changes (`git commit -am "Add new feature"`)  
4. Push (`git push origin feature/your-feature`)  
5. Open a Pull Request  

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact & Support

Creator: Swino4ka  
- Boosty: https://boosty.to/swino4ka/donate  
- Discord: @Swino4ka.  
- Email: rybalalka@gmail.com  
- YouTube: https://www.youtube.com/@swino4ka  
- LinkedIn: https://www.linkedin.com/in/oleksandr-kvartiuk-b24171265
