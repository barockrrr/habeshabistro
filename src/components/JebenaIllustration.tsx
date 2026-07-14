export function JebenaIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 360"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Steam wisps — the one orchestrated motion moment on this page */}
      <g stroke="#F0DFC0" strokeWidth="3" strokeLinecap="round">
        <path d="M120 96 Q112 76 124 60 Q134 46 122 30" className="animate-steam-1" style={{ transformOrigin: '120px 96px' }} />
        <path d="M160 96 Q152 74 164 56 Q174 42 162 24" className="animate-steam-2" style={{ transformOrigin: '160px 96px' }} />
        <path d="M200 96 Q192 76 204 60 Q214 46 202 30" className="animate-steam-3" style={{ transformOrigin: '200px 96px' }} />
      </g>

      {/* Jebena body */}
      <g stroke="#E8A93B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* neck */}
        <path d="M140 100 L142 78 Q142 66 154 62 L168 62 Q180 66 180 78 L182 100" />
        {/* spout */}
        <path d="M182 108 Q214 100 224 118 Q228 126 218 130 Q206 134 198 124" />
        {/* bulbous body */}
        <path d="M110 108 Q96 150 106 196 Q116 250 160 258 Q204 250 214 196 Q224 150 210 108 Z" />
        {/* base ring */}
        <ellipse cx="160" cy="258" rx="30" ry="8" />
        {/* woven neck band (nods to tilet trim) */}
        <path d="M140 100 L182 100" stroke="#A8371F" strokeWidth="5" />
      </g>

      {/* Resting stand */}
      <g stroke="#C9B79A" strokeWidth="2.5" strokeLinecap="round">
        <path d="M96 296 L224 296" />
        <path d="M108 296 L108 272 Q108 264 116 264 L204 264 Q212 264 212 272 L212 296" />
      </g>

      {/* Two small cups (sini) beside the pot — communal serving */}
      <g stroke="#F0DFC0" strokeWidth="2.5" strokeLinecap="round">
        <path d="M80 300 Q80 316 96 316 Q112 316 112 300" />
        <path d="M208 300 Q208 316 224 316 Q240 316 240 300" />
      </g>
    </svg>
  );
}
