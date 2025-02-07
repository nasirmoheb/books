<template>
  <div>
    <div v-if="showLabel" :class="labelClasses">
      {{ df.label }}
    </div>

    <input v-show="showInput" ref="input" :class="[inputClasses, containerClasses, 'custom-input']" :type="date"
      :placeholder="inputPlaceholder" :readonly="isReadOnly" :tabindex="isReadOnly ? '-1' : '0'" />

    <date-picker :locale="localeValue" :show="showInput" v-model="date" color="#2196f3" :editable="true"
      :display-format="displayFormat" format="YYYY/MM/DD" @close="onClose" custom-input=".custom-input" :type="inputType">
    </date-picker>

    <div v-show="!showInput" class="flex" :class="[containerClasses, sizeClasses]" tabindex="0" @click="activateInput">
      <p v-if="!isEmpty" :class="[baseInputClasses]" class="overflow-auto no-scrollbar whitespace-nowrap">
        {{ formattedValue }}
      </p>
      <p v-else-if="inputPlaceholder" class="text-base text-gray-500 w-full">
        {{ inputPlaceholder }}
      </p>

      <button v-if="!isReadOnly" class="-me-0.5 ms-1">
        <FeatherIcon name="calendar" class="w-4 h-4" :class="showMandatory ? 'text-red-600' : 'text-gray-600'" />
      </button>
    </div>

  </div>
</template>
<script lang="ts">
import { DateTime } from 'luxon';
import { fyo } from 'src/initFyo';
import { defineComponent, nextTick } from 'vue';
import Base from './Base.vue';
import datePicker from 'vue3-persian-datetime-picker'
import { toRefs } from 'vue';
export default defineComponent({
  extends: Base,
  emits: ['input', 'focus'],
  components: { datePicker },
  data() {
    return {
      showInput: false,
      date: ''
    };
  },
  computed: {
    inputValue(): string {
      let value = this.value;
      if (typeof value === 'string') {
        value = new Date(value);
      }

      if (value instanceof Date && !Number.isNaN(value.valueOf())) {
        return DateTime.fromJSDate(value).toISODate();
      }

      return '';
    },
    inputType() {
      return 'date';
    },
    displayFormat() {
      return 'jYYYY/jMM/jDD'
    },
    localeValue() {
      return (fyo.singles.SystemSettings?.outputCalendar as string) === 'gregory' ? 'en,fa' : 'fa,en';
    },
    formattedValue() {
      const value = this.parse(this.value);
      return fyo.format(value, this.df, this.doc);
    },
    borderClasses(): string {
      if (!this.border) {
        return '';
      }

      const border = 'border border-gray-200';
      let background = 'bg-gray-25';
      if (this.isReadOnly) {
        background = 'bg-gray-50';
      }

      if (this.showInput) {
        return background;
      }

      return border + ' ' + background;
    },
  },
  methods: {
    onClose(e) {
      const event = toRefs(e)
      console.log(event.altFormatted.value);

      this.showInput = false;
      let value: Date | null = DateTime.fromISO(event.altFormatted.value).toJSDate();
      if (Number.isNaN(value.valueOf())) {
        value = null;
      }
      this.triggerChange(value);
    }
    ,
    activateInput() {
      if (this.isReadOnly) {
        return;
      }

      this.showInput = true;
    },
  },
});
</script>
