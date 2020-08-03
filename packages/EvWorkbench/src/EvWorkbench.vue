<template>
  <div class="d-grid overflow-hidden" style="grid-template-rows: 36px 1fr">
    <div class="ev-workbench-toolbar">
      <slot name="toolbar" />
    </div>

    <div class="d-grid overflow-hidden" style="grid-template-columns: 50px 0 100px 0 1fr">
      <div class="vh-main">
        <div class="h-100 w-100 overflow-auto ev-workbench-activity">
          <slot name="activity" />
        </div>
      </div>

      <div ref="gutterActivitybarSidebar" class="hide gutter-hidden gutter gutter-column" />

      <div class="vh-main">
        <div class="h-100 w-100 overflow-auto ev-workbench-sidebar">
          <slot name="sidebar" />
        </div>
      </div>

      <div ref="gutterSidebarMain" class="gutter-hidden gutter gutter-column" />

      <div class="d-grid overflow-hidden vh-main" style="grid-template-rows: 1fr 0 200px">
        <div class="d-grid overflow-hidden" style="grid-template-columns: 1fr 0 200px">
          <div class="h-100 w-100 overflow-hidden ev-workbench-main">
            <slot name="main" />
          </div>

          <div ref="gutterMainSupp" class="gutter-hidden gutter gutter-column" />

          <div class="h-100 w-100 overflow-auto ev-workbench-supplemental">
            <slot name="supplemental" />
          </div>
        </div>

        <div ref="gutterMainTopBottom" class="gutter-hidden gutter gutter-row" />

        <div class="h-100 w-100 overflow-auto ev-workbench-panel">
          <slot name="panel" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Split from 'split-grid';
import '@/../style/split-grid.scss';
import '@/../style/utilities.scss';

export default {
  name: 'EvWorkbench',

  mounted() {
    Split({
      columnGutters: [
        {
          track: 1,
          element: this.$refs.gutterActivitybarSidebar
        }, {
          track: 3,
          element: this.$refs.gutterSidebarMain
        }, {
          track: 1,
          element: this.$refs.gutterMainSupp
        }
      ],
      rowGutters: [
        {
          track: 1,
          element: this.$refs.gutterMainTopBottom
        }
      ]
    });
  }
};
</script>

<style lang="scss">
.vh-main {
  height: calc(100vh - 36px);
}
</style>
