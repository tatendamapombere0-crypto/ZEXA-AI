import React, { useState } from 'react';
import { ZoomIn, Info, CheckCircle2, Sparkles, Layers, Eye } from 'lucide-react';

export type DiagramId =
  | 'plant_animal_cell'
  | 'human_heart'
  | 'leaf_cross_section'
  | 'reflex_arc'
  | 'human_eye'
  | 'electric_circuits'
  | 'light_optics'
  | 'wave_properties'
  | 'atomic_structure'
  | 'electrolytic_cell'
  | 'blast_furnace'
  | 'water_cycle'
  | 'rock_cycle'
  | 'plate_tectonics'
  | 'river_profile'
  | 'soil_profile'
  | 'nitrogen_cycle'
  | 'ruminant_digestive'
  | 'trigonometry_pythagoras'
  | 'circle_theorems'
  | 'great_zimbabwe'
  | 'three_arms_government';

interface StudyDiagramProps {
  diagramId: DiagramId;
  caption?: string;
  interactive?: boolean;
}

export const StudyDiagram: React.FC<StudyDiagramProps> = ({
  diagramId,
  caption,
  interactive = true
}) => {
  const [activePart, setActivePart] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const renderDiagramSvg = () => {
    switch (diagramId) {
      // 1. PLANT VS ANIMAL CELL
      case 'plant_animal_cell':
        return (
          <svg viewBox="0 0 800 420" className="w-full h-auto select-none font-sans">
            <defs>
              <linearGradient id="plantWallGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="plantCytoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="animalCytoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="vacuoleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Left: Plant Cell */}
            <g className="cursor-pointer">
              <rect x="30" y="50" width="340" height="320" rx="36" fill="url(#plantCytoGrad)" stroke="#10b981" strokeWidth="8" />
              <rect x="38" y="58" width="324" height="304" rx="28" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="6 4" />
              
              {/* Large Central Sap Vacuole */}
              <ellipse cx="170" cy="200" rx="90" ry="70" fill="url(#vacuoleGrad)" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="170" y="205" fill="#bae6fd" fontSize="12" textAnchor="middle" fontWeight="bold">Large Sap Vacuole</text>
              <text x="170" y="222" fill="#7dd3fc" fontSize="10" textAnchor="middle">(Cell Sap &amp; Turgor)</text>

              {/* Plant Nucleus */}
              <circle cx="280" cy="130" r="34" fill="#a855f7" fillOpacity="0.4" stroke="#c084fc" strokeWidth="2.5" />
              <circle cx="280" cy="130" r="14" fill="#7e22ce" stroke="#e9d5ff" strokeWidth="1.5" />
              <text x="280" y="180" fill="#e9d5ff" fontSize="11" textAnchor="middle" fontWeight="bold">Nucleus &amp; DNA</text>

              {/* Chloroplasts */}
              <g>
                <ellipse cx="100" cy="110" rx="28" ry="16" fill="#15803d" stroke="#4ade80" strokeWidth="1.5" transform="rotate(-20 100 110)" />
                <line x1="88" y1="110" x2="112" y2="110" stroke="#86efac" strokeWidth="1.5" />
                <ellipse cx="90" cy="300" rx="28" ry="16" fill="#15803d" stroke="#4ade80" strokeWidth="1.5" transform="rotate(25 90 300)" />
                <ellipse cx="270" cy="300" rx="28" ry="16" fill="#15803d" stroke="#4ade80" strokeWidth="1.5" transform="rotate(-15 270 300)" />
                <text x="100" y="80" fill="#86efac" fontSize="11" fontWeight="bold">Chloroplasts (Photosynthesis)</text>
              </g>

              {/* Mitochondria */}
              <ellipse cx="230" cy="290" rx="20" ry="11" fill="#ea580c" fillOpacity="0.6" stroke="#fb923c" strokeWidth="1.5" />

              {/* Title & Features */}
              <text x="200" y="32" fill="#34d399" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
                PLANT CELL (Regular Polygonal)
              </text>
              <rect x="45" y="380" width="310" height="24" rx="6" fill="#064e3b" />
              <text x="200" y="396" fill="#a7f3d0" fontSize="11" textAnchor="middle">
                Has Cellulose Cell Wall, Large Vacuole &amp; Chloroplasts
              </text>
            </g>

            {/* Right: Animal Cell */}
            <g className="cursor-pointer">
              <path d="M 460,210 C 450,110 520,60 620,65 C 720,70 770,120 760,220 C 750,320 700,365 600,360 C 500,355 470,310 460,210 Z" 
                    fill="url(#animalCytoGrad)" stroke="#38bdf8" strokeWidth="4" />

              {/* Animal Nucleus */}
              <circle cx="610" cy="210" r="42" fill="#a855f7" fillOpacity="0.4" stroke="#c084fc" strokeWidth="2.5" />
              <circle cx="610" cy="210" r="18" fill="#7e22ce" stroke="#e9d5ff" strokeWidth="1.5" />
              <text x="610" y="270" fill="#e9d5ff" fontSize="11" textAnchor="middle" fontWeight="bold">Central Nucleus</text>

              {/* Mitochondria */}
              <g>
                <ellipse cx="520" cy="140" rx="24" ry="13" fill="#ea580c" fillOpacity="0.7" stroke="#fb923c" strokeWidth="1.5" transform="rotate(30 520 140)" />
                <path d="M 508,140 Q 520,135 532,140" stroke="#ffedd5" strokeWidth="1.2" fill="none" />
                <ellipse cx="700" cy="260" rx="22" ry="12" fill="#ea580c" fillOpacity="0.7" stroke="#fb923c" strokeWidth="1.5" transform="rotate(-20 700 260)" />
                <text x="520" y="115" fill="#fdba74" fontSize="11" fontWeight="bold">Mitochondria (ATP Energy)</text>
              </g>

              {/* Small Temporary Vacuoles */}
              <circle cx="530" cy="270" r="10" fill="#0284c7" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="690" cy="140" r="12" fill="#0284c7" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="1" />
              <text x="690" y="120" fill="#7dd3fc" fontSize="10">Small Vacuoles</text>

              {/* Title & Features */}
              <text x="610" y="32" fill="#38bdf8" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
                ANIMAL CELL (Irregular / Flexible)
              </text>
              <rect x="460" y="380" width="300" height="24" rx="6" fill="#0c4a6e" />
              <text x="610" y="396" fill="#bae6fd" fontSize="11" textAnchor="middle">
                No Cell Wall, No Chloroplasts, Small Vacuoles
              </text>
            </g>
          </svg>
        );

      // 2. HUMAN HEART ANATOMY & DOUBLE CIRCULATION
      case 'human_heart':
        return (
          <svg viewBox="0 0 800 440" className="w-full h-auto select-none font-sans">
            <defs>
              <linearGradient id="deoxGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="oxGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <marker id="arrowBlue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
              </marker>
              <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
              </marker>
            </defs>

            {/* Heart Muscle Body */}
            <path d="M 400,100 C 330,40 220,70 230,190 C 235,270 330,360 400,410 C 470,360 565,270 570,190 C 580,70 470,40 400,100 Z"
                  fill="#831843" stroke="#f43f5e" strokeWidth="5" />

            {/* Central Muscular Septum */}
            <path d="M 390,130 L 390,390 L 410,390 L 410,130 Z" fill="#4c0519" stroke="#9f1239" strokeWidth="2" />
            <text x="400" y="270" fill="#fda4af" fontSize="11" textAnchor="middle" fontWeight="bold" transform="rotate(-90 400 270)">
              CENTRAL SEPTUM (Prevents Mixing)
            </text>

            {/* Chambers: Right Heart (Blue / Deoxygenated) */}
            <g>
              {/* Right Atrium */}
              <ellipse cx="320" cy="170" rx="55" ry="40" fill="url(#deoxGrad)" stroke="#60a5fa" strokeWidth="2" />
              <text x="320" y="165" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">RIGHT ATRIUM</text>
              <text x="320" y="182" fill="#bfdbfe" fontSize="10" textAnchor="middle">From Vena Cava (Deox)</text>

              {/* Right Ventricle */}
              <path d="M 270,230 C 270,320 340,350 380,360 L 380,240 Z" fill="url(#deoxGrad)" stroke="#60a5fa" strokeWidth="2" />
              <text x="330" y="295" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">RIGHT VENTRICLE</text>
              <text x="330" y="312" fill="#bfdbfe" fontSize="10" textAnchor="middle">Pumps to Lungs</text>
              <text x="330" y="325" fill="#93c5fd" fontSize="9" textAnchor="middle">(Thinner Wall)</text>

              {/* Tricuspid Valve */}
              <line x1="300" y1="215" x2="350" y2="225" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
              <text x="240" y="215" fill="#fde047" fontSize="10" fontWeight="bold">Tricuspid Valve</text>
            </g>

            {/* Chambers: Left Heart (Red / Oxygenated) */}
            <g>
              {/* Left Atrium */}
              <ellipse cx="480" cy="170" rx="55" ry="40" fill="url(#oxGrad)" stroke="#f87171" strokeWidth="2" />
              <text x="480" y="165" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">LEFT ATRIUM</text>
              <text x="480" y="182" fill="#fecaca" fontSize="10" textAnchor="middle">From Pulmonary Veins</text>

              {/* Left Ventricle (Thick Muscular Wall) */}
              <path d="M 530,230 C 530,320 460,350 420,360 L 420,240 Z" fill="url(#oxGrad)" stroke="#f87171" strokeWidth="2" />
              <text x="470" y="295" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">LEFT VENTRICLE</text>
              <text x="470" y="312" fill="#fecaca" fontSize="10" textAnchor="middle">Pumps to Whole Body</text>
              <text x="470" y="325" fill="#fca5a5" fontSize="9" textAnchor="middle">(3x Thicker Muscular Wall)</text>

              {/* Bicuspid / Mitral Valve */}
              <line x1="450" y1="225" x2="500" y2="215" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
              <text x="555" y="215" fill="#fde047" fontSize="10" fontWeight="bold">Bicuspid Valve</text>
            </g>

            {/* Major Blood Vessels */}
            {/* Superior Vena Cava */}
            <path d="M 240,40 L 240,140" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round" markerEnd="url(#arrowBlue)" />
            <text x="210" y="30" fill="#93c5fd" fontSize="11" fontWeight="bold">Vena Cava (Deoxygenated)</text>

            {/* Systemic Aorta */}
            <path d="M 400,120 C 400,20 480,10 520,50 L 520,90" fill="none" stroke="#ef4444" strokeWidth="18" markerEnd="url(#arrowRed)" />
            <text x="535" y="45" fill="#fca5a5" fontSize="12" fontWeight="bold">AORTA (High Pressure to Body)</text>

            {/* Pulmonary Artery to Lungs */}
            <path d="M 370,110 C 350,50 300,50 280,60" fill="none" stroke="#2563eb" strokeWidth="14" markerEnd="url(#arrowBlue)" />
            <text x="290" y="85" fill="#bfdbfe" fontSize="10">Pulmonary Artery</text>

            {/* Legend Card */}
            <rect x="30" y="340" width="180" height="75" rx="10" fill="#0f172a" stroke="#334155" />
            <circle cx="45" cy="360" r="6" fill="#2563eb" />
            <text x="60" y="364" fill="#94a3b8" fontSize="10">Deoxygenated Blood (Right)</text>
            <circle cx="45" cy="385" r="6" fill="#dc2626" />
            <text x="60" y="389" fill="#94a3b8" fontSize="10">Oxygenated Blood (Left)</text>
            <text x="45" y="405" fill="#fbbf24" fontSize="9">Valves prevent backflow</text>
          </svg>
        );

      // 3. LEAF CROSS-SECTION & PHOTOSYNTHESIS
      case 'leaf_cross_section':
        return (
          <svg viewBox="0 0 800 400" className="w-full h-auto select-none font-sans">
            <defs>
              <linearGradient id="cuticleGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Top Waxy Cuticle */}
            <rect x="100" y="50" width="600" height="14" rx="4" fill="url(#cuticleGrad)" />
            <text x="710" y="62" fill="#fde047" fontSize="11" fontWeight="bold">Waxy Cuticle (Waterproof)</text>

            {/* Upper Epidermis (Single layer, transparent) */}
            <g>
              {[...Array(10)].map((_, i) => (
                <rect key={i} x={105 + i * 59} y="68" width="55" height="32" rx="4" fill="#1e293b" stroke="#4ade80" strokeWidth="1.5" />
              ))}
              <text x="710" y="90" fill="#86efac" fontSize="11">Upper Epidermis (No chloroplasts)</text>
            </g>

            {/* Palisade Mesophyll (Densely packed vertical cells packed with chloroplasts) */}
            <g>
              {[...Array(12)].map((_, i) => (
                <g key={i}>
                  <rect x={105 + i * 49} y="105" width="45" height="110" rx="6" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
                  {/* Chloroplast dots */}
                  <circle cx={117 + i * 49} cy="125" r="4" fill="#4ade80" />
                  <circle cx={137 + i * 49} cy="140" r="4" fill="#4ade80" />
                  <circle cx={122 + i * 49} cy="165" r="4" fill="#4ade80" />
                  <circle cx={135 + i * 49} cy="190" r="4" fill="#4ade80" />
                </g>
              ))}
              <text x="710" y="150" fill="#4ade80" fontSize="12" fontWeight="bold">Palisade Mesophyll</text>
              <text x="710" y="168" fill="#86efac" fontSize="10">Max Chloroplasts for Light Absorption</text>
            </g>

            {/* Spongy Mesophyll & Air Spaces */}
            <g>
              <rect x="100" y="220" width="600" height="95" fill="#052e16" fillOpacity="0.4" stroke="#166534" strokeWidth="1" />
              {[...Array(9)].map((_, i) => (
                <ellipse key={i} cx={140 + i * 65} cy={245 + (i % 2) * 35} rx="24" ry="18" fill="#166534" stroke="#4ade80" strokeWidth="1.5" />
              ))}
              {/* Vascular Bundle (Xylem and Phloem) */}
              <circle cx="390" cy="265" r="32" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
              <circle cx="380" cy="260" r="12" fill="#0284c7" />
              <text x="380" y="264" fill="#ffffff" fontSize="9" textAnchor="middle">Xylem</text>
              <circle cx="405" cy="270" r="10" fill="#eab308" />
              <text x="405" y="274" fill="#000000" fontSize="8" textAnchor="middle" fontWeight="bold">Phloem</text>
              <text x="710" y="255" fill="#38bdf8" fontSize="11" fontWeight="bold">Spongy Mesophyll</text>
              <text x="710" y="272" fill="#94a3b8" fontSize="10">Air Spaces for Gas Exchange (CO₂/O₂)</text>
              <text x="710" y="288" fill="#0ea5e9" fontSize="10">Vascular Bundle: Xylem + Phloem</text>
            </g>

            {/* Lower Epidermis with Stomata & Guard Cells */}
            <g>
              <rect x="100" y="320" width="180" height="28" rx="4" fill="#1e293b" stroke="#4ade80" strokeWidth="1.5" />
              {/* Stoma 1 (Open Pore with 2 Guard Cells) */}
              <g>
                <ellipse cx="295" cy="334" rx="14" ry="10" fill="#15803d" stroke="#86efac" strokeWidth="1.5" />
                <ellipse cx="320" cy="334" rx="14" ry="10" fill="#15803d" stroke="#86efac" strokeWidth="1.5" />
                <ellipse cx="307" cy="334" rx="4" ry="8" fill="#022c22" />
                <text x="307" y="375" fill="#facc15" fontSize="10" textAnchor="middle" fontWeight="bold">Open Stoma</text>
                <path d="M 307,360 L 307,344" stroke="#facc15" strokeWidth="1.5" markerEnd="url(#arrowBlue)" />
              </g>

              <rect x="340" y="320" width="160" height="28" rx="4" fill="#1e293b" stroke="#4ade80" strokeWidth="1.5" />
              
              {/* Stoma 2 */}
              <g>
                <ellipse cx="515" cy="334" rx="14" ry="10" fill="#15803d" stroke="#86efac" strokeWidth="1.5" />
                <ellipse cx="540" cy="334" rx="14" ry="10" fill="#15803d" stroke="#86efac" strokeWidth="1.5" />
                <ellipse cx="527" cy="334" rx="4" ry="8" fill="#022c22" />
                <text x="527" y="375" fill="#facc15" fontSize="10" textAnchor="middle" fontWeight="bold">Guard Cells</text>
              </g>

              <rect x="560" y="320" width="140" height="28" rx="4" fill="#1e293b" stroke="#4ade80" strokeWidth="1.5" />
            </g>

            {/* Sun Rays & Gas arrows */}
            <text x="250" y="25" fill="#fbbf24" fontSize="12" fontWeight="bold">☀️ Sunlight Energy</text>
            <path d="M 280,30 L 280,50" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 300,30 L 300,50" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        );

      // 4. REFLEX ARC DIAGRAM
      case 'reflex_arc':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            {/* Spinal Cord Cross Section (Grey matter butterfly) */}
            <g>
              <rect x="460" y="50" width="280" height="280" rx="30" fill="#1e1e38" stroke="#6366f1" strokeWidth="3" />
              <path d="M 520,120 C 580,140 580,180 540,190 C 580,200 580,240 520,260 C 600,240 640,240 680,260 C 650,220 650,160 680,120 C 640,140 600,140 520,120 Z"
                    fill="#312e81" stroke="#818cf8" strokeWidth="2" />
              <text x="600" y="90" fill="#c7d2fe" fontSize="14" fontWeight="bold" textAnchor="middle">SPINAL CORD (CNS)</text>
              <text x="600" y="195" fill="#a5b4fc" fontSize="11" textAnchor="middle">Relay Neuron &amp; Synapses</text>
            </g>

            {/* 1. Stimulus & Pain Receptor in Skin */}
            <g>
              <rect x="40" y="80" width="130" height="70" rx="10" fill="#0f172a" stroke="#f43f5e" strokeWidth="2" />
              <text x="105" y="105" fill="#fb7185" fontSize="12" fontWeight="bold" textAnchor="middle">1. STIMULUS</text>
              <text x="105" y="123" fill="#ffffff" fontSize="11" textAnchor="middle">Hot Object / Pin</text>
              <text x="105" y="138" fill="#fda4af" fontSize="9" textAnchor="middle">Pain Receptor in Skin</text>
            </g>

            {/* 2. Sensory Neuron */}
            <path d="M 170,115 C 260,115 360,140 520,140" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="6 4" />
            <circle cx="340" cy="130" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="340" y="105" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">2. SENSORY NEURON</text>
            <text x="340" y="165" fill="#7dd3fc" fontSize="9" textAnchor="middle">Dorsal Root Ganglion</text>

            {/* 3. Relay Neuron in Spinal Cord */}
            <path d="M 520,140 L 580,190 L 520,240" fill="none" stroke="#fbbf24" strokeWidth="4" />
            <circle cx="580" cy="190" r="8" fill="#d97706" />

            {/* 4. Motor Neuron */}
            <path d="M 520,240 C 380,240 280,270 170,270" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="6 4" />
            <text x="340" y="295" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">4. MOTOR NEURON</text>
            <text x="340" y="310" fill="#86efac" fontSize="9" textAnchor="middle">Ventral Root Output</text>

            {/* 5. Effector (Biceps Muscle) */}
            <g>
              <rect x="40" y="235" width="130" height="70" rx="10" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
              <text x="105" y="260" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">5. EFFECTOR</text>
              <text x="105" y="278" fill="#ffffff" fontSize="11" textAnchor="middle">Muscle Contracts</text>
              <text x="105" y="293" fill="#86efac" fontSize="9" textAnchor="middle">Rapid Arm Withdrawal</text>
            </g>
          </svg>
        );

      // 5. ELECTRIC CIRCUITS (SERIES VS PARALLEL)
      case 'electric_circuits':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            {/* Left: Series Circuit */}
            <g>
              <rect x="40" y="30" width="330" height="320" rx="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <text x="205" y="65" fill="#38bdf8" fontSize="15" fontWeight="bold" textAnchor="middle">SERIES CIRCUIT</text>
              <text x="205" y="85" fill="#94a3b8" fontSize="11" textAnchor="middle">One Single Loop • Same Current (I) Everywhere</text>

              {/* Wire Path */}
              <rect x="80" y="110" width="250" height="180" rx="12" fill="none" stroke="#60a5fa" strokeWidth="3" />

              {/* Battery */}
              <line x1="180" y1="110" x2="200" y2="110" stroke="#f59e0b" strokeWidth="4" />
              <line x1="200" y1="95" x2="200" y2="125" stroke="#f59e0b" strokeWidth="5" />
              <line x1="210" y1="102" x2="210" y2="118" stroke="#f59e0b" strokeWidth="3" />
              <text x="205" y="85" fill="#f59e0b" fontSize="10" fontWeight="bold">V (Cell)</text>

              {/* Resistor R1 */}
              <rect x="315" y="140" width="30" height="40" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              <text x="360" y="165" fill="#f8fafc" fontSize="11">R₁</text>

              {/* Resistor R2 */}
              <rect x="315" y="210" width="30" height="40" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              <text x="360" y="235" fill="#f8fafc" fontSize="11">R₂</text>

              {/* Ammeter in series */}
              <circle cx="205" cy="290" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <text x="205" y="295" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">A</text>

              <rect x="65" y="305" width="280" height="30" rx="6" fill="#1e293b" />
              <text x="205" y="325" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="mono">
                R_total = R₁ + R₂ | I_total = I₁ = I₂
              </text>
            </g>

            {/* Right: Parallel Circuit */}
            <g>
              <rect x="420" y="30" width="340" height="320" rx="20" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
              <text x="590" y="65" fill="#10b981" fontSize="15" fontWeight="bold" textAnchor="middle">PARALLEL CIRCUIT</text>
              <text x="590" y="85" fill="#94a3b8" fontSize="11" textAnchor="middle">Multiple Branches • Full Voltage (V) across Each</text>

              {/* Main loop */}
              <path d="M 470,110 L 710,110 L 710,290 L 470,290 Z" fill="none" stroke="#34d399" strokeWidth="3" />
              
              {/* Branch 1 */}
              <line x1="570" y1="110" x2="570" y2="290" stroke="#34d399" strokeWidth="3" />
              <rect x="555" y="180" width="30" height="40" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              <text x="540" y="205" fill="#f8fafc" fontSize="11">R₁</text>

              {/* Branch 2 */}
              <rect x="695" y="180" width="30" height="40" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              <text x="740" y="205" fill="#f8fafc" fontSize="11">R₂</text>

              {/* Battery on left */}
              <line x1="470" y1="185" x2="470" y2="215" stroke="#f59e0b" strokeWidth="5" />
              <line x1="470" y1="195" x2="470" y2="205" stroke="#f59e0b" strokeWidth="3" />

              <rect x="445" y="305" width="290" height="30" rx="6" fill="#1e293b" />
              <text x="590" y="325" fill="#34d399" fontSize="11" textAnchor="middle" fontWeight="mono">
                1/R_total = 1/R₁ + 1/R₂ | V_total = V₁ = V₂
              </text>
            </g>
          </svg>
        );

      // 6. HYDROLOGICAL WATER CYCLE
      case 'water_cycle':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            {/* Sky, Sun, Clouds */}
            <rect x="0" y="0" width="800" height="260" fill="#0284c7" fillOpacity="0.15" />
            <circle cx="700" cy="70" r="38" fill="#facc15" filter="url(#glow)" />
            <text x="700" y="75" fill="#78350f" fontSize="12" fontWeight="bold" textAnchor="middle">Sun Energy</text>

            {/* Mountains & Ground */}
            <path d="M 0,260 L 220,130 L 360,210 L 500,160 L 800,280 L 800,380 L 0,380 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <path d="M 520,290 C 600,290 680,285 800,280 L 800,380 L 520,380 Z" fill="#0369a1" />
            <text x="680" y="340" fill="#e0f2fe" fontSize="15" fontWeight="bold">OCEAN / LAKE</text>

            {/* Clouds */}
            <g fill="#f1f5f9" fillOpacity="0.8">
              <ellipse cx="260" cy="75" rx="55" ry="25" />
              <ellipse cx="300" cy="65" rx="40" ry="25" />
              <ellipse cx="480" cy="85" rx="60" ry="30" />
            </g>

            {/* 1. Evaporation */}
            <g>
              <path d="M 660,270 C 660,200 640,160 620,130" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5 5" markerEnd="url(#arrowBlue)" />
              <text x="670" y="200" fill="#38bdf8" fontSize="12" fontWeight="bold">1. Evaporation</text>
            </g>

            {/* 2. Transpiration */}
            <g>
              <path d="M 320,210 C 320,160 300,140 280,110" fill="none" stroke="#4ade80" strokeWidth="3" strokeDasharray="5 5" />
              <text x="325" y="165" fill="#4ade80" fontSize="11" fontWeight="bold">2. Transpiration</text>
              <text x="325" y="180" fill="#86efac" fontSize="9">(From Vegetation)</text>
            </g>

            {/* 3. Condensation */}
            <text x="380" y="55" fill="#e2e8f0" fontSize="12" fontWeight="bold">3. Condensation</text>
            <text x="380" y="70" fill="#94a3b8" fontSize="10">(Cooling into Clouds)</text>

            {/* 4. Precipitation */}
            <g>
              {[...Array(6)].map((_, i) => (
                <line key={i} x1={220 + i * 20} y1="105" x2={205 + i * 20} y2="140" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
              ))}
              <text x="140" y="125" fill="#67e8f9" fontSize="12" fontWeight="bold">4. Precipitation</text>
              <text x="140" y="140" fill="#a5f3fc" fontSize="9">(Rain &amp; Hail)</text>
            </g>

            {/* 5. Surface Runoff & Infiltration */}
            <path d="M 230,220 C 350,250 450,280 530,300" fill="none" stroke="#0284c7" strokeWidth="6" />
            <text x="360" y="270" fill="#38bdf8" fontSize="11" fontWeight="bold">5. Surface Runoff (Rivers)</text>

            <path d="M 300,320 L 480,350" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="4 4" />
            <text x="360" y="340" fill="#94a3b8" fontSize="10">Groundwater Percolation / Infiltration</text>
          </svg>
        );

      // 7. SOIL PROFILE HORIZONS
      case 'soil_profile':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <g>
              {/* O Horizon */}
              <rect x="60" y="30" width="460" height="40" fill="#1c1917" stroke="#44403c" strokeWidth="2" />
              <text x="80" y="55" fill="#a8a29e" fontSize="13" fontWeight="bold">O-HORIZON (Organic / Litter Layer)</text>
              <text x="540" y="55" fill="#e7e5e4" fontSize="12">Decomposing plant matter, leaves &amp; rich humus</text>

              {/* A Horizon (Topsoil) */}
              <rect x="60" y="70" width="460" height="80" fill="#451a03" stroke="#78350f" strokeWidth="2" />
              <text x="80" y="115" fill="#fde68a" fontSize="13" fontWeight="bold">A-HORIZON (Topsoil)</text>
              <text x="540" y="105" fill="#fef3c7" fontSize="12" fontWeight="bold">Richest agricultural layer</text>
              <text x="540" y="125" fill="#d6d3d1" fontSize="11">High organic humus, roots, soil organisms &amp; nutrients</text>

              {/* B Horizon (Subsoil) */}
              <rect x="60" y="150" width="460" height="90" fill="#9a3412" stroke="#c2410c" strokeWidth="2" />
              <text x="80" y="200" fill="#fed7aa" fontSize="13" fontWeight="bold">B-HORIZON (Subsoil)</text>
              <text x="540" y="190" fill="#ffedd5" fontSize="12">Zone of accumulation (illuviation)</text>
              <text x="540" y="210" fill="#d6d3d1" fontSize="11">Clay minerals, iron oxides, low humus</text>

              {/* C Horizon (Parent Rock) */}
              <rect x="60" y="240" width="460" height="70" fill="#57534e" stroke="#78716c" strokeWidth="2" />
              <text x="80" y="280" fill="#e7e5e4" fontSize="13" fontWeight="bold">C-HORIZON (Weathered Parent Material)</text>
              <text x="540" y="275" fill="#e7e5e4" fontSize="12">Broken rock fragments &amp; regolith</text>
              <text x="540" y="295" fill="#d6d3d1" fontSize="11">No biological organic matter</text>

              {/* R Horizon (Bedrock) */}
              <rect x="60" y="310" width="460" height="50" fill="#292524" stroke="#44403c" strokeWidth="2" />
              <text x="80" y="340" fill="#d6d3d1" fontSize="13" fontWeight="bold">R-HORIZON (Solid Bedrock)</text>
              <text x="540" y="340" fill="#a8a29e" fontSize="12">Unaltered unweathered solid parent rock (granite/basalt)</text>
            </g>
          </svg>
        );

      // 8. ATOMIC STRUCTURE (BOHR MODEL)
      case 'atomic_structure':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            {/* Nucleus */}
            <circle cx="340" cy="190" r="45" fill="#450a0a" stroke="#dc2626" strokeWidth="3" filter="url(#glow)" />
            <text x="340" y="185" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">NUCLEUS</text>
            <text x="340" y="200" fill="#fef2f2" fontSize="10" textAnchor="middle">11 Protons (p⁺)</text>
            <text x="340" y="215" fill="#cbd5e1" fontSize="10" textAnchor="middle">12 Neutrons (n⁰)</text>

            {/* Shell 1 (n=1, 2 electrons) */}
            <circle cx="340" cy="190" r="75" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="340" cy="115" r="7" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
            <circle cx="340" cy="265" r="7" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />

            {/* Shell 2 (n=2, 8 electrons) */}
            <circle cx="340" cy="190" r="115" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI) / 4;
              return (
                <circle
                  key={i}
                  cx={340 + 115 * Math.cos(angle)}
                  cy={190 + 115 * Math.sin(angle)}
                  r="7"
                  fill="#0284c7"
                  stroke="#e0f2fe"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Shell 3 (n=3, 1 valence electron for Sodium Na) */}
            <circle cx="340" cy="190" r="155" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="340" cy="35" r="9" fill="#f59e0b" stroke="#fef3c7" strokeWidth="2" filter="url(#glow)" />
            <text x="340" y="20" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
              1 Valence Electron (Group 1 Alkali Metal)
            </text>

            {/* Annotation Panel on Right */}
            <g>
              <rect x="530" y="50" width="240" height="280" rx="16" fill="#0f172a" stroke="#334155" />
              <text x="550" y="85" fill="#38bdf8" fontSize="15" fontWeight="bold">Sodium Atom (Na)</text>
              <text x="550" y="110" fill="#94a3b8" fontSize="12">Atomic Number (Z) = 11</text>
              <text x="550" y="130" fill="#94a3b8" fontSize="12">Mass Number (A) = 23</text>
              
              <line x1="550" y1="145" x2="740" y2="145" stroke="#334155" />

              <text x="550" y="170" fill="#facc15" fontSize="13" fontWeight="bold">Electronic Configuration:</text>
              <text x="550" y="195" fill="#fef08a" fontSize="18" fontWeight="bold" fontFamily="monospace">2 . 8 . 1</text>

              <text x="550" y="225" fill="#a7f3d0" fontSize="11">• Shell 1 (K): 2 electrons (Full)</text>
              <text x="550" y="245" fill="#a7f3d0" fontSize="11">• Shell 2 (L): 8 electrons (Full)</text>
              <text x="550" y="265" fill="#fed7aa" fontSize="11">• Shell 3 (M): 1 electron (Valence)</text>

              <text x="550" y="300" fill="#f43f5e" fontSize="11" fontWeight="bold">
                Loses 1 e⁻ to form Na⁺ ion (Stable Octet)
              </text>
            </g>
          </svg>
        );

      // 9. CIRCLE THEOREMS (MATHEMATICS)
      case 'circle_theorems':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            {/* Theorem 1: Angle at Centre = 2x Angle at Circumference */}
            <g>
              <rect x="40" y="30" width="330" height="320" rx="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="205" cy="190" r="90" fill="none" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="205" cy="190" r="4" fill="#38bdf8" />
              <text x="205" y="208" fill="#7dd3fc" fontSize="10">Centre O</text>

              {/* Subtended angles */}
              <line x1="140" y1="240" x2="205" y2="190" stroke="#f59e0b" strokeWidth="2.5" />
              <line x1="270" y1="240" x2="205" y2="190" stroke="#f59e0b" strokeWidth="2.5" />
              <text x="205" y="175" fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle">2θ (Centre)</text>

              <line x1="140" y1="240" x2="205" y2="100" stroke="#10b981" strokeWidth="2" />
              <line x1="270" y1="240" x2="205" y2="100" stroke="#10b981" strokeWidth="2" />
              <text x="205" y="125" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">θ (Circumference)</text>

              <text x="205" y="55" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">THEOREM 1</text>
              <text x="205" y="325" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
                Angle at Centre is TWICE Angle at Circumference
              </text>
            </g>

            {/* Theorem 2: Angle in a Semicircle is 90° */}
            <g>
              <rect x="420" y="30" width="340" height="320" rx="20" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
              <circle cx="590" cy="190" r="90" fill="none" stroke="#10b981" strokeWidth="2" />
              
              {/* Diameter */}
              <line x1="500" y1="190" x2="680" y2="190" stroke="#ef4444" strokeWidth="3" />
              <circle cx="590" cy="190" r="4" fill="#ef4444" />
              <text x="590" y="210" fill="#fca5a5" fontSize="10" textAnchor="middle">Diameter AB</text>

              {/* Triangle in Semicircle */}
              <line x1="500" y1="190" x2="560" y2="105" stroke="#34d399" strokeWidth="2.5" />
              <line x1="680" y1="190" x2="560" y2="105" stroke="#34d399" strokeWidth="2.5" />
              
              {/* Right angle symbol */}
              <rect x="555" y="110" width="10" height="10" fill="none" stroke="#facc15" strokeWidth="2" />
              <text x="575" y="105" fill="#fde047" fontSize="13" fontWeight="bold">90°</text>

              <text x="590" y="55" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">THEOREM 2</text>
              <text x="590" y="325" fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">
                Angle in a Semicircle is always a RIGHT ANGLE (90°)
              </text>
            </g>
          </svg>
        );

      // 10. RUMINANT DIGESTIVE SYSTEM (AGRICULTURE / BIOLOGY)
      case 'ruminant_digestive':
        return (
          <svg viewBox="0 0 800 400" className="w-full h-auto select-none font-sans">
            <defs>
              <linearGradient id="rumenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#166534" />
                <stop offset="100%" stopColor="#052e16" />
              </linearGradient>
            </defs>
            <text x="400" y="32" fill="#4ade80" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              RUMINANT DIGESTIVE SYSTEM (4-CHAMBERED COMPOUND STOMACH)
            </text>

            {/* Oesophagus / Gaping */}
            <path d="M 60,110 L 190,130" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" />
            <text x="110" y="90" fill="#fde047" fontSize="11" fontWeight="bold">Oesophagus (Swallowing &amp; Cud Regurgitation)</text>

            {/* Chamber 1: Rumen (Paunch) - Largest */}
            <g>
              <ellipse cx="320" cy="240" rx="140" ry="110" fill="url(#rumenGrad)" stroke="#22c55e" strokeWidth="3" />
              <text x="320" y="215" fill="#86efac" fontSize="14" fontWeight="extrabold" textAnchor="middle">1. RUMEN (Paunch)</text>
              <text x="320" y="235" fill="#f0fdf4" fontSize="11" textAnchor="middle">Largest Chamber (80% capacity)</text>
              <text x="320" y="255" fill="#bbf7d0" fontSize="10" textAnchor="middle">Fermentation vat with billions of microbes</text>
              <text x="320" y="272" fill="#fde047" fontSize="10" textAnchor="middle">Breaks down cellulose into volatile fatty acids (VFAs)</text>
            </g>

            {/* Chamber 2: Reticulum (Honeycomb) */}
            <g>
              <ellipse cx="210" cy="160" rx="60" ry="45" fill="#1e293b" stroke="#eab308" strokeWidth="2.5" />
              <text x="210" y="155" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">2. RETICULUM</text>
              <text x="210" y="172" fill="#fef08a" fontSize="9" textAnchor="middle">"Honeycomb" lining</text>
              <text x="210" y="186" fill="#e2e8f0" fontSize="8" textAnchor="middle">Forms cud boli for chewing</text>
            </g>

            {/* Chamber 3: Omasum (Manyplies / Bible) */}
            <g>
              <circle cx="500" cy="180" r="50" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="500" y="175" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">3. OMASUM</text>
              <text x="500" y="192" fill="#bae6fd" fontSize="9" textAnchor="middle">"Manyplies" book folds</text>
              <text x="500" y="206" fill="#e0f2fe" fontSize="8" textAnchor="middle">Water &amp; mineral absorption</text>
            </g>

            {/* Chamber 4: Abomasum (True Stomach) */}
            <g>
              <ellipse cx="560" cy="275" rx="85" ry="60" fill="#4c0519" stroke="#f43f5e" strokeWidth="3" />
              <text x="560" y="265" fill="#fda4af" fontSize="13" fontWeight="extrabold" textAnchor="middle">4. ABOMASUM</text>
              <text x="560" y="285" fill="#fff" fontSize="11" textAnchor="middle">TRUE GASTRIC STOMACH</text>
              <text x="560" y="302" fill="#fecaca" fontSize="9" textAnchor="middle">Secretes HCl &amp; Pepsin enzymes</text>
              <text x="560" y="316" fill="#fca5a5" fontSize="8" textAnchor="middle">Digests microbial &amp; dietary proteins</text>
            </g>

            {/* Small Intestine Output */}
            <path d="M 645,280 C 700,280 720,240 760,240" fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round" />
            <text x="730" y="225" fill="#fb923c" fontSize="10" fontWeight="bold">To Small Intestine</text>

            {/* Step-by-step cud flow arrows */}
            <path d="M 180,140 Q 230,190 260,200" stroke="#facc15" strokeWidth="2" strokeDasharray="4 3" />
            <path d="M 380,180 Q 440,160 460,170" stroke="#facc15" strokeWidth="2" strokeDasharray="4 3" />
            <path d="M 520,225 L 530,245" stroke="#facc15" strokeWidth="2" strokeDasharray="4 3" />

            {/* Summary card */}
            <rect x="50" y="360" width="700" height="28" rx="8" fill="#0f172a" stroke="#334155" />
            <text x="400" y="379" fill="#94a3b8" fontSize="11" textAnchor="middle">
              Cud Flow: Mouth ➔ Rumen (Fermentation) ➔ Reticulum ➔ Regurgitation/Chewing ➔ Omasum (Water) ➔ Abomasum (Enzyme Digestion)
            </text>
          </svg>
        );

      // 11. EXTRACTION OF IRON IN THE BLAST FURNACE (CHEMISTRY)
      case 'blast_furnace':
        return (
          <svg viewBox="0 0 800 420" className="w-full h-auto select-none font-sans">
            <defs>
              <linearGradient id="furnaceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>

            <text x="400" y="28" fill="#f59e0b" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              EXTRACTION OF IRON: INDUSTRIAL BLAST FURNACE
            </text>

            {/* Raw Material Charge at Top */}
            <g>
              <polygon points="340,40 460,40 430,75 370,75" fill="#334155" stroke="#64748b" strokeWidth="2" />
              <text x="400" y="58" fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold">Double Bell Hopper</text>
              <text x="210" y="55" fill="#fde047" fontSize="11" fontWeight="bold">Raw Materials Added:</text>
              <text x="210" y="70" fill="#e2e8f0" fontSize="9">1. Hematite Ore (Fe₂O₃)</text>
              <text x="210" y="83" fill="#e2e8f0" fontSize="9">2. Coke (C) • 3. Limestone (CaCO₃)</text>
            </g>

            {/* Furnace Tower */}
            <polygon points="370,75 320,180 300,320 340,380 460,380 500,320 480,180 430,75" fill="url(#furnaceGrad)" stroke="#cbd5e1" strokeWidth="3" opacity="0.85" />

            {/* Temperature & Reaction Zones */}
            {/* Zone 1: Top (400°C) */}
            <line x1="365" y1="120" x2="435" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <text x="400" y="110" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">~400°C - 700°C: Ore Reduction</text>
            <text x="400" y="125" fill="#fef08a" fontSize="9" textAnchor="middle" fontFamily="monospace">Fe₂O₃ + 3CO ➔ 2Fe + 3CO₂</text>

            {/* Zone 2: Middle (1000°C) */}
            <line x1="330" y1="210" x2="470" y2="210" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <text x="400" y="200" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">~1000°C: Slag Formation</text>
            <text x="400" y="215" fill="#fef08a" fontSize="9" textAnchor="middle" fontFamily="monospace">CaCO₃ ➔ CaO + CO₂ | CaO + SiO₂ ➔ CaSiO₃ (Slag)</text>

            {/* Zone 3: Bottom Tuyeres (1900°C) */}
            <text x="400" y="280" fill="#ffffff" fontSize="11" textAnchor="middle" fontWeight="extrabold">~1900°C: Combustion Zone</text>
            <text x="400" y="295" fill="#ffedd5" fontSize="10" textAnchor="middle" fontFamily="monospace">C + O₂ ➔ CO₂ | CO₂ + C ➔ 2CO (Reducing Agent)</text>

            {/* Hot Air Blast Inlets (Tuyeres) */}
            <rect x="220" y="295" width="80" height="24" rx="4" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.5" />
            <text x="260" y="311" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">Hot Air In</text>
            <rect x="500" y="295" width="80" height="24" rx="4" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.5" />
            <text x="540" y="311" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">Hot Air In</text>

            {/* Bottom Layers: Slag and Molten Iron */}
            {/* Slag on top (lighter density) */}
            <rect x="330" y="340" width="140" height="18" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1.5" />
            <text x="400" y="353" fill="#1a2e05" fontSize="10" textAnchor="middle" fontWeight="bold">Molten Slag (CaSiO₃)</text>
            {/* Slag tap */}
            <line x1="470" y1="348" x2="550" y2="348" stroke="#a3e635" strokeWidth="6" strokeLinecap="round" />
            <text x="560" y="352" fill="#a3e635" fontSize="10" fontWeight="bold">Slag Tap Out</text>

            {/* Molten iron on bottom (heavier density) */}
            <rect x="340" y="360" width="120" height="18" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
            <text x="400" y="373" fill="#431407" fontSize="10" textAnchor="middle" fontWeight="bold">Molten Pig Iron (Fe)</text>
            {/* Iron tap */}
            <line x1="460" y1="370" x2="580" y2="370" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
            <text x="590" y="374" fill="#fb923c" fontSize="11" fontWeight="bold">Molten Iron Tap Out</text>

            {/* Waste gases out top */}
            <path d="M 460,95 L 530,75" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
            <text x="540" y="78" fill="#94a3b8" fontSize="10" fontWeight="bold">Waste Gases (CO, CO₂, N₂)</text>
          </svg>
        );

      // 12. ELECTROLYTIC CELL (CHEMISTRY / PHYSICS)
      case 'electrolytic_cell':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <text x="400" y="28" fill="#38bdf8" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              ELECTROLYSIS CELL (MIGRATION OF IONS &amp; REDOX)
            </text>

            {/* DC Power Supply Battery */}
            <g>
              <rect x="330" y="45" width="140" height="40" rx="8" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
              <text x="400" y="68" fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">D.C. BATTERY</text>
              <text x="350" y="68" fill="#f43f5e" fontSize="14" fontWeight="bold">+</text>
              <text x="450" y="68" fill="#38bdf8" fontSize="14" fontWeight="bold">−</text>
            </g>

            {/* Wires */}
            <path d="M 345,65 L 240,65 L 240,140" fill="none" stroke="#ef4444" strokeWidth="3" />
            <path d="M 455,65 L 560,65 L 560,140" fill="none" stroke="#38bdf8" strokeWidth="3" />

            {/* Electrolyte Tank */}
            <rect x="160" y="140" width="480" height="200" rx="16" fill="#0c4a6e" fillOpacity="0.4" stroke="#0284c7" strokeWidth="3" />
            <text x="400" y="325" fill="#7dd3fc" fontSize="12" textAnchor="middle" fontWeight="bold">
              ELECTROLYTE (Molten Salt or Aqueous Solution, e.g. Cu²⁺ + SO₄²⁻)
            </text>

            {/* ANODE (+) Electrode */}
            <rect x="220" y="120" width="40" height="150" rx="4" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
            <text x="240" y="110" fill="#f87171" fontSize="13" fontWeight="extrabold" textAnchor="middle">ANODE (+)</text>
            <text x="140" y="200" fill="#fca5a5" fontSize="11" fontWeight="bold">OXIDATION OCCURS</text>
            <text x="140" y="215" fill="#fecaca" fontSize="9">Loss of Electrons (OIL)</text>
            <text x="140" y="230" fill="#cbd5e1" fontSize="9">Anions (−) migrate here</text>

            {/* CATHODE (-) Electrode */}
            <rect x="540" y="120" width="40" height="150" rx="4" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
            <text x="560" y="110" fill="#38bdf8" fontSize="13" fontWeight="extrabold" textAnchor="middle">CATHODE (−)</text>
            <text x="660" y="200" fill="#7dd3fc" fontSize="11" fontWeight="bold">REDUCTION OCCURS</text>
            <text x="660" y="215" fill="#bae6fd" fontSize="9">Gain of Electrons (RIG)</text>
            <text x="660" y="230" fill="#cbd5e1" fontSize="9">Cations (+) migrate here</text>

            {/* Migrating Ions */}
            <circle cx="360" cy="180" r="14" fill="#dc2626" />
            <text x="360" y="184" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">A⁻</text>
            <path d="M 340,180 L 270,180" stroke="#fca5a5" strokeWidth="2" markerEnd="url(#arrowRed)" />

            <circle cx="440" cy="240" r="14" fill="#0284c7" />
            <text x="440" y="244" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">C⁺</text>
            <path d="M 460,240 L 530,240" stroke="#7dd3fc" strokeWidth="2" markerEnd="url(#arrowBlue)" />

            {/* Bottom Exam Mnemonic */}
            <rect x="180" y="348" width="440" height="24" rx="6" fill="#0f172a" />
            <text x="400" y="364" fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">
              PANIC: Positive Anode, Negative Is Cathode • RED CAT &amp; AN OX
            </text>
          </svg>
        );

      // 13. RIVER DRAINAGE BASIN & MEANDER PROFILE (GEOGRAPHY)
      case 'river_profile':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <text x="400" y="28" fill="#38bdf8" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              RIVER COURSE &amp; MEANDER DYNAMICS (UPPER, MIDDLE, LOWER COURSE)
            </text>

            {/* Left Box: Three River Courses */}
            <g>
              <rect x="40" y="45" width="340" height="315" rx="16" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <text x="210" y="75" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">1. Long Profile of a River</text>

              {/* Upper Course */}
              <text x="60" y="105" fill="#facc15" fontSize="12" fontWeight="bold">• Upper Course (Steep Slope):</text>
              <text x="75" y="122" fill="#cbd5e1" fontSize="10">Vertical erosion, V-shaped valleys, waterfalls, rapids.</text>

              {/* Middle Course */}
              <text x="60" y="155" fill="#34d399" fontSize="12" fontWeight="bold">• Middle Course (Gentle Slope):</text>
              <text x="75" y="172" fill="#cbd5e1" fontSize="10">Lateral erosion &amp; deposition, wide valleys, active meanders.</text>

              {/* Lower Course */}
              <text x="60" y="205" fill="#60a5fa" fontSize="12" fontWeight="bold">• Lower Course (Flat Plain):</text>
              <text x="75" y="222" fill="#cbd5e1" fontSize="10">Dominant deposition, vast floodplains, oxbow lakes, estuaries/deltas.</text>

              {/* Gradient curve */}
              <path d="M 60,250 Q 150,300 340,320" fill="none" stroke="#38bdf8" strokeWidth="4" />
              <text x="60" y="240" fill="#f87171" fontSize="9">Source (Highland)</text>
              <text x="310" y="338" fill="#38bdf8" fontSize="9">Mouth (Sea)</text>
            </g>

            {/* Right Box: Meander Cross-Section */}
            <g>
              <rect x="400" y="45" width="360" height="315" rx="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <text x="580" y="75" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">2. Meander Cross-Section Dynamics</text>

              {/* River channel bend */}
              <path d="M 440,160 C 500,160 540,240 720,240" fill="none" stroke="#0284c7" strokeWidth="18" />

              {/* Outer Bend (Erosion / River Cliff) */}
              <circle cx="510" cy="150" r="6" fill="#ef4444" />
              <text x="510" y="130" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">OUTER BEND (River Cliff)</text>
              <text x="510" y="143" fill="#fca5a5" fontSize="9" textAnchor="middle">Fastest Current (Thalweg) ➔ Active Erosion</text>

              {/* Inner Bend (Deposition / Slip-off Slope) */}
              <circle cx="630" cy="255" r="6" fill="#10b981" />
              <text x="630" y="280" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">INNER BEND (Slip-off Slope)</text>
              <text x="630" y="295" fill="#a7f3d0" fontSize="9" textAnchor="middle">Slow Velocity ➔ Sand &amp; Shingle Deposition</text>

              {/* Oxbow Lake note */}
              <rect x="420" y="315" width="320" height="30" rx="6" fill="#1e293b" />
              <text x="580" y="334" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">
                Continuous erosion at meander neck leads to Oxbow Lake cut-off
              </text>
            </g>
          </svg>
        );

      // 14. PLATE TECTONICS & SUBDUCTION ZONE (GEOGRAPHY)
      case 'plate_tectonics':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <text x="400" y="28" fill="#f97316" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              PLATE TECTONICS: DESTRUCTIVE (CONVERGENT) BOUNDARY &amp; VOLCANO
            </text>

            {/* Ocean Plate (Dense, thin basaltic crust) */}
            <path d="M 40,200 L 320,200 L 460,340 L 40,340 Z" fill="#0f766e" stroke="#14b8a6" strokeWidth="2" />
            <text x="140" y="225" fill="#ccfbf1" fontSize="12" fontWeight="bold">DENSE OCEANIC CRUST</text>
            <text x="140" y="240" fill="#99f6e4" fontSize="9">Basaltic • Heavy • Sinks under Continental</text>
            <path d="M 260,210 L 330,280" stroke="#facc15" strokeWidth="3" markerEnd="url(#arrowBlue)" />
            <text x="310" y="250" fill="#fde047" fontSize="10" fontWeight="bold">Subduction</text>

            {/* Ocean Trench */}
            <text x="300" y="160" fill="#38bdf8" fontSize="11" fontWeight="bold">Deep Ocean Trench</text>
            <line x1="320" y1="170" x2="320" y2="195" stroke="#38bdf8" strokeWidth="2" />

            {/* Ocean Water above Oceanic Plate */}
            <rect x="40" y="120" width="280" height="80" fill="#0284c7" fillOpacity="0.4" />
            <text x="140" y="150" fill="#bae6fd" fontSize="12" fontWeight="bold">OCEAN WATER</text>

            {/* Continental Plate (Lighter, thick granitic crust) with Volcanic Mountain */}
            <path d="M 330,200 Q 420,190 500,100 Q 540,80 580,190 L 760,190 L 760,340 L 460,340 Z" fill="#78350f" stroke="#b45309" strokeWidth="2" />
            <text x="640" y="225" fill="#fef3c7" fontSize="12" fontWeight="bold">CONTINENTAL CRUST</text>
            <text x="640" y="240" fill="#fed7aa" fontSize="9">Granitic • Less Dense • Crinkles into Fold Mountains</text>

            {/* Volcano Vent & Magma Chamber */}
            <ellipse cx="520" cy="300" rx="35" ry="20" fill="#dc2626" />
            <text x="520" y="304" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Magma Chamber</text>
            {/* Magma Conduit pipe */}
            <path d="M 520,280 L 535,115" stroke="#ef4444" strokeWidth="10" />
            {/* Eruption Ash & Lava */}
            <polygon points="520,110 550,110 535,80" fill="#f97316" />
            <text x="535" y="70" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">Explosive Eruption</text>

            {/* Earthquake Focus annotation */}
            <circle cx="390" cy="270" r="10" fill="#e11d48" stroke="#fff" strokeWidth="2" />
            <text x="390" y="250" fill="#fda4af" fontSize="10" fontWeight="bold" textAnchor="middle">Earthquake Focus (Friction)</text>

            {/* Bottom summary card */}
            <rect x="50" y="348" width="700" height="24" rx="6" fill="#0f172a" />
            <text x="400" y="364" fill="#e2e8f0" fontSize="10" textAnchor="middle">
              Processes: Subduction ➔ Partial Melting ➔ Magma Rises Due to Lower Density ➔ Strato-Volcano Formation &amp; Seismic Tremors
            </text>
          </svg>
        );

      // 15. NITROGEN CYCLE (AGRICULTURE / BIOLOGY)
      case 'nitrogen_cycle':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <text x="400" y="28" fill="#10b981" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              THE NITROGEN CYCLE (ZIMSEC AGRICULTURE &amp; BIOLOGY)
            </text>

            {/* Atmospheric Nitrogen */}
            <rect x="250" y="45" width="300" height="45" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="400" y="68" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
              Atmospheric Nitrogen Gas (N₂ - 78%)
            </text>
            <text x="400" y="82" fill="#94a3b8" fontSize="9" textAnchor="middle">Unusable directly by plants</text>

            {/* Lightning Fixation */}
            <path d="M 270,90 L 180,150" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
            <text x="180" y="130" fill="#fde047" fontSize="10" fontWeight="bold">Lightning (N₂ ➔ NO₃⁻)</text>

            {/* Biological Fixation (Rhizobium in Legume Root Nodules) */}
            <rect x="50" y="170" width="220" height="60" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <text x="160" y="195" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">Rhizobium Bacteria</text>
            <text x="160" y="212" fill="#a7f3d0" fontSize="9" textAnchor="middle">In Legume root nodules (Cowpeas/Soybeans)</text>

            {/* Plant Protein & Animal Feeding */}
            <rect x="300" y="140" width="200" height="50" rx="10" fill="#1e293b" stroke="#4ade80" strokeWidth="2" />
            <text x="400" y="165" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">Plant &amp; Animal Proteins</text>
            <text x="400" y="180" fill="#cbd5e1" fontSize="9" textAnchor="middle">Death, Excretion &amp; Manure</text>

            {/* Decomposers / Ammonification */}
            <rect x="300" y="230" width="200" height="40" rx="8" fill="#1c1917" stroke="#ea580c" strokeWidth="2" />
            <text x="400" y="250" fill="#fb923c" fontSize="11" fontWeight="bold" textAnchor="middle">Ammonium Compounds (NH₄⁺)</text>
            <text x="400" y="263" fill="#cbd5e1" fontSize="8" textAnchor="middle">Formed by Decomposing Fungi &amp; Bacteria</text>

            {/* Nitrification: Nitrosomonas & Nitrobacter */}
            <rect x="300" y="300" width="200" height="45" rx="8" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
            <text x="400" y="320" fill="#c084fc" fontSize="11" fontWeight="bold" textAnchor="middle">Nitrates (NO₃⁻) in Soil</text>
            <text x="400" y="335" fill="#e9d5ff" fontSize="8" textAnchor="middle">Nitrosomonas ➔ Nitrites (NO₂⁻) ➔ Nitrobacter ➔ Nitrates</text>

            {/* Absorption by Roots */}
            <path d="M 300,320 C 180,320 180,240 300,165" fill="none" stroke="#22c55e" strokeWidth="3" markerEnd="url(#arrowBlue)" />
            <text x="190" y="280" fill="#86efac" fontSize="9" fontWeight="bold">Active Plant Uptake</text>

            {/* Denitrification back to atmosphere */}
            <rect x="560" y="170" width="190" height="60" rx="10" fill="#450a0a" stroke="#f43f5e" strokeWidth="2" />
            <text x="655" y="195" fill="#fca5a5" fontSize="11" fontWeight="bold" textAnchor="middle">Denitrifying Bacteria</text>
            <text x="655" y="210" fill="#fecaca" fontSize="9" textAnchor="middle">In waterlogged, anaerobic soil</text>
            <path d="M 655,170 L 540,90" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 3" />
            <text x="630" y="130" fill="#fda4af" fontSize="9">Converts NO₃⁻ ➔ N₂ gas</text>
          </svg>
        );

      // 16. HUMAN EYE & OPTICAL ACCOMMODATION (BIOLOGY / PHYSICS)
      case 'human_eye':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <text x="400" y="28" fill="#38bdf8" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              THE HUMAN EYE: INTERNAL ANATOMY &amp; FOCUSING (ACCOMMODATION)
            </text>

            {/* Eye Eyeball Body */}
            <circle cx="340" cy="200" r="130" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />
            {/* Retina Inner Layer */}
            <path d="M 340,73 A 127 127 0 0 1 450,265" fill="none" stroke="#ea580c" strokeWidth="4" />
            <text x="460" y="130" fill="#fb923c" fontSize="11" fontWeight="bold">Retina (Rods &amp; Cones)</text>

            {/* Fovea / Yellow Spot */}
            <circle cx="470" cy="200" r="5" fill="#facc15" />
            <text x="480" y="195" fill="#fde047" fontSize="10" fontWeight="bold">Fovea (Sharpest Vision)</text>

            {/* Optic Nerve to Brain */}
            <path d="M 440,240 C 490,260 520,300 550,330" stroke="#fbbf24" strokeWidth="16" strokeLinecap="round" />
            <text x="560" y="325" fill="#fde047" fontSize="11" fontWeight="bold">Optic Nerve to Brain</text>
            <text x="560" y="340" fill="#94a3b8" fontSize="9">Blind Spot (No photoreceptors)</text>

            {/* Cornea (Transparent front bulge) */}
            <path d="M 230,130 C 180,160 180,240 230,270" fill="none" stroke="#38bdf8" strokeWidth="5" />
            <text x="140" y="195" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">Cornea (Refracts Light)</text>

            {/* Biconvex Crystalline Lens */}
            <ellipse cx="260" cy="200" rx="14" ry="40" fill="#0284c7" fillOpacity="0.7" stroke="#7dd3fc" strokeWidth="2" />
            <text x="260" y="150" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">Biconvex Lens</text>

            {/* Ciliary Muscle and Suspensory Ligaments */}
            <circle cx="260" cy="155" r="7" fill="#dc2626" />
            <circle cx="260" cy="245" r="7" fill="#dc2626" />
            <text x="210" y="135" fill="#fca5a5" fontSize="9">Ciliary Muscle</text>

            {/* Iris & Pupil */}
            <line x1="242" y1="170" x2="242" y2="185" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
            <line x1="242" y1="215" x2="242" y2="230" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
            <text x="200" y="215" fill="#c084fc" fontSize="9" fontWeight="bold">Iris (Controls Pupil size)</text>

            {/* Side Card: Accommodation Summary */}
            <g>
              <rect x="520" y="55" width="250" height="230" rx="14" fill="#0f172a" stroke="#334155" />
              <text x="540" y="85" fill="#38bdf8" fontSize="13" fontWeight="bold">Accommodation Rules:</text>
              
              <text x="540" y="115" fill="#4ade80" fontSize="11" fontWeight="bold">1. Viewing Distant Object:</text>
              <text x="545" y="130" fill="#cbd5e1" fontSize="10">• Ciliary muscles RELAX</text>
              <text x="545" y="145" fill="#cbd5e1" fontSize="10">• Suspensory ligaments TAUT</text>
              <text x="545" y="160" fill="#cbd5e1" fontSize="10">• Lens becomes THIN / Flat</text>

              <text x="540" y="185" fill="#f59e0b" fontSize="11" fontWeight="bold">2. Viewing Near Object:</text>
              <text x="545" y="200" fill="#cbd5e1" fontSize="10">• Ciliary muscles CONTRACT</text>
              <text x="545" y="215" fill="#cbd5e1" fontSize="10">• Suspensory ligaments SLACK</text>
              <text x="545" y="230" fill="#cbd5e1" fontSize="10">• Lens becomes FAT / Rounded</text>
            </g>
          </svg>
        );

      // 17. TRIGONOMETRY & PYTHAGORAS THEOREM (MATHEMATICS)
      case 'trigonometry_pythagoras':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <text x="400" y="28" fill="#38bdf8" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              RIGHT-ANGLED TRIANGLE: PYTHAGORAS &amp; TRIGONOMETRIC RATIOS
            </text>

            {/* Triangle Shape */}
            <g>
              <polygon points="120,280 440,280 440,90" fill="#0369a1" fillOpacity="0.25" stroke="#0284c7" strokeWidth="4" />
              
              {/* Right Angle Symbol at (440, 280) */}
              <rect x="415" y="255" width="25" height="25" fill="none" stroke="#facc15" strokeWidth="2.5" />
              <text x="427" y="272" fill="#facc15" fontSize="11" fontWeight="bold">90°</text>

              {/* Angle Theta at (120, 280) */}
              <path d="M 170,280 A 50 50 0 0 0 162,255" fill="none" stroke="#4ade80" strokeWidth="3" />
              <text x="180" y="270" fill="#4ade80" fontSize="16" fontWeight="extrabold">θ</text>

              {/* Sides Labels */}
              {/* Adjacent */}
              <text x="280" y="310" fill="#93c5fd" fontSize="13" fontWeight="bold" textAnchor="middle">
                Adjacent (a) = Base
              </text>

              {/* Opposite */}
              <text x="465" y="190" fill="#fca5a5" fontSize="13" fontWeight="bold">
                Opposite (b) = Height
              </text>

              {/* Hypotenuse */}
              <text x="240" y="165" fill="#fde047" fontSize="13" fontWeight="bold" transform="rotate(-30 240 165)">
                Hypotenuse (c) = Longest Side
              </text>
            </g>

            {/* Right Hand Formula Card */}
            <g>
              <rect x="520" y="45" width="240" height="310" rx="16" fill="#0f172a" stroke="#334155" />
              <text x="640" y="75" fill="#fde047" fontSize="13" fontWeight="bold" textAnchor="middle">PYTHAGORAS THEOREM</text>
              <rect x="545" y="88" width="190" height="35" rx="8" fill="#1e293b" />
              <text x="640" y="112" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                a² + b² = c²
              </text>

              <line x1="540" y1="135" x2="740" y2="135" stroke="#334155" />

              <text x="640" y="160" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
                SOH - CAH - TOA
              </text>
              <text x="540" y="190" fill="#86efac" fontSize="12" fontWeight="bold">• sin θ = Opposite / Hypotenuse</text>
              <text x="540" y="215" fill="#93c5fd" fontSize="12" fontWeight="bold">• cos θ = Adjacent / Hypotenuse</text>
              <text x="540" y="240" fill="#fca5a5" fontSize="12" fontWeight="bold">• tan θ = Opposite / Adjacent</text>

              <rect x="535" y="265" width="210" height="70" rx="8" fill="#032b43" />
              <text x="640" y="285" fill="#7dd3fc" fontSize="10" textAnchor="middle" fontWeight="bold">Exam Tip:</text>
              <text x="640" y="302" fill="#bae6fd" fontSize="9" textAnchor="middle">For non-right triangles, use:</text>
              <text x="640" y="320" fill="#fde047" fontSize="9" textAnchor="middle" fontFamily="monospace">Sine Rule: a/sinA = b/sinB = c/sinC</text>
            </g>
          </svg>
        );

      // 18. GREAT ZIMBABWE MONUMENT ARCHITECTURE (HERITAGE / HISTORY)
      case 'great_zimbabwe':
        return (
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none font-sans">
            <text x="400" y="28" fill="#eab308" fontSize="16" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
              GREAT ZIMBABWE: DRY-STONE ARCHITECTURE &amp; HILL COMPLEX
            </text>

            {/* Conical Tower */}
            <g>
              <polygon points="180,340 195,140 225,140 240,340" fill="#57534e" stroke="#78716c" strokeWidth="2.5" />
              {/* Stone layering lines */}
              {[...Array(12)].map((_, i) => (
                <line key={i} x1={182 + i} y1={160 + i * 15} x2={238 - i} y2={160 + i * 15} stroke="#292524" strokeWidth="1.5" />
              ))}
              <text x="210" y="125" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">Conical Tower (10m high)</text>
              <text x="210" y="360" fill="#cbd5e1" fontSize="9" textAnchor="middle">Grain Silo / Royal Prestige Symbol</text>
            </g>

            {/* Great Enclosure Dry Stone Wall (Imba Huru) */}
            <g>
              <path d="M 280,340 C 290,200 450,200 480,340" fill="none" stroke="#78716c" strokeWidth="20" strokeLinecap="round" />
              {/* Chevron Pattern on top wall */}
              <path d="M 320,200 L 330,190 L 340,200 L 350,190 L 360,200 L 370,190 L 380,200 L 390,190 L 400,200 L 410,190 L 420,200 L 430,190 L 440,200" fill="none" stroke="#facc15" strokeWidth="3" />
              <text x="380" y="175" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
                Chevron Pattern (Fertility &amp; Royal Lineage)
              </text>
              <text x="380" y="280" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                The Great Enclosure (Imba Huru)
              </text>
              <text x="380" y="298" fill="#e2e8f0" fontSize="9" textAnchor="middle">
                Granite blocks shaped by fire &amp; water • No mortar
              </text>
            </g>

            {/* Zimbabwe Bird Emblem on Right */}
            <g>
              <rect x="520" y="55" width="250" height="295" rx="16" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
              <circle cx="645" cy="110" r="30" fill="#854d0e" stroke="#facc15" strokeWidth="2" />
              <text x="645" y="115" fill="#fef08a" fontSize="14" textAnchor="middle" fontWeight="bold">🦅</text>
              <text x="645" y="160" fill="#fde047" fontSize="13" fontWeight="bold" textAnchor="middle">
                Hungwe (Soapstone Bird)
              </text>
              <text x="645" y="180" fill="#cbd5e1" fontSize="10" textAnchor="middle">
                Shona Royal Spiritual Totem
              </text>

              <line x1="540" y1="200" x2="750" y2="200" stroke="#334155" />

              <text x="540" y="225" fill="#4ade80" fontSize="11" fontWeight="bold">Key Archaeological Features:</text>
              <text x="545" y="243" fill="#cbd5e1" fontSize="9">• Hill Complex: King's spiritual residence</text>
              <text x="545" y="260" fill="#cbd5e1" fontSize="9">• Valley Enclosures: Citizens &amp; crafts</text>
              <text x="545" y="277" fill="#cbd5e1" fontSize="9">• Indian Ocean Trade: Porcelain &amp; glass</text>
              <text x="545" y="295" fill="#cbd5e1" fontSize="9">• UNESCO World Heritage site (1986)</text>
              <text x="545" y="325" fill="#fbbf24" fontSize="9" fontWeight="bold">Preserved by NMMZ &amp; UNESCO</text>
            </g>
          </svg>
        );

      // Default Fallback
      default:
        return (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-cyan-500/20 text-cyan-300">
            <Info className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
            <p className="text-sm font-semibold">Visual Diagram Reference Available</p>
            <p className="text-xs text-slate-400 mt-1">Diagram ID: {diagramId}</p>
          </div>
        );
    }
  };

  return (
    <div className="my-5 rounded-3xl bg-slate-950/80 border border-cyan-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Interactive Visual Syllabus Diagram
            </h4>
            <p className="text-[11px] text-slate-400">
              High-resolution vector study graphic • Labeled components for exam revision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold uppercase">
            Vector Visual Aid
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="rounded-2xl overflow-hidden bg-slate-900/90 border border-white/[0.06] p-2 sm:p-4 shadow-inner">
        {renderDiagramSvg()}
      </div>

      {caption && (
        <div className="mt-3.5 flex items-start gap-2 text-xs text-slate-300 font-sans leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{caption}</span>
        </div>
      )}
    </div>
  );
};
