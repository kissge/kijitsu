<script lang="ts">
  import { onMount } from 'svelte';
  import { formatYmd, formatDayOfWeek, formatISO } from './date';

  let title = '';

  let originDate = new Date();
  const today = formatISO(new Date());
  $: days = Array.from({ length: 52 }, (_, i) => {
    const day = new Date(originDate.getTime() + i * 24 * 60 * 60 * 1000);
    const iso = formatISO(day);
    return {
      isWeekend: day.getDay() % 6 === 0,
      isToday: iso === today,
      isHoliday: holidays.has(iso),
      ymd: formatYmd(day),
      dayOfWeek: formatDayOfWeek(day),
    };
  });

  let notes = Array.from({ length: 52 }, () => '');

  $: state = {
    title: encodeURIComponent(title),
    originDate: formatISO(originDate),
    notes: Object.fromEntries(notes.flatMap((n, i) => (n ? [[i, encodeURIComponent(n)]] : []))),
  };

  let mounted = false;
  $: if (mounted) {
    location.hash = btoa(JSON.stringify(state));
  }

  let holidays = new Set();

  onMount(() => {
    if (location.hash) {
      try {
        const restoredState: typeof state = JSON.parse(atob(location.hash.slice(1)));
        title = decodeURIComponent(restoredState.title);
        originDate = new Date(restoredState.originDate);
        notes = Object.entries(restoredState.notes).reduce((acc, [i, n]) => {
          acc[Number.parseInt(i)] = decodeURIComponent(n);
          return acc;
        }, []);
      } catch (e) {
        console.error(e);
      }
    }

    fetch('https://holidays-jp.github.io/api/v1/date.json')
      .then((res) => res.json())
      .then((res) => (holidays = new Set(Object.keys(res))))
      .catch((e) => console.error(e));

    mounted = true;
  });

  function onInputOriginDate(event: Event) {
    originDate = new Date((<HTMLInputElement>event.target).value);
  }
</script>

<main>
  <input class="title" bind:value={title} placeholder="無題の期日カレンダーくん" />
  <table>
    <tbody>
      {#each days as day, i}
        <tr
          class:weekend={day.isWeekend}
          class:with-notes={notes[i]}
          class:today={day.isToday}
          class:holiday={day.isHoliday}
        >
          <td>
            <input placeholder="自由記入欄" bind:value={notes[i]} />
          </td>
          <td>{i}</td>
          <td>
            {#if i === 0}
              <input type="date" value={formatISO(originDate)} on:input={onInputOriginDate} />
            {:else}
              {day.ymd}
            {/if}
          </td>
          <td>{day.isHoliday ? '祝' : day.dayOfWeek}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
  main {
    text-align: center;
  }

  .title {
    font-size: 2rem;
    border: none;
    width: calc(100% - 200px);
    text-align: center;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
    margin: auto;
  }

  .with-notes {
    font-weight: bold;
  }

  .weekend {
    background-color: #ffd;
  }

  .today {
    border: 3px solid #5b1919;
  }

  .holiday {
    background-color: #fce;
  }

  td {
    border: 1px solid #ccc;
  }

  td:not(:first-of-type) {
    padding: 0 0.5rem;
    text-align: center;
  }

  tr:first-of-type td:nth-of-type(3) {
    padding: 0;
  }

  tr:first-of-type td:nth-of-type(3) input {
    margin: 0;
    border: none;
    width: 100%;
    background-color: transparent;
  }

  td:first-of-type input {
    margin: 0;
    border: none;
    background-color: transparent;
    width: 20em;
  }
</style>
