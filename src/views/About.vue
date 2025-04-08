<template>
  <div class="about">
    <h1>About</h1>
    <Soulution />
    <p>I have never diagonally traversed an array before...</p>
    <Note v-for="(note, index) in notes" :key="`note-${index}`" :note="note" />
    <p>I was able to turn the data set into a single string and only loop the 'Words' in order to find matches</p>
  </div>
</template>

<script>
import Note from "@/components/Note.vue";
import Soulution from "@/components/Solution.vue";

export default {
  name: "about",
  components: {
    Note,
    Soulution,
  },
  data() {
    return {
      notes: [
        {
          caption: "First Thoughts",
          file: "0-initial",
          foot:
            "After thinking about the problem for a while, I decided that the most efficient way would be traversing a square array",
        },
        {
          caption: "On Second Thought",
          file: "1-second-thought",
          foot: `On the left I thought about traversing the array in up to three different sections, which when I started coding it I found it to be pretty complex.
            Then in the middle I started thinking maby I could just pass over the array...
            `,
        },
        {
          caption: "Minimizing...",
          file: "2-pass-through",
          foot:
            "At this point I had written a Matrix class that could translate and pad the array. So I started coding.",
        },
        {
          caption: "Finding the Match Indices",
          file: "3-pt",
          foot:
            "Now that I was finding matches, I saw how the problem grew as I hadn't started the reverse matching or the other diagonal direction yet",
        },
        {
          caption: "More calculating...",
          file: "4-pt",
          foot: "",
        },
        {
          caption: "...Ok, It's getting complicated",
          file: "5-pt",
          foot: "",
        },
        {
          caption: "Second Look at 3 Part Loop",
          file: "6-option-2",
          foot:
            "I jotted down how to get the diagonals using up to three loops. Then I started thinking about getting the other diagonal direction along with reverse matching, that seemed like a lot of code.",
        },
        {
          caption: "Back to the Square",
          file: "7-sq-revisit",
          foot:
            "At this point the square method seemed like the simplest method, so I revisited it.",
        },
        {
          caption: "Back to the Drawing Board",
          file: "8-drawing-board",
          foot:
            "After pondering the square, I thought there has to be a better way. I rethought the problem and decided to get the diagonals on the way up and the rest going across. This seemed viable and I got it down to 2 outter loops each with a sub loop - but this still didn't make finding both diagonals matching forward and reverse any easier...",
        },
        {
          caption: "...Eureka!",
          file: "9-Voila",
          foot:
            "I started thinking about an 'L' shaped loop when I thought to myself: 'What if I just do a standard loop an put the diagonal values into a pre determined collection'. After drawing several arms a very simple pattern emerged",
        },
        {
          caption: "That was it..",
          file: "10-v",
          foot:
            "This method made it so I only had to do one nested loop the get both sets of diagonals",
        },
        {
          caption: "Now I can reuse code",
          file: "11-v",
          foot:
            "I was able to pad both diagonal arrays and use the same class I used to find horizontal matches",
        },
        {
          caption: "Get the Indices",
          file: "12-v-final",
          foot:
            "Once I got all the match indices, I just had to convert the horizontal matches to diagonal match indices",
        },
      ],
    };
  },
};
</script>

<style lang="css" scoped>
.about {
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  align-items: center;
}
</style>
