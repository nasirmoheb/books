<script lang="ts">
import { defineComponent } from 'vue';
import DateVue from './Date.vue';
import { DateTime } from 'luxon';

export default defineComponent({
  extends: DateVue,
  computed: {
    inputType() {
      return 'datetime';
    },
    displayFormat() {
      return 'jYYYY/jMM/jDD hh:mm:ss'
    },
    inputValue(): string {
      let value = this.value;
      if (typeof value === 'string') {
        value = new Date(value);
      }

      if (value instanceof Date && !Number.isNaN(value.valueOf())) {
        return DateTime.fromJSDate(value).toISO().split('.')[0];
      }

      return '';
    },
  },
});
</script>
