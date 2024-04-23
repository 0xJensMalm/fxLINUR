new p5((sketch) => {
  let canvasSize;
  let particles = [];
  let isRunning = true;
  let seedValue = sketch.int($fx.rand() * 100000); // Seed for noise and random
  let frameThickness = 30; // Frame thickness in pixels

  let spiraling = true; // Boolean to control spiraling motion

  const paletteOptions = [
    {
      name: "Deep Sea",
      palette: [
        "#07171b",
        "#133c3e",
        "#025250",
        "#fd7d02",
        "#fa9f03",
        "#000000", //black
      ],
      weight: 1,
    },
    {
      name: "Sunset",
      palette: [
        "#402334",
        "#6a0136",
        "#ac0349",
        "#d9042b",
        "#f14616",
        "#000000", //black
      ],
      weight: 2,
    },
    {
      name: "Gun Metal",
      palette: [
        "#d90429",
        "#ef233c",
        "#edf2f4",
        "#8d99ae",
        "#2b2d42",
        "#000000", //black
      ],
      weight: 3,
    },
  ];

  const noiseOptions = [
    { name: "Subtle", value: 0.0003, weight: 1 },
    { name: "Medium", value: 0.0007, weight: 1 },
    { name: "Hard", value: 0.001, weight: 1 },
    { name: "Extreme", value: 0.002, weight: 1 },
  ];

  sketch.setup = function () {
    canvasSize = sketch.min(sketch.windowWidth, sketch.windowHeight);
    sketch.createCanvas(canvasSize, canvasSize);
    sketch.rectMode(sketch.CENTER);

    sketch.noiseSeed(seedValue);
    sketch.randomSeed(seedValue);

    lineThickness = sketch.map(sketch.random(), 0, 1, 2, 4);

    const selectedNoise = selectWeightedNoise(noiseOptions);
    noiseScale = selectedNoise.value; // Use selected noise value
    noiseName = selectedNoise.name; // Store noise name for feature recording

    sketch.strokeWeight(lineThickness);

    let selectedPalette = selectWeightedPalette(paletteOptions);
    pallete = selectedPalette.palette;
    paletteName = selectedPalette.name;

    newParticles();
    sketch.frameRate(30);
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
    for (let i = 1; i < 5000; i++) {
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
      this.x = x;
      this.y = y;
      this.s = 0; // Size of the particle
      this.noiseScale = noiseScale; // Scale of noise influence
      this.life = 800; // Lifetime of the particle
      this.nn = 0; // Incremental value for noise calculation
      // Color of the particle based on noise and palette
      this.col = sketch.color(
        pallete[
          sketch.int(
            sketch.constrain(
              sketch.map(
                sketch.noise(
                  this.x * this.noiseScale,
                  this.y * this.noiseScale
                ),
                0,
                1,
                -3,
                8.5
              ),
              0,
              4
            )
          )
        ]
      );
    }

    show() {
      // Display the particle on the canvas
      sketch.noStroke();
      sketch.fill(this.col);
      sketch.rect(this.x, this.y, this.s, this.s);
    }

    move() {
      // Choose the type of movement based on the spiraling boolean
      if (spiraling) {
        this.moveInSpiral();
      } else {
        this.standardMove();
      }
    }

    moveInSpiral() {
      // Spiraling motion
      let angleIncrement = sketch.TAU / this.life; // Smaller angle as life decreases to create spiraling inwards
      this.nn += 0.0001;
      this.life--;

      let angle =
        sketch.noise(
          this.x * this.noiseScale,
          this.y * this.noiseScale,
          this.nn
        ) *
          sketch.TAU +
        angleIncrement;

      let radius = sketch.map(this.life, 800, 0, 20, 1); // Decrease radius over life to spiral inwards
      this.x += radius * sketch.cos(angle);
      this.y += radius * sketch.sin(angle);

      this.updateSize();
    }

    standardMove() {
      // Normal movement
      let maxS = sketch.map(this.life, 800, 0, lineThickness, 0);
      let angle =
        sketch.noise(
          this.x * this.noiseScale,
          this.y * this.noiseScale,
          this.nn
        ) * sketch.TAU;
      this.x += sketch.cos(angle);
      this.y += sketch.sin(angle);
      this.nn += 0.0001;
      this.life--;

      this.updateSize();
    }

    updateSize() {
      // Update the size of the particle based on its remaining life
      let maxS = sketch.map(this.life, 800, 0, lineThickness, 0);
      this.s = sketch.noise(this.x * 0.001, this.y * 0.001, this.nn) * maxS;
    }

    isDead() {
      // Check if the particle's life has ended
      return this.life <= 0;
    }

    run() {
      // Execute the particle's behaviors
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
