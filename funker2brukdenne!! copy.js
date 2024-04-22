new p5((sketch) => {
  let canvasSize;
  let particles = [];
  let pallete = ["#07171b", "133c3e", "#025250", "#fd7d02", "#fa9f03"];
  let isRunning = true;
  let seedValue = sketch.int($fx.rand() * 100000); // Seed for noise and random
  let lineThickness = 5; // Fixed line thickness for consistency

  sketch.setup = function () {
    canvasSize = sketch.min(sketch.windowWidth, sketch.windowHeight);
    sketch.createCanvas(canvasSize, canvasSize);
    sketch.rectMode(sketch.CENTER);
    sketch.strokeWeight(lineThickness);
    sketch.noiseSeed(seedValue);
    sketch.randomSeed(seedValue); // Ensure the random seed is set for other random usages
    newParticles();
    sketch.frameRate(30);
  };

  sketch.draw = function () {
    sketch.randomSeed(seedValue); // Reset random seed each frame for consistency
    sketch.noiseSeed(seedValue); // Reset noise seed each frame if necessary
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
  };

  function newParticles() {
    sketch.background(0);
    sketch.shuffle(pallete, true); // Make sure shuffle uses a seeded random
    for (let i = 1; i < 5000; i++) {
      let posX = sketch.random() * 2 - 0.5;
      let posY = sketch.random() * 2 - 0.5;
      particles.push(new Particle(posX * canvasSize, posY * canvasSize));
    }
    $fx.features({
      "Particle Count": particles.length,
      Palette: pallete.toString(),
      "Seed Value": seedValue,
      "Line Thickness": lineThickness.toFixed(2),
    });
  }

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.s = 0;
      this.noiseScale = 0.0005;
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
      sketch.noStroke();
      sketch.fill(this.col);
      sketch.rect(this.x, this.y, this.s, this.s);
    }

    move() {
      let maxS = sketch.map(this.life, 2500, 0, 10, 0);
      let angle =
        sketch.noise(
          this.x * this.noiseScale,
          this.y * this.noiseScale,
          this.nn
        ) * sketch.TAU;
      this.x += sketch.cos(angle);
      this.y += sketch.sin(angle);
      this.s = sketch.noise(this.x * 0.001, this.y * 0.001, this.nn) * maxS;
      this.nn += 0.0001;
      this.life--;
    }

    isDead() {
      return this.life < 0;
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
