<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { SvelteToast, toast } from '@zerodevx/svelte-toast';
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
    notes: Object.fromEntries(notes.flatMap((n, i) => (n.trim() ? [[i, encodeURIComponent(n.trim())]] : []))),
  };

  let mounted = false;
  $: if (mounted) {
    location.hash = btoa(JSON.stringify(state));
  }

  let holidays = new Set();

  let showHelp = false;

  onMount(() => {
    if (location.hash) {
      try {
        const restoredState: typeof state = JSON.parse(atob(location.hash.slice(1)));
        title = decodeURIComponent(restoredState.title);
        originDate = new Date(restoredState.originDate);
        notes = Object.entries(restoredState.notes).reduce(
          (acc, [i, n]) => {
            acc[Number.parseInt(i)] = decodeURIComponent(n);
            return acc;
          },
          Array.from({ length: 52 }, () => ''),
        );
      } catch (e) {
        toast.push('URLに問題があるためデータを読み込めませんでした');
        console.error(e);
      }
    }

    fetch('https://holidays-jp.github.io/api/v1/date.json')
      .then((res) => res.json())
      .then((res) => (holidays = new Set(Object.keys(res))))
      .catch((e) => {
        toast.push('祝日のデータを読み込めませんでした');
        console.error(e);
      });

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
          class:with-notes={notes[i].trim()}
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

<button class="help" title="ヘルプを表示する" on:click={() => (showHelp = !showHelp)}>?</button>
<button class="clear" title="全部消す" on:click={() => ((location.hash = ''), location.reload())}>×</button>

{#if showHelp}
  <nav transition:fade>
    <h1>使い方</h1>
    <ol>
      <li>表の1行目の日付をクリックして起算日を設定します</li>
      <li>表の各行にある自由記入欄に自由にメモを書きます</li>
      <li>画面一番上のタイトル部分をクリックしてタイトルを書きます</li>
      <li>このページのURLをコピペして共有すると相手も同じカレンダーを見ることができます</li>
    </ol>
    <h1>仕組み</h1>
    <p>
      日付やメモ、タイトルのデータはあなたのパソコンやオンラインのサーバー上に保存されるの<strong>ではなく</strong
      >、URLの一部に暗号のような形で埋め込まれています。従って、もしカレンダーに変更を加えると、URLは変化してしまうため、再度相手にURLを共有してあげる必要があります。
    </p>
    <p>祝日のデータは<a href="https://holidays-jp.github.io/">Holidays JP API</a>から取得しています。</p>
    <p class="right"><a href="https://twitter.com/p_km">私が作りました <img src="me.svg" alt="私" /></a></p>
    <p><a href="https://github.com/kissge/kijitsu">source (GitHub)</a></p>
    <button on:click={() => (showHelp = !showHelp)}>とじる</button>
  </nav>
{/if}

<SvelteToast />

<style>
  main {
    padding-bottom: 3rem;
    text-align: center;
  }

  .title {
    width: calc(100% - 200px);
    border: none;
    text-align: center;
    font-size: 2rem;
  }

  table {
    margin: auto;
    border-spacing: 0;
    border-collapse: collapse;
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
    width: 100%;
    border: none;
    background-color: transparent;
  }

  td:first-of-type input {
    margin: 0;
    width: 20em;
    border: none;
    background-color: transparent;
  }

  button.help,
  button.clear {
    position: absolute;
    right: 20px;
    width: 30px;
    height: 30px;
    border-radius: 30px;
  }

  button.help {
    top: 20px;
  }

  button.clear {
    top: 60px;
  }

  nav {
    position: fixed;
    top: 50vh;
    left: 50vw;
    padding: 2em;
    min-width: 320px;
    background: #fcfdfd;
    box-shadow: 0 0 3px #00000044;
    transform: translate(-50%, -50%);
  }

  nav .right {
    float: right;
    font-size: 0.5em;
  }

  nav img {
    width: 4em;
  }
</style>
