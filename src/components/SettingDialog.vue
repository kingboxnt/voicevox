<template>
  <q-dialog
    maximized
    transition-show="jump-up"
    transition-hide="jump-down"
    class="setting-dialog transparent-backdrop"
    v-model="settingDialogOpenedComputed"
  >
    <q-layout container view="hHh Lpr fFf" class="bg-background">
      <q-page-container class="root">
        <q-header class="q-pa-sm">
          <q-toolbar>
            <q-toolbar-title class="text-display lang=zh-hans"
              >设置 / 选项</q-toolbar-title
            >
            <q-space />
            <!-- close button -->
            <q-btn
              round
              flat
              icon="close"
              color="display"
              @click="settingDialogOpenedComputed = false"
            />
          </q-toolbar>
        </q-header>
        <q-page ref="scroller" class="scroller">
          <div class="q-pa-md row items-start q-gutter-md">
            <!-- Engine Mode Card -->
            <q-card flat class="setting-card">
              <q-card-actions>
                <div class="text-h5">引擎</div>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-sm bg-surface">
                <div>引擎模式</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      GPU 模式需要有 GPU 硬件设备。Linux 仅支持 NVIDIA&trade;
                      GPU。</q-tooltip
                    >
                  </q-icon>
                </div>
                <q-space />
                <q-btn-toggle
                  padding="xs md"
                  unelevated
                  v-model="engineMode"
                  color="background"
                  text-color="display"
                  toggle-color="primary"
                  toggle-text-color="display-on-primary"
                  :options="[
                    { label: 'CPU', value: 'switchCPU' },
                    { label: 'GPU', value: 'switchGPU' },
                  ]"
                >
                </q-btn-toggle>
              </q-card-actions>
            </q-card>
            <!-- Preservation Setting -->
            <q-card flat class="setting-card">
              <q-card-actions>
                <div class="text-h5">操作</div>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-sm bg-surface">
                <div>保留参数</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      添加一个文本字段时、将保留当前参数如语音速度等
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle
                  :model-value="inheritAudioInfoMode"
                  @update:model-value="changeinheritAudioInfo($event)"
                >
                </q-toggle>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-sm bg-surface">
                <div>追踪播放位置</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      追踪播放位置、选择自动滚动模式
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <div class="scroll-mode-toggle">
                  <q-radio
                    v-for="(obj, key) in activePointScrollModeOptions"
                    :key="key"
                    v-model="activePointScrollMode"
                    :val="key"
                    :label="obj.label"
                    size="0"
                    :class="[
                      'q-px-md',
                      'q-py-sm',
                      key !== activePointScrollMode && 'scroll-mode-button',
                      key === activePointScrollMode &&
                        'scroll-mode-button-selected',
                    ]"
                    :style="[
                      key === 'CONTINUOUSLY' && 'border-radius: 3px 0 0 3px',
                      key === 'OFF' && 'border-radius: 0 3px 3px 0',
                    ]"
                  >
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      追踪播放位置、自动滚动。
                      {{ `「${obj.label}」模式  ${obj.desc}` }}
                    </q-tooltip>
                  </q-radio>
                </div>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-sm bg-surface">
                <div>文本分割行为</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      粘贴文本时更改分割行为
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-btn-toggle
                  padding="xs md"
                  unelevated
                  :model-value="splitTextWhenPaste"
                  @update:model-value="changeSplitTextWhenPaste($event)"
                  color="background"
                  text-color="display"
                  toggle-color="primary"
                  toggle-text-color="display-on-primary"
                  :options="[
                    {
                      label: '标点符号与换行符',
                      value: 'PERIOD_AND_NEW_LINE',
                      slot: 'splitTextPeriodAndNewLine',
                    },
                    {
                      label: '换行符',
                      value: 'NEW_LINE',
                      slot: 'splitTextNewLine',
                    },
                    { label: '关闭', value: 'OFF', slot: 'splitTextOFF' },
                  ]"
                >
                  <template v-slot:splitTextPeriodAndNewLine>
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      根据标点符号和换行符拆分文本。
                    </q-tooltip>
                  </template>
                  <template v-slot:splitTextNewLine>
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      仅根据换行符分割文本。
                    </q-tooltip>
                  </template>
                  <template v-slot:splitTextOFF>
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      不分割。
                    </q-tooltip>
                  </template>
                </q-btn-toggle>
              </q-card-actions>
            </q-card>
            <!-- Saving Card -->
            <q-card flat class="setting-card">
              <q-card-actions>
                <div class="text-h5">保存</div>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-sm bg-surface">
                <div>字符编码</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      选择一个字符编码
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-btn-toggle
                  padding="xs md"
                  unelevated
                  :model-value="savingSetting.fileEncoding"
                  @update:model-value="
                    handleSavingSettingChange('fileEncoding', $event)
                  "
                  color="background"
                  text-color="display"
                  toggle-color="primary"
                  toggle-text-color="display-on-primary"
                  :options="[
                    { label: 'UTF-8', value: 'UTF-8' },
                    { label: 'Shift_JIS', value: 'Shift_JIS' },
                  ]"
                />
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>锁定导出目标</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      语音文件导出到设定的文件夹中
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-input
                  dense
                  v-if="savingSetting.fixedExportEnabled"
                  maxheight="10px"
                  label="导出文件夹"
                  hide-bottom-space
                  readonly
                  :model-value="savingSetting.fixedExportDir"
                  :input-style="{
                    width: `${savingSetting.fixedExportDir.length / 2 + 1}em`,
                    minWidth: '150px',
                    maxWidth: '450px',
                  }"
                  @update:model-value="
                    handleSavingSettingChange('fixedExportDir', $event)
                  "
                >
                  <template v-slot:append>
                    <q-btn
                      square
                      dense
                      flat
                      color="primary"
                      icon="folder_open"
                      @click="openFileExplore"
                    >
                      <q-tooltip :delay="500" anchor="bottom left">
                        选择文件夹
                      </q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
                <q-toggle
                  :model-value="savingSetting.fixedExportEnabled"
                  @update:model-value="
                    handleSavingSettingChange('fixedExportEnabled', $event)
                  "
                >
                </q-toggle>
              </q-card-actions>

              <file-name-pattern-dialog
                v-model:open-dialog="showsFilePatternEditDialog"
              />

              <q-card-actions class="q-px-md q-py-sm bg-surface">
                <div>导出文件名样式</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      自定义导出文件名样式
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <div class="q-px-sm text-ellipsis">
                  {{ savingSetting.fileNamePattern }}
                </div>
                <q-btn
                  label="编辑"
                  unelevated
                  color="background"
                  text-color="display"
                  class="text-no-wrap q-mr-sm"
                  @click="showsFilePatternEditDialog = true"
                />
              </q-card-actions>

              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>防止覆写</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      文件保存为编号而不被覆写
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle
                  :model-value="savingSetting.avoidOverwrite"
                  @update:model-value="
                    handleSavingSettingChange('avoidOverwrite', $event)
                  "
                >
                </q-toggle>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>导出txt文件</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      导出文本为txt文件
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle
                  :model-value="savingSetting.exportText"
                  color="primary"
                  @update:model-value="
                    handleSavingSettingChange('exportText', $event)
                  "
                >
                </q-toggle>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>导出lab文件</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      导出lab文件同步口型
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle
                  :model-value="savingSetting.exportLab"
                  @update:model-value="
                    handleSavingSettingChange('exportLab', $event)
                  "
                >
                </q-toggle>
              </q-card-actions>
            </q-card>
            <!-- Experimental Card -->
            <q-card flat class="setting-card">
              <q-card-actions>
                <div class="text-h5">高级设置</div>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>双声道语音</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      将语音数据从单声道转换为双声道并执行播放/保存
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle
                  :model-value="savingSetting.outputStereo"
                  @update:model-value="
                    handleSavingSettingChange('outputStereo', $event)
                  "
                >
                </q-toggle>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>播放设备</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      更改语音播放设备并执行播放
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-select
                  dense
                  v-model="currentAudioOutputDeviceComputed"
                  label="播放设备"
                  :options="availableAudioOutputDevices"
                  class="col-7"
                >
                </q-select>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>语音采样率</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      播放/保存过程中更改语音采样率（提高采样率并不会提升语音质量。）
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-select
                  borderless
                  name="samplingRate"
                  :model-value="savingSetting.outputSamplingRate"
                  :options="[24000, 44100, 48000, 88200, 96000]"
                  :option-label="
                    (item) =>
                      `${item / 1000} kHz${item === 24000 ? '(默认)' : ''}`
                  "
                  @update:model-value="
                    handleSavingSettingChange('outputSamplingRate', $event)
                  "
                >
                </q-select>
              </q-card-actions>
            </q-card>
            <q-card flat class="setting-card">
              <q-card-actions>
                <div class="text-h5">实验性功能</div>
              </q-card-actions>
              <!-- 今後実験的機能を追加する場合はここに追加 -->
              <q-card-actions class="q-px-md q-py-sm bg-surface">
                <div>主题</div>
                <q-icon name="help_outline" size="sm" class="help-hover-icon">
                  <q-tooltip
                    :delay="500"
                    anchor="center left"
                    self="center right"
                    transition-show="jump-left"
                    transition-hide="jump-right"
                    class="text-h6"
                  >
                    更改软件主题外观
                  </q-tooltip>
                </q-icon>
                <q-space />
                <q-btn-toggle
                  unelevated
                  padding="xs md"
                  color="background"
                  text-color="display"
                  toggle-color="primary"
                  toggle-text-color="display-on-primary"
                  v-model="currentThemeNameComputed"
                  :options="availableThemeNameComputed"
                />
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>预设功能</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      启用预设功能
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle
                  :model-value="experimentalSetting.enablePreset"
                  @update:model-value="
                    changeExperimentalSetting('enablePreset', $event)
                  "
                >
                </q-toggle>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>自动调整问句</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      自动提高结尾问句中的高音
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle
                  :model-value="experimentalSetting.enableInterrogativeUpspeak"
                  @update:model-value="
                    changeExperimentalSetting(
                      'enableInterrogativeUpspeak',
                      $event
                    )
                  "
                >
                </q-toggle>
              </q-card-actions>
            </q-card>
            <q-card flat class="setting-card">
              <q-card-actions>
                <div class="text-h5">数据收集</div>
              </q-card-actions>
              <q-card-actions class="q-px-md q-py-none bg-surface">
                <div>允许收集软件使用过程中的数据</div>
                <div>
                  <q-icon name="help_outline" size="sm" class="help-hover-icon">
                    <q-tooltip
                      :delay="500"
                      anchor="center left"
                      self="center right"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-h6"
                    >
                      上传各个GUI界面的使用率等数据用来改善VOICEVOX。不会上传文本数据/语音数据。
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-space />
                <q-toggle v-model="acceptRetrieveTelemetryComputed" />
              </q-card-actions>
            </q-card>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "@/store";
import { useQuasar } from "quasar";
import {
  SavingSetting,
  ExperimentalSetting,
  ActivePointScrollMode,
  SplitTextWhenPasteType,
} from "@/type/preload";
import FileNamePatternDialog from "./FileNamePatternDialog.vue";

export default defineComponent({
  name: "SettingDialog",

  components: {
    FileNamePatternDialog,
  },

  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const store = useStore();
    const $q = useQuasar();

    const settingDialogOpenedComputed = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    const engineMode = computed({
      get: () => (store.state.useGpu ? "switchGPU" : "switchCPU"),
      set: (mode: string) => {
        changeUseGPU(mode == "switchGPU" ? true : false);
      },
    });
    const inheritAudioInfoMode = computed(() => store.state.inheritAudioInfo);
    const activePointScrollMode = computed({
      get: () => store.state.activePointScrollMode,
      set: (activePointScrollMode: ActivePointScrollMode) => {
        store.dispatch("SET_ACTIVE_POINT_SCROLL_MODE", {
          activePointScrollMode,
        });
      },
    });
    const activePointScrollModeOptions: Record<
      ActivePointScrollMode,
      {
        label: string;
        desc: string;
      }
    > = {
      CONTINUOUSLY: {
        label: "连续",
        desc: "播放位置在中间显示。",
      },
      PAGE: {
        label: "翻页",
        desc: "播放位置在显示范围之外时滚动播放。",
      },
      OFF: {
        label: "关闭",
        desc: "不自动滚动。",
      },
    };

    const experimentalSetting = computed(() => store.state.experimentalSetting);

    const currentThemeNameComputed = computed({
      get: () => store.state.themeSetting.currentTheme,
      set: (currentTheme: string) => {
        store.dispatch("SET_THEME_SETTING", { currentTheme: currentTheme });
      },
    });

    const currentThemeComputed = computed(() =>
      store.state.themeSetting.availableThemes.find((value) => {
        return value.name == currentThemeNameComputed.value;
      })
    );

    const availableThemeNameComputed = computed(() => {
      return [...store.state.themeSetting.availableThemes]
        .sort((a, b) => a.order - b.order)
        .map((theme) => {
          return { label: theme.displayName, value: theme.name };
        });
    });

    const currentAudioOutputDeviceComputed = computed<{
      key: string;
      label: string;
    } | null>({
      get: () => {
        // 再生デバイスが見つからなかったらデフォルト値に戻す
        const device = availableAudioOutputDevices.value?.find(
          (device) => device.key === store.state.savingSetting.audioOutputDevice
        );
        if (device) {
          return device;
        } else {
          handleSavingSettingChange("audioOutputDevice", "default");
          return null;
        }
      },
      set: (device) => {
        if (device) {
          handleSavingSettingChange("audioOutputDevice", device.key);
        }
      },
    });

    const availableAudioOutputDevices = ref<{ key: string; label: string }[]>();
    const updateAudioOutputDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      availableAudioOutputDevices.value = devices
        .filter((device) => device.kind === "audiooutput")
        .map((device) => {
          return { label: device.label, key: device.deviceId };
        });
    };
    navigator.mediaDevices.addEventListener(
      "devicechange",
      updateAudioOutputDevices
    );
    updateAudioOutputDevices();

    const acceptRetrieveTelemetryComputed = computed({
      get: () => store.state.acceptRetrieveTelemetry == "Accepted",
      set: (acceptRetrieveTelemetry: boolean) => {
        store.dispatch("SET_ACCEPT_RETRIEVE_TELEMETRY", {
          acceptRetrieveTelemetry: acceptRetrieveTelemetry
            ? "Accepted"
            : "Refused",
        });

        if (acceptRetrieveTelemetry) {
          return;
        }

        $q.dialog({
          title: "禁止软件收集数据",
          message: "要完全禁止软件收集数据、必须重新启动VOICEVOX",
          ok: {
            flat: true,
            textColor: "display",
          },
        });
      },
    });

    const changeUseGPU = async (useGpu: boolean) => {
      if (store.state.useGpu === useGpu) return;

      $q.loading.show({
        spinnerColor: "primary",
        spinnerSize: 50,
        boxClass: "bg-background text-display",
        message: "更改启动模式",
      });

      await store.dispatch("CHANGE_USE_GPU", { useGpu });

      $q.loading.hide();
    };

    const changeinheritAudioInfo = async (inheritAudioInfo: boolean) => {
      if (store.state.inheritAudioInfo === inheritAudioInfo) return;
      store.dispatch("SET_INHERIT_AUDIOINFO", { inheritAudioInfo });
    };

    const changeExperimentalSetting = async (
      key: keyof ExperimentalSetting,
      data: boolean
    ) => {
      store.dispatch("SET_EXPERIMENTAL_SETTING", {
        experimentalSetting: { ...experimentalSetting.value, [key]: data },
      });
    };

    const restartAllEngineProcess = () => {
      store.dispatch("RESTART_ENGINE_ALL");
    };

    const savingSetting = computed(() => store.state.savingSetting);

    const handleSavingSettingChange = (
      key: keyof SavingSetting,
      data: string | boolean | number
    ) => {
      const storeDispatch = (): void => {
        store.dispatch("SET_SAVING_SETTING", {
          data: { ...savingSetting.value, [key]: data },
        });
      };
      if (key === "outputSamplingRate" && data !== 24000) {
        $q.dialog({
          title: "更改输出采样率",
          message:
            "更改输出采样率并不会改变音质。另外、语音生成过程可能额外需要一些时间。<br />是否更改？",
          html: true,
          persistent: true,
          ok: {
            label: "更改",
            flat: true,
            textColor: "display",
          },
          cancel: {
            label: "不更改",
            flat: true,
            textColor: "display",
          },
        }).onOk(storeDispatch);
        return;
      }
      storeDispatch();
    };

    const openFileExplore = async () => {
      const path = await window.electron.showOpenDirectoryDialog({
        title: "选择导出文件夹",
      });
      if (path) {
        store.dispatch("SET_SAVING_SETTING", {
          data: { ...savingSetting.value, fixedExportDir: path },
        });
      }
    };

    const splitTextWhenPaste = computed(() => store.state.splitTextWhenPaste);
    const changeSplitTextWhenPaste = (
      splitTextWhenPaste: SplitTextWhenPasteType
    ) => {
      store.dispatch("SET_SPLIT_TEXT_WHEN_PASTE", { splitTextWhenPaste });
    };

    const showsFilePatternEditDialog = ref(false);

    return {
      settingDialogOpenedComputed,
      engineMode,
      inheritAudioInfoMode,
      activePointScrollMode,
      activePointScrollModeOptions,
      experimentalSetting,
      currentAudioOutputDeviceComputed,
      availableAudioOutputDevices,
      changeinheritAudioInfo,
      changeExperimentalSetting,
      restartAllEngineProcess,
      savingSetting,
      handleSavingSettingChange,
      openFileExplore,
      currentThemeNameComputed,
      currentThemeComputed,
      availableThemeNameComputed,
      acceptRetrieveTelemetryComputed,
      splitTextWhenPaste,
      changeSplitTextWhenPaste,
      showsFilePatternEditDialog,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.setting-dialog {
  .q-field__control {
    color: colors.$primary;
  }
}

.help-hover-icon {
  margin-left: 6px;
  color: colors.$display;
  opacity: 0.5;
}

.hotkey-table {
  width: 100%;
}

.setting-card {
  @extend .hotkey-table;
  min-width: 475px;
  background: colors.$background;
}

.scroll-mode-toggle {
  background: colors.$background;
  border-radius: 3px;
}

.scroll-mode-button {
  background: colors.$background;
  color: colors.$display;
  transition: 0.5s;
}

.scroll-mode-button-selected {
  background: colors.$primary;
  color: colors.$display-on-primary;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scroll-mode-button:hover {
  background: rgba(colors.$primary-rgb, 0.2);
}

.setting-dialog .q-layout-container :deep(.absolute-full) {
  right: 0 !important;
  .scroll {
    left: unset !important;
    right: unset !important;
    width: unset !important;
    max-height: unset;
  }
}

.root {
  .scroller {
    overflow-y: scroll;
    > div {
      position: absolute;
      left: 0;
      right: 0;
    }
  }
}
</style>
