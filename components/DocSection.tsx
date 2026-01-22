
import React from 'react';

interface DocItemProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

const DocItem: React.FC<DocItemProps> = ({ number, title, children }) => (
  <div className="mb-12 border-l-4 border-orange-400 pl-6 animate-fadeIn">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-3xl font-bold text-orange-400 opacity-50">{number}</span>
      <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
    </div>
    <div className="text-slate-600 leading-relaxed space-y-3">
      {children}
    </div>
  </div>
);

const DocSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <DocItem number="01" title="High Concept Overview">
        <p>
          <strong>Echo Isles: Rhythm of Treasures</strong> is a 2D puzzle-exploration adventure where sound is your primary navigational tool. 
          In a world where music has been stolen by a "Silence Curse," players step into the shoes of a young explorer equipped with a 
          magical Echo Scanner. You must traverse vibrant, rhythmic islands to recover Echo Crystals—musical memories that restore the 
          world's harmony.
        </p>
      </DocItem>

      <DocItem number="02" title="Core Gameplay Description">
        <p>The game loop revolves around sensory exploration. Players land on a small, hand-crafted island map. Unlike traditional games, 
        there are no quest markers. You must move across platforms, dive into lagoons, and activate your scanner (Q) to send out pulses.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Pulse & Detect:</strong> The scanner highlights rhythmic anomalies in the environment.</li>
          <li><strong>Listen & Align:</strong> Treasures pulse in specific patterns (e.g., Boom-clap-clap). Players must match their movement 
          or interaction to the beat to "attune" to the treasure.</li>
          <li><strong>Unlock:</strong> Collect all treasures on an island to restore its melody and unlock the path to the next biome.</li>
        </ul>
      </DocItem>

      <DocItem number="03" title="Unique Mechanics Explanation">
        <p><strong>Sound Wave Detection:</strong> The UI replaces a traditional mini-map with a "Rhythm Bar" that grows more vivid 
        as you approach a treasure. The closer you are, the louder and more complex the rhythmic layer becomes.</p>
        <p><strong>Environmental Beats:</strong> Platforms don't just move; they pulse. A vine might only be grabbable on the "downbeat." 
        A water current might reverse on every fourth measure, requiring the player to "read" the song of the island to survive.</p>
      </DocItem>

      <DocItem number="04" title="World & Art Style">
        <p>A vibrant, "Pop-Art" cartoon style with heavy emphasis on layered parallax backgrounds. Every island represents a different 
        musical genre visually:</p>
        <ul className="list-disc pl-5">
          <li><strong>Visual Feedback:</strong> Trees sway to the background track. Flowers bloom and close to the beat.</li>
          <li><strong>Color Palette:</strong> Desaturated and greyish when "Silent," exploding into neon-vibrant hues as you collect treasures.</li>
        </ul>
      </DocItem>

      <DocItem number="05" title="Levels & Progression">
        <p>10 unique islands across 4 Biomes:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong>Percussion Plains:</strong> Simple 4/4 beats (Jungle theme).</li>
          <li><strong>Melody Reef:</strong> Fluid, syncopated rhythms (Steel drum theme).</li>
          <li><strong>BPM Peaks:</strong> Fast-paced, high-energy tracks (Techno/Volcano).</li>
          <li><strong>Orchestral Abyss:</strong> Complex, layered symphonies (Deep sea).</li>
        </ol>
      </DocItem>

      <DocItem number="06" title="Characters & Enemies">
        <p><strong>The Explorer:</strong> A cute, expressive character in a poncho with oversized headphones.</p>
        <p><strong>Rhythm Disruptors:</strong>
          <br/>- <em>Time-Shifting Parrots:</em> Mimic your scanner but off-beat, creating confusing visual "ghosts."
          <br/>- <em>Sand Crabs:</em> Block paths and can only be bypassed by "Hiding" (E) during their active snap-measure.
        </p>
      </DocItem>

      <DocItem number="07" title="Controls & UI">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-orange-500 mb-2">Controls</h4>
            <ul className="text-sm">
              <li><strong>WASD / Arrows:</strong> Movement</li>
              <li><strong>Space:</strong> Jump / Attune</li>
              <li><strong>Q:</strong> Echo Pulse</li>
              <li><strong>E:</strong> Calm / Hide</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-orange-500 mb-2">UI Elements</h4>
            <ul className="text-sm">
              <li><strong>Floating Beat Bar:</strong> Near player head.</li>
              <li><strong>Scanner Gauge:</strong> Circular cooldown around 'Q' icon.</li>
              <li><strong>Melody Meter:</strong> Top screen, fills as island revives.</li>
            </ul>
          </div>
        </div>
      </DocItem>

      <DocItem number="08" title="Rewards & Endgame">
        <p>Collecting <strong>Echo Crystals</strong> builds the "World Symphony." Rare <strong>Rhythm Relics</strong> unlock 
        new instrument layers for your home base. The final challenge is the <strong>Heart of Echoes</strong>, a boss level 
        that is a pure rhythm-heaven style gauntlet through all previously visited islands' themes.</p>
      </DocItem>

      <DocItem number="09" title="Why This Game Feels Fresh">
        <p>Most treasure hunts are visual chores (find the pixel). <em>Echo Isles</em> turns exploration into an 
        <strong>auditory puzzle</strong>. It rewards players for "feeling" the game rather than just looking at a map, 
        bridging the gap between 2D platformers and rhythm games like <em>HIFI Rush</em> or <em>Rhythm Heaven</em>.</p>
      </DocItem>

      <DocItem number="10" title="Potential Expansion Ideas">
        <ul className="list-disc pl-5">
          <li><strong>Co-op Jam:</strong> Two players explore together, one handling the melody and one the percussion cues.</li>
          <li><strong>Level Composer:</strong> Allow players to hide their own treasures by composing a rhythm pattern.</li>
          <li><strong>VR Support:</strong> 3D spatial audio treasure hunting in a first-person mode.</li>
        </ul>
      </DocItem>
    </div>
  );
};

export default DocSection;
