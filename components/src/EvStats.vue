<template>
  <div class="ev-stats">
    <div @click="showDetails = !showDetails">
      <span class="fps">
        {{ cpu.percentCPUUsage && cpu.percentCPUUsage.toFixed(1) }}% CPU
        &bull;
      </span>

      <span class="fps">
        {{ process.private && toMb(process.private*1000, 1) }}MB RAM
        &bull;
      </span>

      <span class="fps">
        {{ fps }} FPS
      </span>
    </div>

    <div v-if="showDetails" class="m-n-sm">
      <div class="memory">
        WebContents
      </div>
      <table>
        <tr>
          <th>Object</th>
          <th>Count</th>
          <th>Size</th>
          <th>Live Size</th>
        </tr>
        <tr v-for="stat in stats" :key="stat.object">
          <td>{{ stat.object }}</td>
          <td>{{ stat.count }}</td>
          <td>{{ stat.size }}</td>
          <td>{{ stat.liveSize }}</td>
        </tr>
      </table>

      <div class="memory">
        Heap
      </div>
      <table>
        <template v-for="([key, value]) in Object.entries(heap)">
          <tr v-if="key !== 'doesZapGarbage'" :key="key">
            <td>{{ key }}</td>
            <td>{{ toMb(value*1000) }}MB</td>
          </tr>
        </template>
      </table>

      <div class="memory">
        Blink
      </div>
      <table>
        <tr v-for="([key, value]) in Object.entries(blink)" :key="key">
          <td>{{ key }}</td>
          <td>{{ toMb(value*1000) }}MB</td>
        </tr>
      </table>

      <div class="memory">
        Process
      </div>
      <table>
        <tr v-for="([key, value]) in Object.entries(process)" :key="key">
          <td>{{ key }}</td>
          <td>{{ toMb(value*1000) }}MB</td>
        </tr>
      </table>

      <template v-if="Object.keys(io).length">
        <div class="memory">
          IO
        </div>
        {{ io }}
        <table>
          <tr v-for="([key, value]) in Object.entries(io)" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </table>
      </template>
    </div>
  </div>
</template>

<script>
import { webFrame } from 'electron';

export default {
  data() {
    return {
      showDetails: false,
      stats: [],
      heap: {},
      blink: {},
      process: {},
      system: {},
      cpu: {},
      io: {},
      fps: 0,
      frames: 0,
      prevTime: performance.now(),
      beginTime: performance.now(),
      pollInterval: 2000
    };
  },

  mounted() {
    this.pollFps();
    this.pollMemory();
  },

  methods: {
    toMb(bytes, digits = 2) {
      return (bytes / (1024.0 * 1024)).toFixed(digits);
    },

    // Credit to http://seenaburns.com/debugging-electron-memory-usage/ for
    // inspiration here
    pollMemory() {
      let logMemDetails = (x) => {
        this.stats.push({
          object: x[0],
          count: x[1].count,
          size: `${this.toMb(x[1].size)}MB`,
          liveSize: `${this.toMb(x[1].liveSize)}MB`
        });
      };

      let getMemory = async () => {
        if (!document.hidden) {
          this.stats = [];
          Object.entries(webFrame.getResourceUsage()).map(logMemDetails);
          this.heap = process.getHeapStatistics();
          this.blink = process.getBlinkMemoryInfo();
          this.process = await process.getProcessMemoryInfo();
          this.system = process.getSystemMemoryInfo();
          this.cpu = process.getCPUUsage();
          this.io = process.getIOCounters();
        }
      };

      setInterval(getMemory, this.pollInterval);
    },

    pollFps() {
      let animate = () => {
        if (!document.hidden) {
          this.beginTime = performance.now();
          this.end();
        }
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    },

    end() {
      this.frames++;

      let time = performance.now();

      if (time >= this.prevTime + this.pollInterval) {
        let fps = (this.frames * 1000) / (time - this.prevTime);
        this.fps = fps.toFixed(1);

        this.prevTime = time;
        this.frames = 0;
      }

      return time;
    }
  },

  update() {
    this.beginTime = this.end();
  }
};
</script>

<style lang="scss" scoped>
@import '../../style/reset.scss';
@import '../../style/utilities.scss';

.ev-stats {
  background: #000;
  color: #fff;
  padding: 10px;
  cursor: default;
}

.fps {
  color: lime;
  font-size: 18px;
  margin-bottom: 10px;
}

.memory {
  font-weight: bold;
  margin: 5px 0;
  font-size: 16px;
}

h1 {
  margin: 0;
}

th {
  text-align: left;
}

td {
  padding-right: 5px;
}
</style>
