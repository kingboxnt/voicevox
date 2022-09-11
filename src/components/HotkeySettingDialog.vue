<template>
  <q-dialog
    maximized
    transition-show="jump-up"
    transition-hide="jump-down"
    class="hotkey-setting-dialog transparent-backdrop"
    v-model="hotkeySettingDialogOpenComputed"
  >
    <q-layout container view="hHh Lpr lff" class="bg-background">
      <q-header class="q-py-sm">
        <q-toolbar>
          <q-toolbar-title class="text-display lang=zh-hans"
            >设置 / 键盘快捷键</q-toolbar-title
          >
          <q-input
            hide-bottom-space
            dense
            placeholder="搜索"
            color="display"
            class="q-mr-sm search-box"
            v-model="hotkeyFilter"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
            <template #append>
              <q-icon
                v-if="hotkeyFilter !== ''"
                name="close"
                class="cursor-pointer"
                @click="hotkeyFilter = ''"
              />
              <q-icon v-else />
            </template>
          </q-input>
          <q-btn
            round
            flat
            icon="close"
            color="display"
            @click="hotkeySettingDialogOpenComputed = false"
          />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page>
          <q-table
            flat
            dense
            hide-bottom
            card-class="bg-background text-display"
            table-class="text-display"
            row-key="hotkeyIndexes"
            :filter="hotkeyFilter"
            :rows="hotkeySettings"
            :columns="hotkeyColumns"
            class="hotkey-table"
            v-model:pagination="hotkeyPagination"
          >
            <template #header="props">
              <q-tr :props="props">
                <q-th v-for="col of props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template #body="props">
              <q-tr :props="props">
                <q-td no-hover :key="props.cols[0].name" :props="props">
                  {{ props.row.action }}
                </q-td>
                <q-td no-hover :key="props.cols[1].name" :props="props">
                  <q-btn
                    dense
                    text-color="display"
                    padding="none sm"
                    flat
                    :disable="checkHotkeyReadonly(props.row.action)"
                    no-caps
                    :label="
                      getHotkeyText(props.row.action, props.row.combination)
                        .split(' ')
                        .map((hotkeyText) => {
                          // 由于Mac上的Meta键是Cmd键、Meta的显示名称被Cmd取代
                          // 在Windows PC上 Meta 键是 Windows 键、但由于不经常使用所以暂时仅支持 Mac
                          return hotkeyText === 'Meta' ? 'Cmd' : hotkeyText;
                        })
                        .join(' + ')
                    "
                    @click="openHotkeyDialog(props.row.action)"
                  />
                  <q-btn
                    rounded
                    flat
                    icon="settings_backup_restore"
                    padding="none sm"
                    size="1em"
                    :disable="checkHotkeyReadonly(props.row.action)"
                    @click="resetHotkey(props.row.action)"
                  >
                    <q-tooltip :delay="500">重置默认值</q-tooltip>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>

  <q-dialog
    no-esc-dismiss
    no-shake
    transition-show="none"
    transition-hide="none"
    :model-value="isHotkeyDialogOpened"
    @update:model-value="closeHotkeyDialog"
  >
    <q-card class="q-py-sm q-px-md">
      <q-card-section align="center">
        <div class="text-h6">输入快捷键</div>
      </q-card-section>
      <q-card-section align="center">
        <template v-for="(hotkey, index) in lastRecord.split(' ')" :key="index">
          <span v-if="index !== 0"> + </span>
          <!--
          由于Mac上的Meta键是Cmd键、Meta的显示名称被Cmd取代
          在Windows PC上 Meta 键是 Windows 键、但由于不经常使用所以暂时仅支持 Mac
          -->
          <q-chip :ripple="false" color="surface">
            {{ hotkey === "Meta" ? "Cmd" : hotkey }}
          </q-chip>
        </template>
        <span v-if="lastRecord !== '' && confirmBtnEnabled"> +</span>
        <div v-if="duplicatedHotkey != undefined" class="text-warning q-mt-lg">
          <div class="text-warning">快捷键重复以下操作</div>
          <div class="q-mt-sm text-weight-bold text-warning">
            「{{ duplicatedHotkey.action }}」
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          padding="xs md"
          label="快捷键设置为「未设定」"
          unelevated
          color="surface"
          text-color="display"
          class="q-mt-sm"
          @click="
            deleteHotkey(lastAction);
            closeHotkeyDialog();
          "
        />
        <q-btn
          padding="xs md"
          label="取消"
          unelevated
          color="surface"
          text-color="display"
          class="q-mt-sm"
          @click="closeHotkeyDialog"
        />
        <q-btn
          v-if="duplicatedHotkey == undefined"
          padding="xs md"
          label="OK"
          unelevated
          color="primary"
          text-color="display-on-primary"
          class="q-mt-sm"
          @click="
            changeHotkeySettings(lastAction, lastRecord)?.then(() =>
              closeHotkeyDialog()
            )
          "
          :disabled="confirmBtnEnabled"
        />
        <q-btn
          v-else
          padding="xs md"
          label="替换"
          unelevated
          color="primary"
          text-color="display-on-primary"
          class="q-mt-sm"
          @click="solveDuplicated()?.then(() => closeHotkeyDialog())"
          :disabled="confirmBtnEnabled"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "@/store";
import { parseCombo } from "@/store/setting";
import { HotkeyAction, HotkeySetting } from "@/type/preload";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "HotkeySettingDialog",

  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const store = useStore();
    const $q = useQuasar();

    const hotkeySettingDialogOpenComputed = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    const isHotkeyDialogOpened = ref(false);

    const hotkeyPagination = ref({ rowsPerPage: 0 });
    const hotkeyFilter = ref("");

    const hotkeySettings = computed(() => store.state.hotkeySettings);

    const hotkeyColumns = ref([
      {
        name: "action",
        align: "left",
        label: "操作",
        field: "action",
      },
      {
        name: "combination",
        align: "left",
        label: "快捷键",
        field: "combination",
      },
    ]);

    const lastAction = ref("");
    const lastRecord = ref("");

    const recordCombination = (event: KeyboardEvent) => {
      if (!isHotkeyDialogOpened.value) {
        return;
      } else {
        let recordedCombo = parseCombo(event);
        lastRecord.value = recordedCombo;
        event.preventDefault();
      }
    };

    const changeHotkeySettings = (action: string, combo: string) => {
      return store.dispatch("SET_HOTKEY_SETTINGS", {
        data: {
          action: action as HotkeyAction,
          combination: combo,
        },
      });
    };

    const duplicatedHotkey = computed(() => {
      if (lastRecord.value == "") return undefined;
      return hotkeySettings.value.find(
        (item) =>
          item.combination == lastRecord.value &&
          item.action != lastAction.value
      );
    });

    const deleteHotkey = (action: HotkeyAction) => {
      changeHotkeySettings(action, "");
    };

    const getHotkeyText = (action: string, combo: string) => {
      if (checkHotkeyReadonly(action)) combo = "(仅限只读) " + combo;
      if (combo == "") return "未设定";
      else return combo;
    };

    // for later developers, in case anyone wants to add a readonly hotkey
    const readonlyHotkeyKeys: string[] = [];

    const checkHotkeyReadonly = (action: string) => {
      let flag = false;
      readonlyHotkeyKeys.forEach((key) => {
        if (key == action) {
          flag = true;
        }
      });
      return flag;
    };

    const openHotkeyDialog = (action: string) => {
      lastAction.value = action;
      lastRecord.value = "";
      isHotkeyDialogOpened.value = true;
      document.addEventListener("keydown", recordCombination);
    };

    const closeHotkeyDialog = () => {
      lastAction.value = "";
      lastRecord.value = "";
      isHotkeyDialogOpened.value = false;
      document.removeEventListener("keydown", recordCombination);
    };

    const solveDuplicated = () => {
      if (duplicatedHotkey.value == undefined)
        throw new Error("duplicatedHotkey.value == undefined");
      deleteHotkey(duplicatedHotkey.value.action);
      return changeHotkeySettings(lastAction.value, lastRecord.value);
    };

    const confirmBtnEnabled = computed(() => {
      return (
        lastRecord.value == "" ||
        ["Ctrl", "Shift", "Alt", "Meta"].indexOf(
          lastRecord.value.split(" ")[lastRecord.value.split(" ").length - 1]
        ) > -1
      );
    });

    const resetHotkey = (action: string) => {
      $q.dialog({
        title: "快捷键重置为默认值",
        message: `${action}   快捷键将重置为默认值。<br/>是否重置？`,
        html: true,
        ok: {
          label: "重置默认值",
          flat: true,
          textColor: "secondary",
        },
        cancel: {
          label: "不重置默认值",
          flat: true,
          textColor: "secondary",
        },
      }).onOk(() => {
        window.electron
          .getDefaultHotkeySettings()
          .then((defaultSettings: HotkeySetting[]) => {
            const setting = defaultSettings.find(
              (value) => value.action == action
            );
            if (setting) {
              changeHotkeySettings(action, setting.combination);
            }
          });
      });
    };

    return {
      hotkeySettingDialogOpenComputed,
      isHotkeyDialogOpened,
      hotkeySettings,
      hotkeyColumns,
      hotkeyPagination,
      hotkeyFilter,
      duplicatedHotkey,
      deleteHotkey,
      getHotkeyText,
      openHotkeyDialog,
      closeHotkeyDialog,
      lastAction,
      lastRecord,
      solveDuplicated,
      changeHotkeySettings,
      confirmBtnEnabled,
      checkHotkeyReadonly,
      resetHotkey,
    };
  },
});
</script>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/colors' as colors;

.search-box {
  width: 200px;
}

.hotkey-table {
  width: calc(100vw - #{vars.$window-border-width * 2});
  height: calc(
    100vh - #{vars.$menubar-height + vars.$header-height +
      vars.$window-border-width}
  );

  > :deep(.scroll) {
    overflow-y: scroll;
    overflow-x: hidden;
  }

  tbody tr {
    td button:last-child {
      float: right;
      display: none;
    }
    &:hover td button:last-child {
      display: inline-flex;
      color: colors.$display;
      opacity: 0.5;
      &:hover {
        opacity: 1;
      }
    }
  }

  thead tr th {
    position: sticky;
    top: 0;
    font-weight: bold;
    background-color: colors.$surface;
    z-index: 1;
  }

  thead tr th:first-child,
  tbody tr td:first-child {
    width: 70%;
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  thead tr th:last-child,
  tbody tr td:last-child {
    max-width: 0;
    min-width: 180px;
  }
}

.q-layout-container > :deep(.absolute-full) {
  right: 0 !important;
  > .scroll {
    width: unset !important;
    overflow: hidden;
  }
}
</style>
