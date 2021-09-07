import {
  random,
  randomBias,
  seedPRNG,
  createVoronoiDiagram,
} from "@georgedoescode/generative-utils";
import { polygonScale } from "geometric";

const COLOR_PROPS = [...Array(8)].map((_, i) => `--avatar-color-${i + 1}`);

function polygon(ctx, points) {
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 0; i < points.length - 1; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
}

class VoronoiAvatar {
  static get inputProperties() {
    return ["--avatar-seed", ...COLOR_PROPS];
  }

  getDefinedColors(props) {
    return COLOR_PROPS.map((key) => {
      return props.get(key).toString().trim();
    }).filter((value) => value);
  }

  propToString(prop) {
    return prop.toString().trim();
  }

  propToNumber(prop) {
    return parseFloat(prop);
  }

  paint(ctx, geometry, props) {
    const width = geometry.width;
    const height = geometry.height;

    const seed = this.propToString(props.get("--avatar-seed") || 1234256);
    const colors = this.getDefinedColors(props);

    seedPRNG(seed);

    const focus = {
      x: randomBias(0, width, width / 2),
      y: randomBias(0, height, height / 2),
    };

    const points = [...Array(random(4, 32, true))].map(() => {
      return {
        x: randomBias(0, width, focus.x, 0),
        y: randomBias(0, height, focus.y, 0),
      };
    });

    const { cells } = createVoronoiDiagram({
      width,
      height,
      points,
    });

    ctx.lineWidth = 24;

    cells.forEach((cell) => {
      const choice = random(["line", "circle", "cell"]);
      ctx.fillStyle = random(colors);
      ctx.strokeStyle = random(colors);

      switch (choice) {
        case "circle":
          ctx.beginPath();
          ctx.arc(
            cell.centroid.x,
            cell.centroid.y,
            cell.innerCircleRadius / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.closePath();
          break;

        case "line":
          ctx.beginPath();
          ctx.save();
          ctx.translate(cell.centroid.x, cell.centroid.y);
          ctx.rotate(random(0, 360));
          ctx.moveTo(-cell.innerCircleRadius / 2, -cell.innerCircleRadius / 2);
          ctx.lineTo(cell.innerCircleRadius / 2, cell.innerCircleRadius / 2);
          ctx.restore();
          ctx.stroke();
          break;

        case "cell":
          ctx.beginPath();
          polygon(ctx, polygonScale(cell.points, 0.85));
          ctx.fill();
          ctx.closePath();
          break;
      }
    });
  }
}

registerPaint("voronoiAvatar", VoronoiAvatar);
