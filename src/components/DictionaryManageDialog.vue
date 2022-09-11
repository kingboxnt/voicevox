<template>
  <q-dialog
    maximized
    transition-show="jump-up"
    transition-hide="jump-down"
    class="setting-dialog transparent-backdrop"
    v-model="dictionaryManageDialogOpenedComputed"
  >
    <q-layout container view="hHh Lpr fFf" class="bg-background">
      <q-page-container>
        <q-header class="q-pa-sm">
          <q-toolbar>
            <q-toolbar-title class="text-display lang=zh-hans"
              >朗读＆口音词典</q-toolbar-title
            >
            <q-space />
            <!-- close button -->
            <q-btn
              round
              flat
              icon="close"
              color="display"
              @click="discardOrNotDialog(closeDialog)"
            />
          </q-toolbar>
        </q-header>
        <q-page class="row">
          <div v-if="loadingDict" class="loading-dict">
            <div>
              <q-spinner color="primary" size="2.5rem" />
              <div class="q-mt-xs">加载中・・・</div>
            </div>
          </div>
          <div class="col-4 word-list-col">
            <div v-if="wordEditing" class="word-list-disable-overlay" />
            <div class="word-list-header text-no-wrap">
              <div class="row word-list-title text-h5">单词列表</div>
              <div class="row no-wrap">
                <q-btn
                  outline
                  text-color="warning"
                  class="text-no-wrap text-bold col-sm q-ma-sm"
                  @click="deleteWord"
                  :disable="uiLocked || !isDeletable"
                  >删除</q-btn
                >
                <q-btn
                  outline
                  text-color="display"
                  class="text-no-wrap text-bold col-sm q-ma-sm"
                  @click="editWord"
                  :disable="uiLocked || !selectedId"
                  >编辑</q-btn
                >
                <q-btn
                  outline
                  text-color="display"
                  class="text-no-wrap text-bold col-sm q-ma-sm"
                  @click="newWord"
                  :disable="uiLocked"
                  >添加</q-btn
                >
              </div>
            </div>
            <q-list class="word-list">
              <q-item
                v-for="(value, key) in userDict"
                :key="key"
                tag="label"
                v-ripple
                clickable
                @click="selectWord(key)"
                :active="selectedId === key"
                active-class="active-word"
              >
                <q-item-section>
                  <q-item-label class="text-display">{{
                    value.surface
                  }}</q-item-label>
                  <q-item-label caption>{{ value.yomi }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- 右側のpane -->
          <div
            v-if="wordEditing"
            class="col-8 no-wrap text-no-wrap word-editor"
          >
            <div class="row q-pl-md q-mt-md">
              <div class="text-h6">单词</div>
              <q-input
                ref="surfaceInput"
                class="word-input"
                v-model="surface"
                @blur="setSurface(surface)"
                @keydown="yomiFocusWhenEnter"
                dense
                :disable="uiLocked"
              />
            </div>
            <div class="row q-pl-md q-pt-sm">
              <div class="text-h6">朗读</div>
              <q-input
                ref="yomiInput"
                class="word-input q-pb-none"
                v-model="yomi"
                @blur="setYomi(yomi)"
                @keydown="setYomiWhenEnter"
                dense
                :error="!isOnlyHiraOrKana"
                :disable="uiLocked"
              >
                <template v-slot:error>
                  只能使用平假名和片假名字符进行朗读。
                </template>
              </q-input>
            </div>
            <div class="row q-pl-md q-mt-lg text-h6">重音调整</div>
            <div class="row q-pl-md desc-row">
              考虑到词尾的重音、会自动插入「が」。
            </div>
            <div class="row q-px-md" style="height: 130px">
              <div class="play-button">
                <q-btn
                  v-if="!nowPlaying && !nowGenerating"
                  fab
                  color="primary-light"
                  text-color="display-on-primary"
                  icon="play_arrow"
                  @click="play"
                />
                <q-btn
                  v-else
                  fab
                  color="primary-light"
                  text-color="display-on-primary"
                  icon="stop"
                  @click="stop"
                  :disable="nowGenerating"
                />
              </div>
              <div
                ref="accentPhraseTable"
                class="accent-phrase-table overflow-hidden-y"
              >
                <div v-if="accentPhrase" class="mora-table">
                  <audio-accent
                    :accent-phrase="accentPhrase"
                    :accent-phrase-index="0"
                    :ui-locked="uiLocked"
                    @changeAccent="changeAccent"
                  />
                  <template
                    v-for="(mora, moraIndex) in accentPhrase.moras"
                    :key="moraIndex"
                  >
                    <div
                      class="text-cell"
                      :style="{
                        gridColumn: `${moraIndex * 2 + 1} / span 1`,
                      }"
                    >
                      {{ mora.text }}
                    </div>
                    <div
                      v-if="moraIndex < accentPhrase.moras.length - 1"
                      class="splitter-cell"
                      :style="{
                        gridColumn: `${moraIndex * 2 + 2} / span 1`,
                      }"
                    />
                  </template>
                </div>
              </div>
            </div>
            <div class="row q-pl-md q-pt-lg text-h6">单词优先级</div>
            <div class="row q-pl-md desc-row">
              如果一个单词注册后没有反映、可以尝试增加优先级的数值。
            </div>
            <div
              class="row q-px-md"
              :style="{
                justifyContent: 'center',
              }"
            >
              <q-slider
                v-model="wordPriority"
                snap
                dense
                marker-labels
                color="primary-light"
                :min="0"
                :max="10"
                :step="1"
                :style="{
                  width: '80%',
                }"
              />
            </div>
            <div class="row q-px-md save-delete-reset-buttons">
              <q-space />
              <q-btn
                v-show="!!selectedId"
                outline
                text-color="display"
                class="text-no-wrap text-bold q-mr-sm"
                @click="resetWord"
                :disable="uiLocked || !isWordChanged"
                >重置</q-btn
              >
              <q-btn
                outline
                text-color="display"
                class="text-no-wrap text-bold q-mr-sm"
                @click="saveWord"
                :disable="uiLocked || !isWordChanged"
                >保存</q-btn
              >
              <q-btn
                outline
                text-color="display"
                class="text-no-wrap text-bold q-mr-sm"
                @click="isWordChanged ? discardOrNotDialog(cancel) : cancel()"
                :disable="uiLocked"
                >取消</q-btn
              >
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "@/store";
import { AccentPhrase, AudioQuery, UserDictWord } from "@/openapi";
import {
  convertHiraToKana,
  convertLongVowel,
  createKanaRegex,
} from "@/store/utility";
import AudioAccent from "@/components/AudioAccent.vue";
import { QInput, useQuasar } from "quasar";
import { AudioItem } from "@/store/type";

const defaultDictPriority = 5;

export default defineComponent({
  name: "DictionaryManageDialog",
  components: { AudioAccent },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const store = useStore();
    const $q = useQuasar();

    const engineIdComputed = computed(() => store.state.engineIds[0]); // TODO: 複数エンジン対応

    const dictionaryManageDialogOpenedComputed = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });
    const uiLocked = ref(false); // ダイアログ内でstore.getters.UI_LOCKEDは常にtrueなので独自に管理
    const nowGenerating = ref(false);
    const nowPlaying = ref(false);

    const loadingDict = ref(false);
    const userDict = ref<Record<string, UserDictWord>>({});

    const createUILockAction = function <T>(action: Promise<T>) {
      uiLocked.value = true;
      return action.finally(() => {
        uiLocked.value = false;
      });
    };

    const loadingDictProcess = async () => {
      const engineId = engineIdComputed.value;
      if (engineId === undefined)
        throw new Error(`assert engineId !== undefined`);

      loadingDict.value = true;
      try {
        userDict.value = await createUILockAction(
          store.dispatch("LOAD_USER_DICT", {
            engineId,
          })
        );
      } catch {
        $q.dialog({
          title: "获取词典失败",
          message: "尝试重新启动引擎。",
          ok: {
            label: "关闭",
            flat: true,
            textColor: "display",
          },
        }).onOk(() => {
          dictionaryManageDialogOpenedComputed.value = false;
        });
      }
      loadingDict.value = false;
    };
    watch(dictionaryManageDialogOpenedComputed, async (newValue) => {
      if (newValue) {
        await loadingDictProcess();
        toInitialState();
      }
    });

    const wordEditing = ref(false);

    const surfaceInput = ref<QInput>();
    const yomiInput = ref<QInput>();
    const yomiFocusWhenEnter = (event: KeyboardEvent) => {
      // keyCodeは非推奨で、keyが推奨だが、
      // key === "Enter"はIMEのEnterも拾ってしまうので、keyCodeを用いている
      if (event.keyCode === 13) {
        yomiInput.value?.focus();
      }
    };
    const setYomiWhenEnter = (event: KeyboardEvent) => {
      // keyCodeは非推奨で、keyが推奨だが、
      // key === "Enter"はIMEのEnterも拾ってしまうので、keyCodeを用いている
      if (event.keyCode === 13) {
        setYomi(yomi.value);
      }
    };

    const selectedId = ref("");
    const surface = ref("");
    const yomi = ref("");

    const styleId = computed(() => {
      if (!store.getters.USER_ORDERED_CHARACTER_INFOS) return 0;
      return store.getters.USER_ORDERED_CHARACTER_INFOS[0].metas.styles[0]
        .styleId;
    });

    const kanaRegex = createKanaRegex();
    const isOnlyHiraOrKana = ref(true);
    const accentPhrase = ref<AccentPhrase | undefined>();
    const accentPhraseTable = ref<HTMLElement>();

    const convertHankakuToZenkaku = (text: string) => {
      // "!"开始"~"用全角字符替换范围内的字符(数字或字母)
      return text.replace(/[\u0021-\u007e]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
      });
    };
    const setSurface = (text: string) => {
      // surfaceを全角化する
      // 入力は半角でも問題ないが、登録時に全角に変換され、isWordChangedの判断がおかしくなることがあるので、
      // 入力後に自動で変換するようにする
      surface.value = convertHankakuToZenkaku(text);
    };
    const setYomi = async (text: string, changeWord?: boolean) => {
      const engineId = engineIdComputed.value;
      if (engineId === undefined)
        throw new Error(`assert engineId !== undefined`);

      // テキスト長が0の時にエラー表示にならないように、テキスト長を考慮する
      isOnlyHiraOrKana.value = !text.length || kanaRegex.test(text);
      // 読みが変更されていない場合は、アクセントフレーズに変更を加えない
      // ただし、読みが同じで違う単語が存在する場合が考えられるので、changeWordフラグを考慮する
      // 「ガ」が自動挿入されるので、それを考慮してsliceしている
      if (
        text ==
          accentPhrase.value?.moras
            .map((v) => v.text)
            .join("")
            .slice(0, -1) &&
        !changeWord
      ) {
        return;
      }
      if (isOnlyHiraOrKana.value && text.length) {
        text = convertHiraToKana(text);
        text = convertLongVowel(text);
        accentPhrase.value = (
          await createUILockAction(
            store.dispatch("FETCH_ACCENT_PHRASES", {
              text: text + "ガ'",
              engineId,
              styleId: styleId.value,
              isKana: true,
            })
          )
        )[0];
        if (
          selectedId.value &&
          userDict.value[selectedId.value].yomi === text
        ) {
          accentPhrase.value.accent = computeDisplayAccent();
        }
      } else {
        accentPhrase.value = undefined;
      }
      yomi.value = text;
    };

    const changeAccent = async (_: number, accent: number) => {
      const engineId = engineIdComputed.value;
      if (engineId === undefined)
        throw new Error(`assert engineId !== undefined`);

      if (accentPhrase.value) {
        accentPhrase.value.accent = accent;
        accentPhrase.value = (
          await createUILockAction(
            store.dispatch("FETCH_MORA_DATA", {
              accentPhrases: [accentPhrase.value],
              engineId,
              styleId: styleId.value,
            })
          )
        )[0];
      }
    };

    const audioElem = new Audio();
    audioElem.pause();

    const play = async () => {
      const engineId = engineIdComputed.value;
      if (engineId === undefined)
        throw new Error(`assert engineId !== undefined`);

      if (!accentPhrase.value) return;
      nowGenerating.value = true;
      const query: AudioQuery = {
        accentPhrases: [accentPhrase.value],
        speedScale: 1.0,
        pitchScale: 0,
        intonationScale: 1.0,
        volumeScale: 1.0,
        prePhonemeLength: 0.1,
        postPhonemeLength: 0.1,
        outputSamplingRate: store.state.savingSetting.outputSamplingRate,
        outputStereo: store.state.savingSetting.outputStereo,
      };

      const audioItem: AudioItem = {
        text: yomi.value,
        engineId,
        styleId: styleId.value,
        query,
      };

      let blob = await store.dispatch("GET_AUDIO_CACHE_FROM_AUDIO_ITEM", {
        audioItem,
      });
      if (!blob) {
        blob = await createUILockAction(
          store.dispatch("GENERATE_AUDIO_FROM_AUDIO_ITEM", {
            audioItem,
          })
        );
        if (!blob) {
          nowGenerating.value = false;
          $q.dialog({
            title: "生成失败",
            message: "尝试重新启动引擎。",
            ok: {
              label: "关闭",
              flat: true,
              textColor: "display",
            },
          });
          return;
        }
      }
      nowGenerating.value = false;
      nowPlaying.value = true;
      await store.dispatch("PLAY_AUDIO_BLOB", { audioElem, audioBlob: blob });
      nowPlaying.value = false;
    };
    const stop = () => {
      audioElem.pause();
    };

    // accent phraseにあるaccentと実際に登録するアクセントには差が生まれる
    // アクセントが自動追加される「ガ」に指定されている場合、
    // 実際に登録するaccentの値は0となるので、そうなるように処理する
    const computeRegisteredAccent = () => {
      if (!accentPhrase.value) throw new Error();
      let accent = accentPhrase.value.accent;
      accent = accent === accentPhrase.value.moras.length ? 0 : accent;
      return accent;
    };
    // computeの逆
    // 辞書から得たaccentが0の場合に、自動で追加される「ガ」の位置にアクセントを表示させるように処理する
    const computeDisplayAccent = () => {
      if (!accentPhrase.value || !selectedId.value) throw new Error();
      let accent = userDict.value[selectedId.value].accentType;
      accent = accent === 0 ? accentPhrase.value.moras.length : accent;
      return accent;
    };

    const wordPriority = ref(defaultDictPriority);

    // 操作（ステートの移動）
    const isWordChanged = computed(() => {
      if (selectedId.value === "") {
        return surface.value && yomi.value && accentPhrase.value;
      }
      // 一旦代入することで、userDictそのものが更新された時もcomputedするようにする
      const dict = userDict.value;
      const dictData = dict[selectedId.value];
      return (
        dictData &&
        (dictData.surface !== surface.value ||
          dictData.yomi !== yomi.value ||
          dictData.accentType !== computeRegisteredAccent() ||
          dictData.priority !== wordPriority.value)
      );
    });
    const saveWord = async () => {
      if (!accentPhrase.value) throw new Error(`accentPhrase === undefined`);
      const accent = computeRegisteredAccent();
      if (selectedId.value) {
        try {
          await store.dispatch("REWRITE_WORD", {
            wordUuid: selectedId.value,
            surface: surface.value,
            pronunciation: yomi.value,
            accentType: accent,
            priority: wordPriority.value,
          });
        } catch {
          $q.dialog({
            title: "更新单词失败",
            message: "尝试重新启动引擎。",
            ok: {
              label: "关闭",
              flat: true,
              textColor: "display",
            },
          });
          return;
        }
      } else {
        try {
          await createUILockAction(
            store.dispatch("ADD_WORD", {
              surface: surface.value,
              pronunciation: yomi.value,
              accentType: accent,
              priority: wordPriority.value,
            })
          );
        } catch {
          $q.dialog({
            title: "注册单词失败",
            message: "尝试重新启动引擎。",
            ok: {
              label: "关闭",
              flat: true,
              textColor: "display",
            },
          });
          return;
        }
      }
      await loadingDictProcess();
      toInitialState();
    };
    const isDeletable = computed(() => !!selectedId.value);
    const deleteWord = () => {
      $q.dialog({
        title: "是否删除注册的单词？",
        message: "删除的单词无法恢复。",
        persistent: true,
        focus: "cancel",
        ok: {
          label: "删除",
          flat: true,
          textColor: "warning",
        },
        cancel: {
          label: "取消",
          flat: true,
          textColor: "display",
        },
      }).onOk(async () => {
        try {
          await createUILockAction(
            store.dispatch("DELETE_WORD", {
              wordUuid: selectedId.value,
            })
          );
        } catch {
          $q.dialog({
            title: "删除单词失败",
            message: "尝试重新启动引擎。",
            ok: {
              label: "关闭",
              flat: true,
              textColor: "display",
            },
          });
          return;
        }
        await loadingDictProcess();
        toInitialState();
      });
    };
    const resetWord = () => {
      $q.dialog({
        title: "重置更改的单词？",
        message: "丢弃并重置更改的单词。",
        persistent: true,
        focus: "cancel",
        ok: {
          label: "重置",
          flat: true,
          textColor: "display",
        },
        cancel: {
          label: "取消",
          flat: true,
          textColor: "display",
        },
      }).onOk(() => {
        toWordEditingState();
      });
    };
    const discardOrNotDialog = (okCallback: () => void) => {
      if (isWordChanged.value) {
        $q.dialog({
          title: "是否丢弃添加/更改的单词？",
          message: "如果继续、单词的添加/更改将被丢弃并重置。",
          persistent: true,
          focus: "cancel",
          ok: {
            label: "继续",
            flat: true,
            textColor: "display",
          },
          cancel: {
            label: "取消",
            flat: true,
            textColor: "display",
          },
        }).onOk(okCallback);
      } else {
        okCallback();
      }
    };
    const newWord = () => {
      selectedId.value = "";
      surface.value = "";
      setYomi("");
      wordPriority.value = defaultDictPriority;
      editWord();
    };
    const editWord = () => {
      toWordEditingState();
    };
    const selectWord = (id: string) => {
      selectedId.value = id;
      surface.value = userDict.value[id].surface;
      setYomi(userDict.value[id].yomi, true);
      wordPriority.value = userDict.value[id].priority;
      toWordSelectedState();
    };
    const cancel = () => {
      toInitialState();
    };
    const closeDialog = () => {
      toDialogClosedState();
    };

    // ステートの移動
    // 初期状態
    const toInitialState = () => {
      wordEditing.value = false;
      selectedId.value = "";
      surface.value = "";
      setYomi("");
      wordPriority.value = defaultDictPriority;
    };
    // 単語が選択されているだけの状態
    const toWordSelectedState = () => {
      wordEditing.value = false;
    };
    // 単語が編集されている状態
    const toWordEditingState = () => {
      wordEditing.value = true;
      surfaceInput.value?.focus();
    };
    // ダイアログが閉じている状態
    const toDialogClosedState = () => {
      dictionaryManageDialogOpenedComputed.value = false;
    };

    return {
      dictionaryManageDialogOpenedComputed,
      uiLocked,
      nowGenerating,
      nowPlaying,
      userDict,
      loadingDict,
      wordEditing,
      surfaceInput,
      yomiInput,
      yomiFocusWhenEnter,
      setYomiWhenEnter,
      selectedId,
      surface,
      yomi,
      selectWord,
      newWord,
      editWord,
      cancel,
      isOnlyHiraOrKana,
      setSurface,
      setYomi,
      accentPhrase,
      accentPhraseTable,
      changeAccent,
      play,
      stop,
      isWordChanged,
      isDeletable,
      wordPriority,
      saveWord,
      deleteWord,
      resetWord,
      closeDialog,
      discardOrNotDialog,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '@/styles/colors' as colors;
@use '@/styles/variables' as vars;

.word-list-col {
  border-right: solid 1px colors.$surface;
  position: relative; // オーバーレイのため
  overflow-x: hidden;
}

.word-list-header {
  margin: 1rem;

  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  .word-list-title {
    flex-grow: 1;
  }
}

.word-list {
  // menubar-height + header-height + window-border-width +
  // 82(title & buttons) + 30(margin 15x2)
  height: calc(
    100vh - #{vars.$menubar-height + vars.$header-height +
      vars.$window-border-width + 82px + 30px}
  );
  width: 100%;
  overflow-y: auto;
}

.active-word {
  background: rgba(colors.$primary-rgb, 0.4);
}

.loading-dict {
  background-color: rgba(colors.$display-rgb, 0.15);
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;

  > div {
    color: colors.$display;
    background: colors.$background;
    border-radius: 6px;
    padding: 14px;
  }
}

.word-list-disable-overlay {
  background-color: rgba($color: #000000, $alpha: 0.4);
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 10;
}

.word-editor {
  display: flex;
  flex-flow: column;
  height: calc(
    100vh - #{vars.$menubar-height + vars.$header-height +
      vars.$window-border-width}
  ) !important;
  overflow: auto;
}

.word-input {
  padding-left: 10px;
  width: calc(66vw - 80px);

  :deep(.q-field__control) {
    height: 2rem;
  }

  :deep(.q-placeholder) {
    padding: 0;
    font-size: 20px;
  }

  :deep(.q-field__after) {
    height: 2rem;
  }
}

.desc-row {
  color: rgba(colors.$display-rgb, 0.5);
  font-size: 12px;
}

.play-button {
  margin: auto 0;
  padding-right: 16px;
}

.accent-phrase-table {
  flex-grow: 1;
  align-self: stretch;

  display: flex;
  height: 130px;
  overflow-x: scroll;
  width: calc(66vw - 140px);

  .mora-table {
    display: inline-grid;
    align-self: stretch;
    grid-template-rows: 1fr 60px 30px;

    .text-cell {
      padding: 0;
      min-width: 20px;
      max-width: 20px;
      grid-row-start: 3;
      text-align: center;
      white-space: nowrap;
      color: colors.$display;
      position: relative;
    }

    .splitter-cell {
      min-width: 20px;
      max-width: 20px;
      grid-row: 3 / span 1;
      z-index: vars.$detail-view-splitter-cell-z-index;
    }
  }
}

.save-delete-reset-buttons {
  padding: 20px;

  display: flex;
  flex: 1;
  align-items: flex-end;
}
</style>
