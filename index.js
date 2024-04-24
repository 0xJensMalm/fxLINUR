new p5((sketch) => {
  let canvasSize;
  let particles = [];
  let isRunning = true;
  let seedValue = sketch.int($fx.rand() * 100000); // Seed for noise and random
  let frameThickness = 30; // Frame thickness in pixels

  const paletteOptions = [
    {
      name: "Deep Sea",
      palette: [
        "#07171b",
        "#133c3e",
        "#025250",
        "#fd7d02",
        "#fa9f03",
        // "#000000", //black
      ],
      weight: 2,
    },
    {
      name: "Sunset",
      palette: [
        "#402334",
        "#6a0136",
        "#ac0349",
        "#d9042b",
        "#f14616",
        //    "#000000", //black
      ],
      weight: 2,
    },
    {
      name: "Bloodmetal",
      palette: [
        "#d90429",
        "#ef233c",
        "#edf2f4",
        "#8d99ae",
        "#2b2d42",
        //      "#000000", //black
      ],
      weight: 2,
    },
    {
      name: "Forest Retreat",
      palette: [
        "#0b4f6c", // dark blue
        "#01baef", // sky blue
        "#fbfbff", // off white
        "#040f16", // almost black
        "#90be6d", // soft green
      ],
      weight: 2,
    },
    {
      name: "Vintage Autumn",
      palette: [
        "#b84a62", // dusty rose
        "#ab4e68", // deep mauve
        "#cc9b6d", // golden tan
        "#7a5c58", // muted brown
        "#463f3a", // dark grey
      ],
      weight: 2,
    },
    {
      name: "Arctic Neon",
      palette: [
        "#00f5d4", // neon teal
        "#fae3d9", // blush pink
        "#bbf0e8", // ice blue
        "#282846", // midnight blue
        "#8d2828", // crimson red
      ],
      weight: 2,
    },
  ];

  const noiseOptions = [
    // 5 = stor % 1 = liten %
    { name: "Subtle", value: 0.0003, weight: 1 },
    { name: "Medium", value: 0.0007, weight: 1 },
    { name: "Hard", value: 0.0008, weight: 1 },
  ];

  sketch.setup = function () {
    canvasSize = sketch.min(sketch.windowWidth, sketch.windowHeight);
    sketch.createCanvas(canvasSize, canvasSize);
    sketch.rectMode(sketch.CENTER);

    sketch.noiseSeed(seedValue);
    sketch.randomSeed(seedValue);

    lineThickness = sketch.map(sketch.random(), 0, 1, 3, 4);

    const selectedNoise = selectWeightedNoise(noiseOptions);
    noiseScale = selectedNoise.value; // Use selected noise value
    noiseName = selectedNoise.name; // Store noise name for feature recording

    sketch.strokeWeight(lineThickness);

    let selectedPalette = selectWeightedPalette(paletteOptions);
    pallete = selectedPalette.palette;
    paletteName = selectedPalette.name;

    newParticles();
    sketch.frameRate();
  };

  sketch.draw = function () {
    if (!isRunning) return;

    for (let i = 0; i < particles.length; i++) {
      particles[i].run(sketch);
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }
    if (particles.length === 0) {
      newParticles();
    }

    if (sketch.frameCount >= 800) {
      isRunning = false; // Stop the sketch after 800 frames
    }
    // Drawing the frame
    sketch.fill(0); // Set the color of the frame to black
    sketch.noStroke(); // No border for the frame rectangles
    // Draw rectangles on each side
    sketch.rect(0, canvasSize / 2, frameThickness, canvasSize); // Left
    sketch.rect(canvasSize, canvasSize / 2, frameThickness, canvasSize); // Right
    sketch.rect(canvasSize / 2, 0, canvasSize, frameThickness); // Top
    sketch.rect(canvasSize / 2, canvasSize, canvasSize, frameThickness); // Bottom
  };

  function selectWeightedPalette(options) {
    const totalWeight = options.reduce((acc, option) => acc + option.weight, 0);
    let random = sketch.random() * totalWeight; // Use p5's seeded random
    for (let option of options) {
      if (random < option.weight) {
        return { name: option.name, palette: option.palette };
      }
      random -= option.weight;
    }
  }

  function selectWeightedNoise(options) {
    const totalWeight = options.reduce((acc, option) => acc + option.weight, 0);
    let random = sketch.random() * totalWeight; // Use p5's seeded random
    for (let option of options) {
      if (random < option.weight) {
        return option;
      }
      random -= option.weight;
    }
  }

  function newParticles() {
    sketch.background(0);
    sketch.shuffle(pallete, true); // Make sure shuffle uses a seeded random
    for (let i = 1; i < 8000; i++) {
      let posX = sketch.random() * 2 - 0.5;
      let posY = sketch.random() * 2 - 0.5;
      particles.push(
        new Particle(posX * canvasSize, posY * canvasSize, noiseScale)
      );
    }
    $fx.features({
      "Particle Count": particles.length,
      "Color Palette": paletteName,
      "Seed Value": seedValue,
      "Line Thickness": lineThickness.toFixed(2),
      "Noise Scale": noiseScale.toFixed(5),
      "Noise Type": noiseName,
    });
  }

  class Particle {
    constructor(x, y, noiseScale) {
      // Include noiseScale parameter
      this.x = x;
      this.y = y;
      this.s = 0;
      this.noiseScale = noiseScale; // Use the passed noiseScale
      this.life = 800;
      this.nn = 0;
      this.col = sketch.color(
        pallete[
          sketch.int(
            sketch.constrain(
              sketch.map(
                sketch.noise(
                  this.x * this.noiseScale,
                  this.y * this.noiseScale
                ), // Use the dynamic noiseScale
                0,
                1,
                -3,
                10
              ),
              0,
              4
            )
          )
        ]
      );
    }

    show() {
      sketch.noStroke();
      sketch.fill(this.col);
      sketch.rect(this.x, this.y, this.s, this.s);
    }

    move() {
      // 'maxS' controls the maximum size of the particles, which scales down as their 'life' decreases.
      let maxS = sketch.map(this.life, 800, 0, lineThickness, 0);

      // Calculate angle based on noise, which determines the direction of the particle's movement.
      let angle =
        sketch.noise(
          this.x * this.noiseScale,
          this.y * this.noiseScale,
          this.nn
        ) * sketch.TAU;

      // Update the particle's position based on the calculated angle.
      this.x += sketch.cos(angle);
      this.y += sketch.sin(angle);

      // Enhance wave motion by adding a lateral movement component. Here, 'waveAmplitude' controls the
      // strength of the lateral movement, and you can adjust this to see different wave patterns.
      let waveAmplitude = 0.001; // This can be adjusted or made dynamic.
      this.x += sketch.cos(angle + sketch.PI / 2) * waveAmplitude; // Adds lateral movement based on angle.
      this.y += sketch.sin(angle + sketch.PI / 2) * waveAmplitude; // Adjusts y position for wave pattern.

      // Update 's' based on a noise function, giving a dynamic size effect as they move.
      this.s = sketch.noise(this.x * 0.001, this.y * 0.001, this.nn) * maxS;

      // Increment 'nn' to evolve the noise value over time, giving a fluid motion effect.
      this.nn += 0.0001;

      // Decrease 'life' each frame, causing the particle to shrink and eventually disappear.
      this.life--;
    }

    isDead() {
      return this.life <= 0;
    }

    run() {
      this.show();
      this.move();
    }
  }
});
function updateDOM() {
  // Update DOM only if necessary or during specific interactions
  document.body.style.background = "#000000";
  document.body.innerHTML = `
      <div style="color: #ffffff;">
        <p>hash: ${$fx.hash}</p>
        <p>minter: ${$fx.minter}</p>
        <p>iteration: ${$fx.iteration}</p>
        <p>inputBytes: ${$fx.inputBytes}</p>
        <p>context: ${$fx.context}</p>
        <p>params:</p>
        <pre>${$fx.stringifyParams($fx.getRawParams())}</pre>
      </div>
    `;
}
