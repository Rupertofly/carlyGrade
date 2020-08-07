<script lang="ts">
  import { type } from 'os';

  export let q = 'blah blah';
  export let a = 'eyy';
  export let b = 'neyy';
  export let result: (t: string) => void = (a) => console.log(a);
</script>

<style>
  form {
    display: grid;
    padding: 0.5em;
    border-radius: 0.5em;
    grid-template: auto auto / 1fr 1fr;
    font-family: 'Work Sans';
    grid-template-areas:
      'question question'
      'a b';
    border: 2px solid lightblue;
  }
  p {
    grid-area: question;
    justify-self: center;
    max-width: 30em;
  }
  input[type='button'] {
    font-family: 'Work Sans';
    max-width: 16em;
    min-height: 3em;
    min-width: 15em;
    border-radius: 0.5em;
    justify-self: center;
    transition: all 150ms;
    font-weight: 500;
    background-color: #c2d8f2;
  }
  input[type='button']:hover {
    transform: scale(1.05);
    box-shadow: 0.1em 0.1em 0.25em #2c313755;
    font-weight: 900;
  }
  #a {
    grid-area: a;
  }
  #b {
    grid-area: b;
  }
</style>

<form>
  <p>{q}</p>
  <input
    id="a"
    type="button"
    value={a}
    on:click={(e) => {
      result(a);
      e.target.blur();
    }} />
  <input
    id="b"
    type="button"
    value={b}
    on:click={(e) => {
      result(b);
      e.target.blur();
    }} />

</form>
