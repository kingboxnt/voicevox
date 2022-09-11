<template>
  <q-dialog
    maximized
    transition-show="jump-up"
    transition-hide="jump-down"
    class="accept-retrieve-telemetry-dialog transparent-backdrop"
    v-model="modelValueComputed"
  >
    <q-layout container view="hHh Lpr lff" class="bg-background">
      <q-header class="q-py-sm">
        <q-toolbar>
          <div class="column">
            <q-toolbar-title class="text-display lang=zh-hans"
              >为了提升便利性请允许以下使用条款</q-toolbar-title
            >
          </div>

          <q-space />

          <div class="row items-center no-wrap">
            <q-btn
              unelevated
              label="拒绝"
              color="toolbar-button"
              text-color="toolbar-button-display"
              class="text-no-wrap q-mr-md text-bold"
              @click="handler(false)"
            />

            <q-btn
              unelevated
              label="允许"
              color="toolbar-button"
              text-color="toolbar-button-display"
              class="text-no-wrap text-bold"
              @click="handler(true)"
            />
          </div>
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page>
          <p class="text-body1 q-mb-lg">
            VOICEVOX已被开发为一个更方便用户使用的软件。<br /><br />
            当重新排列按钮时、各个UI界面使用率等信息的收集很重要。<br />
            如果您愿意帮助我们收集关于软件使用的数据、请允许这样做。<br />
            <br />
            （请放心、我们不会收集您输入的文字或语音数据的任何信息。）
          </p>
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h5">隐私政策</div>
            </q-card-section>

            <q-card-section class="text-body1">
              <div v-html="privacyPolicy"></div>
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from "vue";
import { useStore } from "@/store";
import { useMarkdownIt } from "@/plugins/markdownItPlugin";

export default defineComponent({
  name: "AcceptRetrieveTelemetryDialog",

  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const store = useStore();

    const modelValueComputed = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    const handler = (acceptRetrieveTelemetry: boolean) => {
      store.dispatch("SET_ACCEPT_RETRIEVE_TELEMETRY", {
        acceptRetrieveTelemetry: acceptRetrieveTelemetry
          ? "Accepted"
          : "Refused",
      });

      modelValueComputed.value = false;
    };

    const md = useMarkdownIt();
    const privacyPolicy = ref("");
    onMounted(async () => {
      privacyPolicy.value = md.render(
        await store.dispatch("GET_PRIVACY_POLICY_TEXT")
      );
    });

    return {
      modelValueComputed,
      handler,
      privacyPolicy,
    };
  },
});
</script>

<style scoped lang="scss">
.q-page {
  padding: 3rem;
}
</style>
