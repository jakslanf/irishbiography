<template>
  <div>
    <!-- <img :src=posts.results.bindings[2].photos.value width="200" height="200">
    <pre>{{posts.results.bindings[2].fullnamestring.value}}</pre> -->
    <Transition>
      <div v-if="isFetched">
        <button @click="isPopUp = true">Open Popup</button>
        <BiographyPopUp v-if="isPopUp" @close="togglePopUp">
          <h1>Lorem Ipsum</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent magna ipsum, tincidunt quis viverra vel,
            egestas et eros. Donec nec hendrerit erat, ut fringilla ipsum. Nam ipsum orci, rhoncus vel ullamcorper in,
            mattis eu sapien. Etiam vulputate porttitor quam, a bibendum diam ultricies non. Morbi egestas ex sed purus
            molestie, ac fringilla erat interdum. Nunc augue lacus, tempus eget ultrices quis, semper non nisl. Aenean
            sed sollicitudin lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
            egestas. Etiam neque est, lacinia ut metus vel, molestie tempor massa. Sed et ante sit amet metus fermentum
            hendrerit eu eget neque. Cras maximus, odio in pharetra fringilla, tortor massa imperdiet purus, eu luctus
            elit lorem sit amet ipsum. Pellentesque eget nibh ac diam porta vulputate eget vitae lectus. Nulla varius
            fermentum arcu, sed ultrices magna maximus sed.</p>
        </BiographyPopUp>
        <div id="dash">
          <div id="individual" v-for="item in posts.results.bindings">
            <BiographyItem @click="getPopUp(item)" :full-name="item.fullnamestring.value" :photo="item.photos.value"/>
          </div>
        </div>
      </div>
      <h1 v-else>Loading...</h1>
    </Transition>
  </div>
</template>

<script>
import BiographyItem from "@/components/BiographyItem.vue";
import axios from 'axios';
import BiographyPopUp from "@/components/BiographyPopUp.vue";
import {ref} from "vue";


export default {
  components: {BiographyPopUp, BiographyItem},
  data() {
    let posts = [];
    return {
      BiographyPopUp,
      isPopUp: false,
      isFetched: false,
      offset: 0,
      posts: [],
      errors: []
    }
  }, methods: {
    getPopUp(item) {
      console.log(item.fullnamestring.value)
      this.togglePopUp()
    },
    togglePopUp() {
      this.isPopUp = !this.isPopUp
    }
  },

  // Fetches posts when the component is created.
  async created() {
    try {
      console.log("zowee")
      const response = await axios.post(
          'http://localhost:80/blazegraph/namespace/BeyondSample/sparql/',
          new URLSearchParams({
            'query': 'PREFIX cidoc: <http://erlangen-crm.org/current/>\n' +
                'PREFIX b2022: <https://ont.virtualtreasury.ie/ontology#>\n' +
                'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>\n' +
                'PREFIX owl:<http://www.w3.org/2002/07/owl#>\n' +
                'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
                'SELECT ?diburi ?vturi ?name ?fullnamestring ?wikientity (GROUP_CONCAT(DISTINCT ?photo; SEPARATOR=", ") AS ?photos)\n' +
                'WHERE\n' +
                '{\n' +
                '  {SELECT ?diburi ?vturi ?name ?fullnamestring ?wikientity\n' +
                '  WHERE{\n' +
                '  ?diburi cidoc:P71_lists ?vturi.\n' +
                '  ?diburi cidoc:P2_has_type b2022:DIB.\n' +
                '  ?vturi cidoc:P1_is_identified_by ?name.\n' +
                '  ?name rdfs:label ?fullname.\n' +
                '  ?vturi owl:sameAs ?wikientity.\n' +
                '  FILTER(CONTAINS(?fullnamestring, ", ")).\n' +
                '  BIND(REPLACE(STR(?fullname), "\\\\(|\\\\)", "", "i") AS ?fullnamestring).\n' +
                '  FILTER(regex(str(?diburi), "www.dib.ie" ) ).\n' +
                '  }ORDER BY(UCASE(str(?fullnamestring)))\n' +
                'LIMIT 12\n' +
                'OFFSET 0}\n' +
                '  SERVICE <https://query.wikidata.org/sparql>{OPTIONAL {?wikientity  wdt:P18 ?photo.}}\n' +
                '} GROUP BY ?diburi ?vturi ?name ?fullnamestring ?wikientity\n' +
                'ORDER BY(UCASE(str(?fullnamestring)))'
          }),
          {
            headers: {
              'Accept': 'application/json'
            }
          }
      );
      this.posts = response.data
      this.isFetched = true
    } catch (e) {
      this.errors.push(e)
    }
  },
}
</script>

<style scoped>
#dash {
  background-color: green;
  height: 900px;
  width: 1000px;
  padding: 10px;
  float: left;

}

#individual {
  background-color: #5A5A5A;
  width: 230px;
  height: 250px;
  float: left;
  padding: 10px;
  margin-right: 15px;
  margin-bottom: 15px;
  border-radius: 25px;
  word-wrap: normal;
  text-align: center;
  transition: transform .2s; /* Animation */
}

#individual:hover {
  transform: scale(1.1); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
}

.v-enter-active,
.v-leave-active {
  transition: opacity 2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>