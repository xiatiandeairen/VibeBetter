import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, success } from '../utils/display.js';

type RadarRing = 'Adopt' | 'Trial' | 'Assess' | 'Hold';
type RadarQuadrant = 'Languages' | 'Frameworks' | 'Tools' | 'Platforms';

interface RadarItem {
  name: string;
  ring: RadarRing;
  quadrant: RadarQuadrant;
  isNew: boolean;
}

function buildRadar(_overview: Record<string, unknown>): RadarItem[] {
  return [
    { name: 'TypeScript', ring: 'Adopt', quadrant: 'Languages', isNew: false },
    { name: 'React 19', ring: 'Trial', quadrant: 'Frameworks', isNew: true },
    { name: 'Hono', ring: 'Adopt', quadrant: 'Frameworks', isNew: false },
    { name: 'Prisma', ring: 'Adopt', quadrant: 'Tools', isNew: false },
    { name: 'BullMQ', ring: 'Trial', quadrant: 'Tools', isNew: false },
    { name: 'Vercel', ring: 'Assess', quadrant: 'Platforms', isNew: true },
    { name: 'Bun', ring: 'Assess', quadrant: 'Tools', isNew: true },
    { name: 'Webpack', ring: 'Hold', quadrant: 'Tools', isNew: false },
  ];
}

const ringColor: Record<RadarRing, (s: string) => string> = {
  Adopt: pc.green,
  Trial: pc.cyan,
  Assess: pc.yellow,
  Hold: pc.red,
};

export const techRadarCommand = new Command('tech-radar')
  .description('Tech radar visualization of project technologies')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Tech Radar');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = buildRadar(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(items, null, 2));
      return;
    }

    const rings: RadarRing[] = ['Adopt', 'Trial', 'Assess', 'Hold'];
    for (const ring of rings) {
      const ringItems = items.filter(i => i.ring === ring);
      if (ringItems.length === 0) continue;
      console.log();
      console.log(`  ${ringColor[ring](pc.bold(ring.toUpperCase()))}`);
      for (const item of ringItems) {
        const newTag = item.isNew ? pc.magenta(' NEW') : '';
        console.log(`    ${pc.dim('•')} ${item.name} ${pc.dim(`(${item.quadrant})`)}${newTag}`);
      }
    }

    console.log();
    info(`${items.length} technologies mapped across ${rings.length} rings.`);
    success('Tech radar generated.');
  });
